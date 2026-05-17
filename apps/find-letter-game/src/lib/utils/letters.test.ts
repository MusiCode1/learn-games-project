import { describe, test, expect, vi } from 'vitest';
import { areSimilar, PHONETIC_SIMILARITY_PAIRS, VISUAL_SIMILARITY_PAIRS_FUTURE, pickBoard, ALL_LETTERS, ALL_LETTERS_ALPHABETICAL, DEFAULT_LETTER_IDS, getTtsFilename, TTS_FILES } from './letters';
import { generateDeck } from './pair';

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

// בדיקה 5: צמדים צליליים חדשים
test.each([
	['qa', 'ka'],   // ק ↔ כּ
	['a', 'ha'],    // א ↔ ה
	['aa', 'ha'],   // ע ↔ ה
	['sa', 'za'],   // ס ↔ ז
	['tza', 'ta'],  // צ ↔ ט
])('צמד צלילי: %s ↔ %s נחשבים דומים', (a, b) => {
	expect(areSimilar(a, b)).toBe(true);
	expect(areSimilar(b, a)).toBe(true); // סימטריה
});

// בדיקה 6: צמדים ויזואליים — לא נחשבים דומים
test.each([
	['ba', 'va_rafe'],   // בּ ↔ ב רפה — ויזואלי בלבד
	['ka', 'cha_rafe'],  // כּ ↔ כ רפה — ויזואלי בלבד
	['da', 'ra'],        // ד ↔ ר — ויזואלי בלבד
	['cha', 'ha'],       // ח ↔ ה — ויזואלי בלבד
	['va', 'za'],        // ו ↔ ז — ויזואלי בלבד
])('צמד ויזואלי: %s ↔ %s לא נחשבים דומים', (a, b) => {
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

// בדיקה 8: לוח 3x4 עם avoidSimilar=true לא מכיל צמד צלילי-דומה
test('לוח 3x4 עם avoidSimilar=true אינו מכיל צמד צלילי-דומה (100 ריצות)', () => {
	const allPairs = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
	for (let i = 0; i < 100; i++) {
		const board = pickBoard({ count: 12, pairs: allPairs, avoidSimilar: true });
		const boardIds = board.map((c) => c.id);
		for (const pair of PHONETIC_SIMILARITY_PAIRS) {
			const hasA = boardIds.includes(pair.a);
			const hasB = boardIds.includes(pair.b);
			expect(hasA && hasB).toBe(false);
		}
	}
});

// בדיקה 9: אין fallback ללוח 3x4 עם כל 26 האותיות
test('אין fallback ללוח 3x4 עם כל 26 האותיות (100 ריצות)', () => {
	const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	const allPairs = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
	for (let i = 0; i < 100; i++) {
		pickBoard({ count: 12, pairs: allPairs, avoidSimilar: true });
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

// בדיקה 12 (עודכנה): pickBoard עם pairs ישירות מחזיר רק האותיות הנבחרות
test('pickBoard עם pairs מחזיר רק האותיות הנבחרות', () => {
	const pairs = generateDeck(['a', 'ba', 'ga'], ['patah']);
	const board = pickBoard({ count: 3, pairs, avoidSimilar: false });
	const ids = board.map(c => c.id).sort();
	expect(ids).toEqual(['a', 'ba', 'ga']);
});

// בדיקה 13 (עודכנה): pickBoard מחזיר הכל כש-count גדול מה-pool
test('pickBoard מחזיר הכל כש-count גדול מה-pool', () => {
	const pairs = generateDeck(['a', 'ba'], ['patah']);
	const board = pickBoard({ count: 10, pairs, avoidSimilar: false });
	expect(board.length).toBe(2);
});

// בדיקה 14 (עודכנה): pickBoard עם pairs ריק מחזיר []
test('pickBoard עם pairs ריק מחזיר []', () => {
	const board = pickBoard({ count: 5, pairs: [], avoidSimilar: false });
	expect(board).toEqual([]);
});

// === בדיקות מיפוי TTS ===

// בדיקה 15: getTtsFilename מחזיר את הקובץ הנכון
test('getTtsFilename מחזיר את הקובץ הנכון לטקסט עברי', () => {
	expect(getTtsFilename('בָּא')).toBe('Ba.mp3');
	expect(getTtsFilename('שָׁא')).toBe('Sha.mp3');
});

// בדיקה 16: getTtsFilename מחזיר Fa.mp3
test('getTtsFilename מחזיר Fa.mp3 לטקסט "Fa"', () => {
	expect(getTtsFilename('Fa')).toBe('Fa.mp3');
});

// בדיקה 17: getTtsFilename מטפל ב-tag accent של Tsa
test('getTtsFilename מחזיר Tsa.mp3 ל-"[Israeli accent] צַה"', () => {
	expect(getTtsFilename('[Israeli accent] צַה')).toBe('Tsa.mp3');
});

// בדיקה 18: getTtsFilename מחזיר null
test('getTtsFilename מחזיר null לטקסט לא-מוכר', () => {
	expect(getTtsFilename('xyz123')).toBeNull();
	expect(getTtsFilename('')).toBeNull();
});

// בדיקה 19: getTtsFilename מנרמל
test('getTtsFilename מנרמל trim ו-NFC', () => {
	expect(getTtsFilename('  בָּא  ')).toBe('Ba.mp3');
});

// בדיקה 20: כל ה-speak של ALL_LETTERS ממופה ב-TTS_FILES
test('כל ה-speak של ALL_LETTERS ממופה ב-TTS_FILES', () => {
	for (const card of ALL_LETTERS) {
		const filename = getTtsFilename(card.speak);
		expect(filename, `חסר מיפוי TTS עבור speak="${card.speak}" (id=${card.id})`).not.toBeNull();
	}
});

// בדיקה 21: כל קובץ ב-TTS_FILES בשימוש
test('כל קובץ ב-TTS_FILES בשימוש על-ידי לפחות אות אחת', () => {
	const usedFiles = new Set(ALL_LETTERS.map(c => getTtsFilename(c.speak)));
	for (const filename of Object.values(TTS_FILES)) {
		expect(usedFiles.has(filename), `הקובץ ${filename} ב-TTS_FILES לא בשימוש`).toBe(true);
	}
});
