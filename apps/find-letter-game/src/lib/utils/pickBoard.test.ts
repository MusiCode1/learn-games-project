/**
 * Integration tests לפאזה 1.4:
 * - pickBoard עם pairs מ-generateDeck
 * - הוכחה שה-speak של pairs זהה לישן
 *
 * Testing: integration (מה-brief Sub-phase 1.4)
 */
import { describe, it, expect } from 'vitest';
import { pickBoard, ALL_LETTERS, DEFAULT_LETTER_IDS, getTtsFilename } from './letters';
import { generateDeck } from './pair';
import { VOWELS_BY_CODE } from '../data/vowels';

describe('pickBoard + generateDeck integration', () => {
	it('generateDeck(DEFAULT_LETTER_IDS, ["patah"]) + pickBoard מחזיר 12 כרטיסים', () => {
		const deck = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
		const board = pickBoard({ count: 12, pairs: deck, avoidSimilar: false });
		expect(board).toHaveLength(12);
	});

	it('board.pair.display ו-.speak זהים ל-LetterCard הישן', () => {
		const deck = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
		// בנה מפה מ-id → LetterCard ישן
		const oldById = new Map(ALL_LETTERS.map(c => [c.id, c]));

		for (const pair of deck) {
			const old = oldById.get(pair.id);
			expect(old, `pair.id=${pair.id} לא קיים ב-ALL_LETTERS הישן`).toBeDefined();
			expect(pair.display, `display לא תואם ל-id=${pair.id}`).toBe(old!.display);
			expect(pair.speak, `speak לא תואם ל-id=${pair.id}`).toBe(old!.speak);
		}
	});

	it('עם avoidSimilar=true אין שני pairs דומים בלוח', () => {
		const deck = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
		// ריצות מרובות לבדיקת randomness
		for (let i = 0; i < 50; i++) {
			const board = pickBoard({ count: 12, pairs: deck, avoidSimilar: true });
			const ids = board.map(p => p.id);
			// בדיקה ש-sa ו-sa_sin לא ביחד
			const hasSa = ids.includes('sa');
			const hasSaSin = ids.includes('sa_sin');
			expect(hasSa && hasSaSin, 'sa ו-sa_sin לא אמורים להיות ביחד').toBe(false);
		}
	});

	it('deck עם ["patah", "none"] מייצר מכפלה קרטזית', () => {
		const deck = generateDeck(['ba', 'ga'], ['patah', 'none']);
		expect(deck).toHaveLength(4);
		const ids = deck.map(p => p.id).sort();
		expect(ids).toEqual(['b__none', 'ba', 'g__none', 'ga']);
	});
});

describe('data flow: settings → generateDeck → pickBoard → board', () => {
	it('board כרטיסים מכילים speak שניתן למצוא ב-TTS_FILES', () => {
		const deck = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
		const board = pickBoard({ count: 12, pairs: deck, avoidSimilar: false });
		for (const card of board) {
			const filename = getTtsFilename(card.speak);
			expect(filename, `card.speak="${card.speak}" לא ממופה ב-TTS_FILES`).not.toBeNull();
		}
	});
});
