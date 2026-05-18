/**
 * Tests for vowels.ts data module
 * Phase 3: 12 vowels total
 */
import { describe, it, expect } from 'vitest';
import { ALL_VOWELS, VOWELS_BY_CODE } from './vowels';

describe('vowels data module', () => {
	it('מכיל בדיוק 12 ערכי Vowel בפאזה 3', () => {
		expect(ALL_VOWELS).toHaveLength(12);
	});

	it('קודים ייחודיים', () => {
		const codes = ALL_VOWELS.map((v) => v.code);
		const unique = new Set(codes);
		expect(unique.size).toBe(12);
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

	// === ניקודים חדשים (פאזה 3) ===

	it('kamatz: mark=ָ (U+05B8), speakSuffix מסתיים ב-א', () => {
		const kamatz = VOWELS_BY_CODE['kamatz'];
		expect(kamatz).toBeDefined();
		expect(kamatz.mark).toBe('\u05B8'); // ָ
		expect(kamatz.speakSuffix.endsWith('א')).toBe(true);
		expect(kamatz.displayName).toBe('קמץ');
	});

	it('segol: mark=ֶ (U+05B6), speakSuffix מסתיים ב-א', () => {
		const segol = VOWELS_BY_CODE['segol'];
		expect(segol).toBeDefined();
		expect(segol.mark).toBe('\u05B6'); // ֶ
		expect(segol.speakSuffix.endsWith('א')).toBe(true);
		expect(segol.displayName).toBe('סגול');
	});

	it('tzere: mark=ֵ (U+05B5), speakSuffix מסתיים ב-א', () => {
		const tzere = VOWELS_BY_CODE['tzere'];
		expect(tzere).toBeDefined();
		expect(tzere.mark).toBe('\u05B5'); // ֵ
		expect(tzere.speakSuffix.endsWith('א')).toBe(true);
		expect(tzere.displayName).toBe('צירה');
	});

	it('hirik: mark=ִ (U+05B4), speakSuffix מסתיים ב-יוד', () => {
		const hirik = VOWELS_BY_CODE['hirik'];
		expect(hirik).toBeDefined();
		expect(hirik.mark).toBe('\u05B4'); // ִ
		expect(hirik.speakSuffix.endsWith('י')).toBe(true);
		expect(hirik.displayName).toBe('חיריק');
	});

	it('kubutz: mark=ֻ (U+05BB)', () => {
		const kubutz = VOWELS_BY_CODE['kubutz'];
		expect(kubutz).toBeDefined();
		expect(kubutz.mark).toBe('\u05BB'); // ֻ
		expect(kubutz.displayName).toBe('קובוץ');
	});

	it('shuruk: mark=וּ (U+05D5+U+05BC) — 2 chars', () => {
		const shuruk = VOWELS_BY_CODE['shuruk'];
		expect(shuruk).toBeDefined();
		// שורוק = ו + דגש (2 chars!)
		expect(shuruk.mark).toBe('\u05D5\u05BC');
		expect([...shuruk.mark].length).toBe(2); // 2 code points
		expect(shuruk.displayName).toBe('שורוק');
	});

	it('holam: mark=ֹ (U+05B9), speakSuffix מסתיים ב-א', () => {
		const holam = VOWELS_BY_CODE['holam'];
		expect(holam).toBeDefined();
		expect(holam.mark).toBe('\u05B9'); // ֹ
		expect(holam.speakSuffix.endsWith('א')).toBe(true);
		expect(holam.displayName).toBe('חולם');
	});

	it('shva: mark=ְ (U+05B0)', () => {
		const shva = VOWELS_BY_CODE['shva'];
		expect(shva).toBeDefined();
		expect(shva.mark).toBe('\u05B0'); // ְ
		expect(shva.displayName).toBe('שווא');
	});

	it('hataf-patah: mark=ֲ (U+05B2), speakSuffix מסתיים ב-א', () => {
		const hatafPatah = VOWELS_BY_CODE['hataf-patah'];
		expect(hatafPatah).toBeDefined();
		expect(hatafPatah.mark).toBe('\u05B2'); // ֲ
		expect(hatafPatah.speakSuffix.endsWith('א')).toBe(true);
		expect(hatafPatah.displayName).toBe('חטף פתח');
	});

	it('hataf-segol: mark=ֱ (U+05B1), speakSuffix מסתיים ב-א', () => {
		const hatafSegol = VOWELS_BY_CODE['hataf-segol'];
		expect(hatafSegol).toBeDefined();
		expect(hatafSegol.mark).toBe('\u05B1'); // ֱ
		expect(hatafSegol.speakSuffix.endsWith('א')).toBe(true);
		expect(hatafSegol.displayName).toBe('חטף סגול');
	});

	// סדר פדגוגי: patah, kamatz, hirik, segol, tzere, holam, shuruk, kubutz, shva, hataf-patah, hataf-segol, none
	it('הסדר הפדגוגי ב-ALL_VOWELS: patah ראשון, none אחרון', () => {
		expect(ALL_VOWELS[0].code).toBe('patah');
		expect(ALL_VOWELS[ALL_VOWELS.length - 1].code).toBe('none');
	});
});
