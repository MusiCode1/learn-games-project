/**
 * Tests for pair.ts (Sub-phase 1.2)
 * TDD — כתוב לפני הקוד
 */
import { describe, it, expect } from 'vitest';
import { makePair, generateDeck, isValidCombination } from './pair';
import { LETTERS_BY_LEGACY_ID, ALL_LETTERS_DATA } from '../data/letters';
import { VOWELS_BY_CODE } from '../data/vowels';
import { ALL_LETTERS, DEFAULT_LETTER_IDS } from './letters';

const bLetter = LETTERS_BY_LEGACY_ID.get('ba')!;
const gLetter = LETTERS_BY_LEGACY_ID.get('ga')!;
const patah = VOWELS_BY_CODE.patah;
const none = VOWELS_BY_CODE.none;

describe('makePair', () => {
	// ===== id =====
	it('pair <b, patah>.id === "ba" (תאימות ל-LetterCard.id הישן)', () => {
		const pair = makePair(bLetter, patah);
		expect(pair.id).toBe('ba');
	});

	it('pair <b, none>.id === "b__none"', () => {
		const pair = makePair(bLetter, none);
		expect(pair.id).toBe('b__none');
	});

	// ===== display =====
	it('pair <b, patah>.display === "בַּ" (זהה ל-LetterCard.display הישן)', () => {
		const pair = makePair(bLetter, patah);
		// LetterCard הישן: { id: 'ba', display: 'בַּ' }
		expect(pair.display).toBe('בַּ');
	});

	it('pair <b, none>.display מורכב מ-displayChar בלי ניקוד', () => {
		const pair = makePair(bLetter, none);
		// displayChar='בּ', mark='' → 'בּ'
		expect(pair.display).toBe('בּ');
	});

	// ===== speak — critical regression =====
	it('pair <b, patah>.speak === "בָּא" (זהה ל-LetterCard הישן)', () => {
		const pair = makePair(bLetter, patah);
		// ALL_LETTERS הישן: { id: 'ba', speak: 'בָּא' }
		expect(pair.speak).toBe('בָּא');
	});

	it('pair <b, none>.speak === char + שווא (speakChar??char + speakSuffix)', () => {
		const pair = makePair(bLetter, none);
		// Phase 2: speakBase = speakChar ?? char = undefined ?? 'ב' = 'ב' (ללא דגש)
		// speak = 'ב' (U+05D1) + 'ְ' (U+05B0 שווא נח) = 'בְ'
		// שים לב: char='ב' (ללא דגש), לא displayChar='בּ' (עם דגש)
		// מנרמל ל-NFC לפני השוואה
		expect(pair.speak.normalize('NFC')).toBe(('ב' + '\u05B0').normalize('NFC'));
		// מכיל שווא
		expect([...pair.speak].some(c => c.codePointAt(0) === 0x05B0)).toBe(true);
		// מתחיל ב-ב (U+05D1) ללא דגש
		expect(pair.speak.startsWith('ב')).toBe(true);
		expect(pair.speak.length).toBe(2); // ב + שווא בלבד — אין דגש
	});

	it('pair <g, patah>.speak === "גָא" (זהה ל-LetterCard הישן)', () => {
		const pair = makePair(gLetter, patah);
		expect(pair.speak).toBe('גָא');
	});

	// ===== group =====
	it('pair.group === letter.group', () => {
		const pair = makePair(bLetter, patah);
		expect(pair.group).toBe(bLetter.group);
	});

	// ===== letter + vowel refs =====
	it('pair.letter === letter, pair.vowel === vowel', () => {
		const pair = makePair(bLetter, patah);
		expect(pair.letter).toBe(bLetter);
		expect(pair.vowel).toBe(patah);
	});

	// ===== regression test: כל 26 האותיות =====
	describe('regression: כל 26 האותיות — makePair(letter, patah) זהה ל-LetterCard הישן', () => {
		for (const oldCard of ALL_LETTERS) {
			it(`${oldCard.id}: id, display, speak זהים`, () => {
				const letter = LETTERS_BY_LEGACY_ID.get(oldCard.id);
				if (!letter) throw new Error(`Letter not found for legacyCardId=${oldCard.id}`);
				const pair = makePair(letter, patah);
				expect(pair.id).toBe(oldCard.id);
				expect(pair.display).toBe(oldCard.display);
				expect(pair.speak).toBe(oldCard.speak);
			});
		}
	});
});

describe('generateDeck', () => {
	it('generateDeck(DEFAULT_LETTER_IDS, ["patah"]).length === 26', () => {
		const deck = generateDeck(DEFAULT_LETTER_IDS, ['patah']);
		expect(deck).toHaveLength(26);
	});

	it('generateDeck(["ba", "ga"], ["patah", "none"]).length === 4 (cartesian)', () => {
		const deck = generateDeck(['ba', 'ga'], ['patah', 'none']);
		expect(deck).toHaveLength(4);
	});

	it('ids ב-deck עם patah תואמים ל-legacyCardId', () => {
		const deck = generateDeck(['ba', 'ga'], ['patah']);
		const ids = deck.map((p) => p.id);
		expect(ids).toContain('ba');
		expect(ids).toContain('ga');
	});

	it('ids ב-deck עם none מסתיימים ב-__none', () => {
		const deck = generateDeck(['ba', 'ga'], ['none']);
		const ids = deck.map((p) => p.id);
		expect(ids).toContain('b__none');
		expect(ids).toContain('g__none');
	});

	it('מזהה לא קיים לא מוסיף ל-deck', () => {
		const deck = generateDeck(['ba', 'NONEXISTENT'], ['patah']);
		expect(deck).toHaveLength(1);
	});

	it('vowel לא קיים לא מוסיף ל-deck', () => {
		// @ts-expect-error בדיקה מכוונת
		const deck = generateDeck(['ba'], ['nonexistent_vowel']);
		expect(deck).toHaveLength(0);
	});
});

describe('isValidCombination', () => {
	it('תמיד מחזיר true בפאזה 1 (אין סופיות)', () => {
		for (const letter of ALL_LETTERS_DATA) {
			expect(isValidCombination(letter, patah)).toBe(true);
			expect(isValidCombination(letter, none)).toBe(true);
		}
	});
});
