import type { FindLetterSettings } from './settings.svelte';

/**
 * טבלת מיפוי סטטית: שם קבוצה → מזהי אותיות.
 * מפורשת כדי שה-migration יהיה דטרמיניסטי גם אם המאגר ישתנה בעתיד.
 */
const GROUP_TO_IDS: Record<string, string[]> = {
	base: ['a', 'ba', 'ga', 'da', 'ha', 'va', 'za', 'cha', 'ta', 'ya', 'ka', 'la', 'ma', 'na', 'sa', 'pa', 'tza', 'qa', 'ra', 'sha', 'tav'],
	confusing: ['sa_sin', 'aa'],
	rafe: ['va_rafe', 'cha_rafe', 'fa_rafe'],
};

/**
 * רשימת VowelCode-ים שהוסרו ושצריך לסנן מ-`selectedVowels` של משתמשים קיימים.
 * תוסיף לכאן כשמסירים עוד ניקודים בעתיד.
 */
const REMOVED_VOWELS = new Set(['hataf-patah', 'hataf-segol']);

/**
 * מסנן ניקודים שהוסרו ממערכת הניקודים מתוך selectedVowels.
 * אם אחרי הסינון לא נשאר כלום — חוזרים ל-['patah'] (ברירת מחדל בטוחה).
 */
function stripRemovedVowels(raw: unknown): string[] {
	if (!Array.isArray(raw)) return ['patah'];
	const filtered = raw.filter(
		(v): v is string => typeof v === 'string' && !REMOVED_VOWELS.has(v),
	);
	return filtered.length > 0 ? filtered : ['patah'];
}

/**
 * ממיר הגדרות גולמיות (מ-localStorage) לאובייקט הגדרות תקני.
 * מטפל ב-migration:
 *   - v2 (activeGroups) → v5 (selectedLetterIds + selectedVowels בלי חטפים)
 *   - v3 (selectedLetterIds) → v5
 *   - v4 (כולל חטפים) → v5 (סינון hataf-patah / hataf-segol)
 *   - v5 → מחזיר כמו שהוא
 *
 * מחזיר Partial — הקוראים ישלימו ברירות מחדל לשדות חסרים.
 */
export function migrateSettings(raw: unknown): Partial<FindLetterSettings> {
	if (!raw || typeof raw !== 'object') return {};
	const r = raw as Record<string, unknown>;

	// גרסה 5 — selectedLetterIds + selectedVowels (בלי חטפים) — מחזיר כמו שהוא
	if (r.schemaVersion === 5) {
		return r as Partial<FindLetterSettings>;
	}

	// גרסה 4 — selectedVowels אולי מכיל חטף-פתח/חטף-סגול → מסנן ומעלה ל-v5
	if (r.schemaVersion === 4) {
		return {
			...r,
			selectedVowels: stripRemovedVowels(r.selectedVowels),
			schemaVersion: 5,
		} as Partial<FindLetterSettings>;
	}

	// גרסה 3 — selectedLetterIds ישירות → שדרג ל-v5 עם selectedVowels
	if (r.schemaVersion === 3) {
		return {
			...r,
			selectedVowels: ['patah'],
			schemaVersion: 5,
		} as Partial<FindLetterSettings>;
	}

	// גרסה 2 — activeGroups, ממירים ל-selectedLetterIds → שדרג ל-v5
	if (r.schemaVersion === 2 || Array.isArray(r.activeGroups)) {
		const groups: string[] = Array.isArray(r.activeGroups) ? r.activeGroups : ['base'];
		const selectedLetterIds = groups.flatMap(g => GROUP_TO_IDS[g] ?? []);
		const { activeGroups: _removed, ...rest } = r as Record<string, unknown>;
		return {
			...rest,
			selectedLetterIds,
			selectedVowels: ['patah'],
			schemaVersion: 5,
		} as Partial<FindLetterSettings>;
	}

	// גרסה לא-ידועה או ללא גרסה
	return {};
}
