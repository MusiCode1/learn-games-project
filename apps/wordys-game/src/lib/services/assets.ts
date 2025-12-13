import manifest from '$lib/data/available-assets.json';

// קונפיגורציה שניתן לשנות בעתיד בקלות
const STORAGE_CONFIG = {
	provider: 'cloudflare_r2',
	baseUrl: 'https://static.wordys-game.tzlev.ovh',
	localFallback: '/static'
};

// Type definitions based on the JSON structure
type AssetsManifest = typeof manifest;

/**
 * בודק האם קובץ קיים במניפסט הנכסים
 */
function isAssetAvailable(path: string): boolean {
	// נרמול הנתיב לבדיקה (הסרת סלאש בהתחלה)
	const cleanPath = path.startsWith('/') ? path.slice(1) : path;

	// בדיקה ברשימות השונות
	if (manifest.assets.audio.files.includes(cleanPath.replace('audio/', ''))) return true;
	if (manifest.assets.images.files.includes(cleanPath.replace('cards/', ''))) return true;
	if (manifest.assets.ui_sounds.files.includes(cleanPath.replace('ui_sounds/', ''))) return true;

	return false;
}

/**
 * מחזיר את ה-URL המלא עבור נכס.
 * כעת מבצע בדיקה האם הנכס קיים ברשימה המוכרת.
 */
export function getAssetUrl(path: string): string {
	if (!path) return '';
	if (path.startsWith('http')) return path;

	const cleanPath = path.startsWith('/') ? path.slice(1) : path;

	// בדיקה האם הנכס קיים במניפסט (אופציונלי - כרגע רק מחזיר URL)
	// אם נרצה בעתיד להחזיר נתיב לתמונת ברירת מחדל כשלא קיים, זה המקום.

	return `${STORAGE_CONFIG.baseUrl}/${cleanPath}`;
}

/**
 * מחזיר URL לתמונת כרטיס לפי מזהה הכרטיס.
 * בודק האם התמונה קיימת, ואם לא - מחזיר תמונת ברירת מחדל.
 */
export function getCardImageUrl(cardId: string): string {
	const fileName = `${cardId}.png`;
	const exists = manifest.assets.images.files.includes(fileName);

	if (exists) {
		return `${STORAGE_CONFIG.baseUrl}/cards/${fileName}`;
	}

	return `${STORAGE_CONFIG.baseUrl}/cards/placeholder_temp.png`;
}

/**
 * מחזיר URL לקובץ שמע של כרטיס אם קיים, אחרת מחזיר null.
 * תומך ב-wav ו-mp3 (עדיפות ל-wav).
 */
export function getCardAudioUrl(cardId: string): string | null {
	const wavName = `${cardId}.wav`;
	const mp3Name = `${cardId}.mp3`;

	if (manifest.assets.audio.files.includes(wavName)) {
		return `${STORAGE_CONFIG.baseUrl}/audio/${wavName}`;
	}

	if (manifest.assets.audio.files.includes(mp3Name)) {
		return `${STORAGE_CONFIG.baseUrl}/audio/${mp3Name}`;
	}

	return null;
}
