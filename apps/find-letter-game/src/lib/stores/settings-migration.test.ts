import { migrateSettings } from './settings-migration';

// בדיקה M1: migration מגרסה 2 עם base → 21 IDs
test('migration מגרסה 2 עם base → 21 IDs', () => {
	const result = migrateSettings({ schemaVersion: 2, activeGroups: ['base'] });
	expect(result.selectedLetterIds).toHaveLength(21);
	expect(result.selectedLetterIds).toContain('a');
	expect(result.selectedLetterIds).toContain('tav');
});

// בדיקה M2: migration מגרסה 2 עם כל הקבוצות → 26 IDs
test('migration מגרסה 2 עם כל הקבוצות → 26 IDs', () => {
	const result = migrateSettings({ schemaVersion: 2, activeGroups: ['base', 'confusing', 'rafe'] });
	expect(result.selectedLetterIds).toHaveLength(26);
});

// בדיקה M3: migration מגרסה 2 לא מחזיר activeGroups
test('migration מגרסה 2 לא מחזיר activeGroups', () => {
	const result = migrateSettings({ schemaVersion: 2, activeGroups: ['base'] }) as Record<string, unknown>;
	expect(result.activeGroups).toBeUndefined();
});

// בדיקה M4: migration מגרסה 3 מחזיר selectedLetterIds כמו שהוא
test('migration מגרסה 3 מחזיר selectedLetterIds כמו שהוא', () => {
	const result = migrateSettings({ schemaVersion: 3, selectedLetterIds: ['a', 'ba'] });
	expect(result.selectedLetterIds).toEqual(['a', 'ba']);
});

// בדיקה M5: migration על null מחזיר אובייקט ריק
test('migration על null מחזיר אובייקט ריק', () => {
	expect(migrateSettings(null)).toEqual({});
	expect(migrateSettings('bad')).toEqual({});
	expect(migrateSettings(undefined)).toEqual({});
});

// === Sub-phase 1.3: Tests חדשים ל-v3→v4 ===

// בדיקה M6: migration מגרסה 3 → v4: מוסיף selectedVowels=['patah'] ו-schemaVersion=4
test('migration מגרסה 3 → v4: מוסיף selectedVowels ו-schemaVersion=4', () => {
	const result = migrateSettings({ schemaVersion: 3, selectedLetterIds: ['ba', 'ga'] });
	expect((result as Record<string, unknown>).selectedVowels).toEqual(['patah']);
	expect((result as Record<string, unknown>).schemaVersion).toBe(4);
});

// בדיקה M7: migration מגרסה 4 → מחזיר כמו שהוא
test('migration מגרסה 4 → מחזיר selectedLetterIds וselectedVowels כמו שהם', () => {
	const result = migrateSettings({
		schemaVersion: 4,
		selectedLetterIds: ['ba', 'ga'],
		selectedVowels: ['patah']
	});
	expect(result.selectedLetterIds).toEqual(['ba', 'ga']);
	expect((result as Record<string, unknown>).selectedVowels).toEqual(['patah']);
});

// בדיקה M8: migration מגרסה 2 עם base → schemaVersion=4 ו-selectedVowels=['patah']
test('migration מגרסה 2 עם base → schemaVersion=4 ו-selectedVowels', () => {
	const result = migrateSettings({ schemaVersion: 2, activeGroups: ['base'] }) as Record<string, unknown>;
	expect(result.schemaVersion).toBe(4);
	expect(result.selectedVowels).toEqual(['patah']);
	expect(result.activeGroups).toBeUndefined();
});

// בדיקה M9 — edge case: legacy v2 עם activeGroups=['base'] → selectedVowels=['patah'] ו-schemaVersion=4
test('legacy v2 עם activeGroups=[base] → selectedVowels=[patah] ו-schemaVersion=4', () => {
	const result = migrateSettings({
		schemaVersion: 2,
		activeGroups: ['base'],
		gridSize: '3x4',
		avoidSimilar: true
	}) as Record<string, unknown>;
	expect(result.selectedVowels).toEqual(['patah']);
	expect(result.schemaVersion).toBe(4);
	expect(result.selectedLetterIds).toHaveLength(21);
	// שדות נוספים נשמרים
	expect(result.gridSize).toBe('3x4');
});
