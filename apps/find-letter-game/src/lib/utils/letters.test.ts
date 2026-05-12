import { areSimilar, PHONETIC_SIMILARITY_PAIRS, VISUAL_SIMILARITY_PAIRS_FUTURE, pickBoard, ALL_LETTERS, ALL_LETTERS_ALPHABETICAL, DEFAULT_LETTER_IDS, getLettersByIds } from './letters';
import { vi } from 'vitest';

// בדיקה 1: regression — ס ↔ שׂ כבר צריכות לעבור לפני כל שינוי
test('ס ↔ שׂ נחשבות דומות (regression)', () => {
	expect(areSimilar('sa', 'sa_sin')).toBe(true);
});

// בדיקה 2: כל אות דומה לעצמה
test('אות דומה לעצמה', () => {
	expect(areSimilar('a', 'a')).toBe(true);
});

// בדיקה 3: אותיות לא-קשורות אינן נחשבות דומות
test('אותיות לא-קשורות אינן נחשבות דומות', () => {
	expect(areSimilar('ba', 'ga')).toBe(false);
});

// בדיקה 4: הדמיון הוא סימטרי — A↔B זהה ל-B↔A
test('הדמיון הוא סימטרי', () => {
	expect(areSimilar('sa_sin', 'sa')).toBe(true);
	expect(areSimilar('cha', 'cha_rafe')).toBe(true);
});

// בדיקה 5: צמדים צליליים חדשים — חייב להיות RED לפני הוספתם לקוד
test.each([
	['qa', 'ka'],   // ק ↔ כּ
	['a', 'ha'],    // א ↔ ה
	['aa', 'ha'],   // ע ↔ ה
	['sa', 'za'],   // ס ↔ ז
	['tza', 'ta'],  // צ ↔ ט
])('צמד צלילי חדש: %s ↔ %s נחשבים דומים', (a, b) => {
	expect(areSimilar(a, b)).toBe(true);
	expect(areSimilar(b, a)).toBe(true); // סימטריה
});

// בדיקה 6: צמדים ויזואליים — לא נחשבים דומים (צלילי-בלבד אחרי התיקון)
test.each([
	['ba', 'va_rafe'],   // בּ ↔ ב רפה — ויזואלי בלבד
	['ka', 'cha_rafe'],  // כּ ↔ כ רפה — ויזואלי בלבד
	['da', 'ra'],        // ד ↔ ר — ויזואלי בלבד
	['cha', 'ha'],       // ח ↔ ה — ויזואלי בלבד
	['va', 'za'],        // ו ↔ ז — ויזואלי בלבד
])('צמד ויזואלי: %s ↔ %s לא נחשבים דומים (צלילי-בלבד)', (a, b) => {
	expect(areSimilar(a, b)).toBe(false);
	expect(areSimilar(b, a)).toBe(false);
});

// בדיקה 7: ספירות sanity
test('PHONETIC_SIMILARITY_PAIRS מכיל בדיוק 10 צמדים', () => {
	expect(PHONETIC_SIMILARITY_PAIRS.length).toBe(10);
});

test('VISUAL_SIMILARITY_PAIRS_FUTURE מכיל בדיוק 13 צמדים', () => {
	expect(VISUAL_SIMILARITY_PAIRS_FUTURE.length).toBe(13);
});

// בדיקה 8: לוח 3x4 עם avoidSimilar=true לא מכיל צמד צלילי-דומה (100 ריצות)
test('לוח 3x4 עם avoidSimilar=true אינו מכיל צמד צלילי-דומה (100 ריצות)', () => {
	for (let i = 0; i < 100; i++) {
		const board = pickBoard({ count: 12, groups: ['base', 'confusing', 'rafe'], avoidSimilar: true });
		const boardIds = board.map((c) => c.id);
		for (const pair of PHONETIC_SIMILARITY_PAIRS) {
			const hasA = boardIds.includes(pair.a);
			const hasB = boardIds.includes(pair.b);
			expect(hasA && hasB).toBe(false);
		}
	}
});

// בדיקה 9: אין fallback ללוח 3x4 עם כל הקבוצות הפעילות (100 ריצות)
test('אין fallback ללוח 3x4 עם כל 26 האותיות (100 ריצות)', () => {
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	for (let i = 0; i < 100; i++) {
		pickBoard({ count: 12, groups: ['base', 'confusing', 'rafe'], avoidSimilar: true });
	}
	expect(warnSpy).not.toHaveBeenCalled();
	warnSpy.mockRestore();
});

// בדיקה 10: ALL_LETTERS_ALPHABETICAL מכיל 26 אותיות
test('ALL_LETTERS_ALPHABETICAL מכיל 26 אותיות', () => {
	expect(ALL_LETTERS_ALPHABETICAL.length).toBe(26);
});

// בדיקה 11: DEFAULT_LETTER_IDS מכיל 26 מזהים
test('DEFAULT_LETTER_IDS מכיל 26 מזהים', () => {
	expect(DEFAULT_LETTER_IDS.length).toBe(26);
});

// בדיקה 12: getLettersByIds מחזיר רק האותיות שביקשנו
test('getLettersByIds מחזיר רק האותיות שביקשנו', () => {
	const result = getLettersByIds(['a', 'ba', 'ga']);
	expect(result.map(c => c.id)).toEqual(['a', 'ba', 'ga']);
});

// בדיקה 13: getLettersByIds מדלג על מזהה לא-מוכר
test('getLettersByIds מדלג על מזהה לא-מוכר', () => {
	const result = getLettersByIds(['a', 'UNKNOWN', 'ba']);
	expect(result.map(c => c.id)).toEqual(['a', 'ba']);
});

// בדיקה 14: pickBoard עם selectedLetterIds מחזיר רק האותיות הנבחרות
test('pickBoard עם selectedLetterIds מחזיר רק האותיות הנבחרות', () => {
	const board = pickBoard({ count: 3, selectedLetterIds: ['a', 'ba', 'ga'], avoidSimilar: false });
	const ids = board.map(c => c.id).sort();
	expect(ids).toEqual(['a', 'ba', 'ga']);
});

// בדיקה 15: pickBoard מחזיר הכל כש-count גדול מה-pool
test('pickBoard מחזיר הכל כש-count גדול מה-pool', () => {
	const board = pickBoard({ count: 10, selectedLetterIds: ['a', 'ba'], avoidSimilar: false });
	expect(board.length).toBe(2);
});

// בדיקה 16: pickBoard עם selectedLetterIds ריק מחזיר []
test('pickBoard עם selectedLetterIds ריק מחזיר []', () => {
	const board = pickBoard({ count: 5, selectedLetterIds: [], avoidSimilar: false });
	expect(board).toEqual([]);
});
