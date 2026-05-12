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
