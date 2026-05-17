/**
 * Tests for vowels.ts data module (Sub-phase 1.1)
 */
import { describe, it, expect } from 'vitest';
import { ALL_VOWELS, VOWELS_BY_CODE } from './vowels';

describe('vowels data module', () => {
	it('מכיל בדיוק 2 ערכי Vowel בפאזה 1', () => {
		expect(ALL_VOWELS).toHaveLength(2);
	});

	it('קודים ייחודיים', () => {
		const codes = ALL_VOWELS.map((v) => v.code);
		const unique = new Set(codes);
		expect(unique.size).toBe(2);
	});

	it('מכיל patah', () => {
		const patah = VOWELS_BY_CODE['patah'];
		expect(patah).toBeDefined();
		expect(patah.code).toBe('patah');
	});

	it('מכיל none', () => {
		const none = VOWELS_BY_CODE['none'];
		expect(none).toBeDefined();
		expect(none.code).toBe('none');
	});

	it('patah: mark=פתח (ַ), speakSuffix מסתיים ב-א', () => {
		const patah = VOWELS_BY_CODE['patah'];
		// הפתח הוא ַ (U+05B7)
		expect(patah.mark).toBe('\u05B7');
		// speakSuffix כולל א בסוף (ל-TTS)
		expect(patah.speakSuffix.endsWith('א')).toBe(true);
	});

	it('none: mark ריק, speakSuffix הוא שווא נח', () => {
		const none = VOWELS_BY_CODE['none'];
		expect(none.mark).toBe('');
		// שווא נח: U+05B0
		expect(none.speakSuffix).toContain('\u05B0');
	});

	it('כל Vowel מכיל displayName שאינו ריק', () => {
		for (const vowel of ALL_VOWELS) {
			expect(typeof vowel.displayName).toBe('string');
			expect(vowel.displayName.length).toBeGreaterThan(0);
		}
	});
});
