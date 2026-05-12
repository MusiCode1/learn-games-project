/**
 * שירות TTS — שולף קבצי MP3 מ-CDN סטטי (R2) במקום סינתזה חיה.
 *
 * זרימה:
 *   1. `speak(text)` → חיפוש ב-`TTS_FILES` (ב-`letters.ts`) → שם קובץ.
 *   2. אם נמצא: fetch מ-`${VITE_STATIC_BASE_URL}/shared/tts/find-letter/<file>`,
 *      cache ב-IndexedDB, ניגון.
 *   3. אם לא נמצא או fetch נכשל: console.error + fallback ל-Web Speech.
 *
 * הקבצים אוחסנו ידנית ב-R2 אחרי אישור איכותי של כל אות.
 * אין יותר סינתזה אוטומטית — אם כרטיס חדש מציג טקסט שלא במיפוי,
 * צריך להעלות לו קובץ ידנית ולהוסיף ערך ל-`TTS_FILES`.
 */

import { get, set, createStore } from 'idb-keyval';
import { getTtsFilename } from './letters';

const LANG = 'he-IL';
const CACHE_PREFIX = 'audio:';
const STATIC_PATH = '/shared/tts/find-letter';

// ===== Cache (IndexedDB) =====

let _store: ReturnType<typeof createStore> | undefined;
function getStore() {
	if (!_store) _store = createStore('find-letter-tts-cache', 'keyval');
	return _store;
}

function getStaticBaseUrl(): string {
	return import.meta.env?.VITE_STATIC_BASE_URL || '';
}

// ===== שליפת אודיו מ-CDN =====

async function fetchStaticAudio(filename: string): Promise<Blob> {
	const store = getStore();
	const cacheKey = CACHE_PREFIX + filename;

	// L1 hit מתוך IndexedDB
	const cached = await get<Blob>(cacheKey, store);
	if (cached) return cached;

	const baseUrl = getStaticBaseUrl();
	if (!baseUrl) throw new Error('VITE_STATIC_BASE_URL is not configured');

	const url = `${baseUrl}${STATIC_PATH}/${filename}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Static TTS fetch failed ${res.status}: ${url}`);
	}
	const blob = await res.blob();

	// שמירה ב-cache לפעמים הבאות
	await set(cacheKey, blob, store);

	return blob;
}

// ===== ניגון =====

let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio(): void {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio = null;
	}
}

async function playAudioBlob(blob: Blob): Promise<void> {
	stopCurrentAudio();
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	currentAudio = audio;

	return new Promise<void>((resolve) => {
		const cleanup = () => {
			URL.revokeObjectURL(url);
			if (currentAudio === audio) currentAudio = null;
			resolve();
		};
		audio.onended = cleanup;
		audio.onerror = cleanup;
		audio.play().catch(cleanup);
	});
}

// ===== Web Speech fallback =====

/**
 * Fully Kiosk חושף `window.fully.textToSpeech` — מסוג מוגדר ע"י החבילה
 * `fully-kiosk-js` (transitive dep של learn-booster-kit). אין צורך להצהיר כאן.
 */
function speakWebSpeech(text: string): void {
	// Fully Kiosk מקבל עדיפות
	if (typeof window !== 'undefined' && (window as { fully?: { textToSpeech: (t: string) => void } }).fully) {
		(window as { fully: { textToSpeech: (t: string) => void } }).fully.textToSpeech(text);
		return;
	}
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.lang = LANG;
	u.rate = 0.85;
	u.pitch = 1.05;
	window.speechSynthesis.speak(u);
}

// ===== API ציבורי =====

/**
 * השמעת טקסט בעברית: מחפש קובץ סטטי מתאים ב-CDN, ובכישלון נופל
 * ל-Web Speech API של הדפדפן.
 */
export async function speak(text: string): Promise<void> {
	if (typeof window === 'undefined') return;

	const trimmed = text.trim();
	if (!trimmed) return;

	const filename = getTtsFilename(trimmed);
	if (!filename) {
		console.error(`[tts] אין קובץ סטטי ממופה לטקסט: "${trimmed}". נופל ל-Web Speech.`);
		speakWebSpeech(trimmed);
		return;
	}

	try {
		const blob = await fetchStaticAudio(filename);
		await playAudioBlob(blob);
	} catch (e) {
		console.error(`[tts] שליפה מ-CDN נכשלה ל-${filename}:`, e);
		speakWebSpeech(trimmed);
	}
}

/**
 * האם TTS נתמך בכלל (יש או base URL סטטי או Web Speech)
 */
export function ttsSupported(): boolean {
	if (typeof window === 'undefined') return false;
	return Boolean(getStaticBaseUrl()) || 'speechSynthesis' in window;
}
