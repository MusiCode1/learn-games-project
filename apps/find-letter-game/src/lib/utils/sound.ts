/**
 * שירות סאונד למשחק "איפה האות?".
 *
 * הצלילים נטענים מ-Cloudflare R2 CDN המשותף (`static.tzlev.ovh`),
 * תחת התיקייה `shared/sounds/` שמשמשת את כל המשחקים במונורפו.
 *
 * נתיב הבסיס מגיע מהמשתנה `VITE_STATIC_BASE_URL` ב-`.env` של המונורפו.
 * אם המשתנה חסר — נופלים לדומיין ברירת המחדל כדי שהמשחק לא יישבר.
 *
 * הקבצים נשמרים בתוך הסקריפט `scripts/sync-assets.js`:
 *   1. משימים את הקובץ תחת `assets/shared/sounds/<name>` במונורפו.
 *   2. מריצים `bun run sync:assets` בשורש — מעלה ל-R2.
 */

const STATIC_BASE_URL: string =
	(import.meta.env?.VITE_STATIC_BASE_URL as string | undefined) ?? 'https://static.tzlev.ovh';

/** גרסת assets לcache-busting — לעדכון כשמחליפים קובץ צליל. */
const ASSETS_VERSION = 'v1';

/** בנייה של URL מלא לקובץ סאונד משותף. */
function soundUrl(filename: string): string {
	return `${STATIC_BASE_URL}/shared/sounds/${filename}?${ASSETS_VERSION}`;
}

type SoundType = 'success' | 'error';

const sounds: Record<SoundType, HTMLAudioElement | null> = {
	success: null,
	error: null
};

if (typeof window !== 'undefined') {
	sounds.success = new Audio(soundUrl('success.mp3'));
	sounds.error = new Audio(soundUrl('error.wav'));
}

function play(type: SoundType): void {
	const audio = sounds[type];
	if (!audio) return;
	audio.currentTime = 0;
	audio.play().catch((e) => console.warn(`[sound] failed to play ${type}`, e));
}

/** צליל הצלחה — לוחץ נכון על האות הנכונה */
export const playSuccess = () => play('success');

/** צליל שגיאה — לוחץ על אות לא נכונה */
export const playError = () => play('error');

/**
 * צליל ניצחון — אחרי N הצלחות (לפני triggerReward).
 * משתמש באותו צליל כמו `playSuccess` (אין צורך בקובץ נפרד).
 */
export const playWin = playSuccess;
