/**
 * Regression test לתיקון 2026-05-17 — DataCloneError ב-cloneConfig של הקיט.
 *
 * הבאג: הוגדר `toJSON()` בתוך ה-`$state({...})` של ה-store. ה-method
 * הזה נכלל ב-snapshot שה-$effect שלח ל-`updateGameSettings` של הקיט.
 * `cloneConfig` בקיט משתמש ב-`structuredClone` שלא יודע לשכפל פונקציות,
 * אז הוא נכשל ב-`DataCloneError` והפרופיל לא הסתנכרן.
 *
 * תוצאה: שינויי המשתמש בהגדרות לא נשמרו בפרופיל. בריענון — defaults.
 *
 * הטסט שומר ש:
 *   1. ה-`settings` object לא חושף `toJSON` method
 *   2. `dataSnapshot()` מחזיר plain object עם DATA_KEYS בלבד
 *   3. תוצאת `dataSnapshot()` עוברת `structuredClone` ללא חריגה
 *   4. כל הערכים בתוצאה הם primitives או plain arrays (לא proxies)
 */

import { describe, it, expect } from 'vitest';
import {
	settings,
	dataSnapshot,
	DEFAULT_SETTINGS,
	type FindLetterSettings,
} from './settings.svelte';

describe('settings snapshot — regression for DataCloneError', () => {
	it('ה-$state object לא חושף `toJSON` method (אסור! גורם ל-state_snapshot_uncloneable)', () => {
		// אם מישהו יחזיר את ה-toJSON ל-$state literal, הטסט הזה ייכשל ויעצור regression.
		expect('toJSON' in settings).toBe(false);
		expect(Object.keys(settings)).not.toContain('toJSON');
	});

	it('dataSnapshot מחזיר אובייקט עם כל ה-DATA_KEYS בלבד (בלי getters)', () => {
		const snap = dataSnapshot();
		const keys = Object.keys(snap).sort();
		const expected = Object.keys(DEFAULT_SETTINGS).sort();
		expect(keys).toEqual(expected);

		// מוודא במפורש שאין getters שזלגו ל-snapshot
		expect(keys).not.toContain('totalCellsInGrid');
		expect(keys).not.toContain('effectiveQuestionsPerBoard');
		expect(keys).not.toContain('totalQuestionsPerSet');
		expect(keys).not.toContain('toJSON');
	});

	it('dataSnapshot עובר structuredClone בלי לזרוק (זה המבחן האמיתי!)', () => {
		const snap = dataSnapshot();
		// אם dataSnapshot החזיר אובייקט עם method/getter/proxy — structuredClone יזרוק
		expect(() => structuredClone(snap)).not.toThrow();

		// וההעתק שווה לערך המקורי
		const cloned = structuredClone(snap);
		expect(cloned).toEqual(snap);
	});

	it('dataSnapshot לא מחזיר proxy של $state עבור arrays — array זה plain', () => {
		const snap = dataSnapshot();
		// אם נחזיר את ה-array של $state ישירות, structuredClone היה נכשל.
		// ה-dataSnapshot עושה [...arr] כדי לפרק את ה-proxy.
		expect(Array.isArray(snap.selectedLetterIds)).toBe(true);
		// וודא שהוא לא אותו reference כמו במקור (היה אמור להיות העתק)
		expect(snap.selectedLetterIds).not.toBe(settings.selectedLetterIds);
		// אבל התוכן זהה
		expect(snap.selectedLetterIds).toEqual([...settings.selectedLetterIds]);
	});

	it('dataSnapshot עוקב אחר שינויים ב-$state — קריאה אחרי mutation מחזירה ערך עדכני', () => {
		const before = dataSnapshot();
		const originalGridSize = before.gridSize;

		// שנה את ה-$state
		const newSize: FindLetterSettings['gridSize'] = originalGridSize === '4x4' ? '2x3' : '4x4';
		settings.gridSize = newSize;

		const after = dataSnapshot();
		expect(after.gridSize).toBe(newSize);

		// החזר למצב המקורי כדי לא להשפיע על טסטים אחרים
		settings.gridSize = originalGridSize;
	});

	it('JSON.stringify של dataSnapshot מחזיר JSON תקין שניתן ל-parse', () => {
		const snap = dataSnapshot();
		const json = JSON.stringify(snap);
		expect(() => JSON.parse(json)).not.toThrow();
		const parsed = JSON.parse(json);
		expect(parsed).toEqual(snap);
	});
});
