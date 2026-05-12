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
 * ממיר הגדרות גולמיות (מ-localStorage) לאובייקט הגדרות תקני.
 * מטפל ב-migration מגרסה 2 (activeGroups) לגרסה 3 (selectedLetterIds).
 * מחזיר Partial — הקוראים ישלימו ברירות מחדל לשדות חסרים.
 */
export function migrateSettings(raw: unknown): Partial<FindLetterSettings> {
	if (!raw || typeof raw !== 'object') return {};
	const r = raw as Record<string, unknown>;

	// גרסה 3 — selectedLetterIds ישירות
	if (r.schemaVersion === 3) {
		return r as Partial<FindLetterSettings>;
	}

	// גרסה 2 — activeGroups, ממירים ל-selectedLetterIds
	if (r.schemaVersion === 2 || Array.isArray(r.activeGroups)) {
		const groups: string[] = Array.isArray(r.activeGroups) ? r.activeGroups : ['base'];
		const selectedLetterIds = groups.flatMap(g => GROUP_TO_IDS[g] ?? []);
		const { activeGroups: _removed, ...rest } = r as Record<string, unknown>;
		return { ...rest, selectedLetterIds } as Partial<FindLetterSettings>;
	}

	// גרסה לא-ידועה או ללא גרסה
	return {};
}
