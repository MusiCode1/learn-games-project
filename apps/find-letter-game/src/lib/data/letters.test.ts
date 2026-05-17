/**
 * Tests for letters.ts data module (Sub-phase 1.1)
 */
import { describe, it, expect } from 'vitest';
import { ALL_LETTERS_DATA } from './letters';
import { ALL_LETTERS } from '../utils/letters';

describe('letters data module', () => {
	it('מכיל בדיוק 26 ערכי Letter', () => {
		expect(ALL_LETTERS_DATA).toHaveLength(26);
	});

	it('כל legacyCardId ייחודי', () => {
		const ids = ALL_LETTERS_DATA.map((l) => l.legacyCardId);
		const unique = new Set(ids);
		expect(unique.size).toBe(26);
	});

	it('כל id ייחודי', () => {
		const ids = ALL_LETTERS_DATA.map((l) => l.id);
		const unique = new Set(ids);
		expect(unique.size).toBe(26);
	});

	it('כל legacyCardId קיים ב-ALL_LETTERS הישן', () => {
		const oldIds = new Set(ALL_LETTERS.map((c) => c.id));
		for (const letter of ALL_LETTERS_DATA) {
			expect(oldIds.has(letter.legacyCardId)).toBe(true);
		}
	});

	it('כל Letter מכיל את השדות הנדרשים', () => {
		for (const letter of ALL_LETTERS_DATA) {
			expect(typeof letter.id).toBe('string');
			expect(typeof letter.char).toBe('string');
			expect(typeof letter.displayChar).toBe('string');
			expect(typeof letter.name).toBe('string');
			expect(typeof letter.hasDagesh).toBe('boolean');
			expect(typeof letter.isFinalForm).toBe('boolean');
			expect(typeof letter.group).toBe('string');
			expect(typeof letter.legacyCardId).toBe('string');
		}
	});

	it('ב (ba) מוגדר נכון עם hasDagesh=true', () => {
		const b = ALL_LETTERS_DATA.find((l) => l.legacyCardId === 'ba');
		expect(b).toBeDefined();
		expect(b!.hasDagesh).toBe(true);
		expect(b!.char).toBe('ב');
		expect(b!.legacyCardId).toBe('ba');
	});

	it('va_rafe מוגדר נכון עם hasDagesh=false', () => {
		const vaRafe = ALL_LETTERS_DATA.find((l) => l.legacyCardId === 'va_rafe');
		expect(vaRafe).toBeDefined();
		expect(vaRafe!.hasDagesh).toBe(false);
		expect(vaRafe!.isFinalForm).toBe(false);
	});

	it('sha מכיל sinSide=right', () => {
		const sha = ALL_LETTERS_DATA.find((l) => l.legacyCardId === 'sha');
		expect(sha).toBeDefined();
		expect(sha!.sinSide).toBe('right');
	});

	it('sa_sin מכיל sinSide=left', () => {
		const saSin = ALL_LETTERS_DATA.find((l) => l.legacyCardId === 'sa_sin');
		expect(saSin).toBeDefined();
		expect(saSin!.sinSide).toBe('left');
	});

	it('אף אות לא isFinalForm=true בפאזה 1 (אין סופיות עדיין)', () => {
		// בפאזה 1 אנחנו עם 26 האותיות שכולן non-final
		// סופיות יוצגו בפאזה 4
		const finals = ALL_LETTERS_DATA.filter((l) => l.isFinalForm);
		expect(finals).toHaveLength(0);
	});
});
