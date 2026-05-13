/**
 * שירות לשמירת תמונות מותאמות לכרטיסים ב-IndexedDB.
 *
 * ארכיטקטורה:
 * - IndexedDB: `wordys-game-images` / object store `cards`, key=cardId, value={id, blob, savedAt}.
 * - Cache תגובתי (`SvelteMap`) — מפתח=cardId, ערך=blob: URL או null אם לא נטען / לא קיים.
 * - `get(cardId)` תגובתי: מחזיר URL מיידי אם בקאש; אחרת מתחיל טעינה אסינכרונית ומחזיר null
 *   (כשהטעינה מסתיימת, ה-Map מתעדכן וה-Svelte מבצע re-render אוטומטית).
 * - blob: URLs נוצרים פעם אחת לכל כרטיס ושומרים בקאש; revocation רק כשמשנים/מוחקים.
 *
 * הערה חשובה: חובה להשתמש ב-`SvelteMap` (לא `$state(new Map())`), אחרת
 * פעולות `.set`/`.delete` לא יטריגרו re-render בקומפוננטות הצרכניות.
 */

import { SvelteMap, SvelteSet } from 'svelte/reactivity';

const DB_NAME = 'wordys-game-images';
const DB_VERSION = 1;
const STORE_NAME = 'cards';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
	if (typeof indexedDB === 'undefined') {
		return Promise.reject(new Error('IndexedDB not available (SSR?)'));
	}
	if (!dbPromise) {
		dbPromise = new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = () => {
				const db = req.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				}
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}
	return dbPromise;
}

async function dbGet(cardId: string): Promise<Blob | null> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const store = tx.objectStore(STORE_NAME);
		const req = store.get(cardId);
		req.onsuccess = () => {
			const entry = req.result as { id: string; blob: Blob; savedAt: number } | undefined;
			resolve(entry?.blob ?? null);
		};
		req.onerror = () => reject(req.error);
	});
}

async function dbPut(cardId: string, blob: Blob): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const req = store.put({ id: cardId, blob, savedAt: Date.now() });
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

async function dbDelete(cardId: string): Promise<void> {
	const db = await getDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const store = tx.objectStore(STORE_NAME);
		const req = store.delete(cardId);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

/** מצב פנימי של הקאש (תגובתי דרך SvelteMap). */
const cache = new SvelteMap<string, string | null>();
const inFlight = new SvelteSet<string>();

function revoke(cardId: string) {
	const url = cache.get(cardId);
	if (url) URL.revokeObjectURL(url);
	cache.delete(cardId);
}

export const cardImageStore = {
	/**
	 * מחזיר blob: URL לתמונה (תגובתי).
	 * - אם בקאש → מחזיר מיד.
	 * - אחרת → מתחיל טעינה אסינכרונית ומחזיר null. כשהטעינה מסתיימת,
	 *   הקאש מתעדכן והקומפוננטה הקוראת תרונדר מחדש אוטומטית.
	 * - אם אין תמונה לכרטיס ב-IDB → הקאש יישאר עם null לכרטיס הזה.
	 */
	get(cardId: string): string | null {
		if (cache.has(cardId)) return cache.get(cardId)!;

		// SSR / סביבה ללא IndexedDB → אין מה לטעון. לא שומרים בקאש כי בריצה הבאה
		// בצד לקוח כן ננסה.
		if (typeof indexedDB === 'undefined') return null;

		// מציין שטעינה התחילה (כדי לא לטעון פעמיים) ומחזיר null זמני.
		if (inFlight.has(cardId)) return null;
		inFlight.add(cardId);

		dbGet(cardId)
			.then((blob) => {
				if (blob) {
					cache.set(cardId, URL.createObjectURL(blob));
				} else {
					// סימון שאין תמונה — מונע ניסיונות חוזרים
					cache.set(cardId, null);
				}
			})
			.catch((e) => {
				console.error(`Failed to load custom image for card ${cardId}`, e);
				cache.set(cardId, null);
			})
			.finally(() => inFlight.delete(cardId));

		return null;
	},

	/**
	 * שומר תמונה חדשה לכרטיס (Blob/File). מחליף תמונה קיימת אם יש.
	 */
	async save(cardId: string, blob: Blob): Promise<void> {
		await dbPut(cardId, blob);
		// revoke הישן (אם קיים) ויצירת URL חדש
		revoke(cardId);
		cache.set(cardId, URL.createObjectURL(blob));
	},

	/**
	 * מוחק תמונה לכרטיס (כשמוחקים את הכרטיס עצמו).
	 */
	async remove(cardId: string): Promise<void> {
		await dbDelete(cardId);
		revoke(cardId);
		// סימון שאין תמונה — לא רוצים שניסיון get יחזור ל-IDB שוב
		cache.set(cardId, null);
	},

	/**
	 * בודק האם לכרטיס יש תמונה מותאמת (לפי הקאש בלבד — לא טוען מ-IDB אם לא בקאש).
	 * שימושי ל-UI כדי לדעת אם להציג כפתור "הסר תמונה" וכו'.
	 */
	hasCached(cardId: string): boolean {
		return cache.get(cardId) != null;
	}
};
