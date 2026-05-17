/**
 * מאגר סוגי ניקוד — פאזה 1: patah ו-none בלבד.
 *
 * שימו לב על ה-speakSuffix עבור patah:
 *   ה-speak הישן של LetterCard היה: letter.displayChar + 'ָ' + 'א'
 *   (לדוגמה: 'בּ' + 'ָ' + 'א' = 'בָּא')
 *   לכן speakSuffix של patah = 'ָא' (קמץ U+05B8 + אלף)
 *   ו-makePair בונה: letter.displayChar + speakSuffix
 *
 * שימו לב על speakSuffix של none:
 *   שווא נח: letter.displayChar + 'ְ' (לדוגמה: 'בּ' + 'ְ' = 'בְּ')
 *   אבל לאותיות רפות (בלי דגש) — 'ב' + 'ְ' = 'בְ'
 *   זה נכון — speakSuffix הוא שווא נח U+05B0
 *
 * מסמך תכנון: docs/plans/vowels-support-plan.md §3 ו-§4
 */

export type VowelCode = 'patah' | 'none';

export interface Vowel {
	code: VowelCode;
	/** שם הניקוד בעברית — מ-language.ts */
	displayName: string;
	/** הסימן המשלים (combining character) לתצוגה — ריק עבור none */
	mark: string;
	/**
	 * הסיומת ל-speak: נוסף אחרי letter.displayChar.
	 * עבור patah: 'ָא' — כדי שה-speak יהיה זהה לישן ('בָּא', 'גָא', etc.)
	 * עבור none: 'ְ' — שווא נח ('בְּ', 'גְ', etc.)
	 */
	speakSuffix: string;
}

export const VOWELS_BY_CODE: Record<VowelCode, Vowel> = {
	patah: {
		code: 'patah',
		displayName: 'פתח',
		mark: '\u05B7', // ַ
		// קמץ (ָ U+05B8) + אלף — ל-TTS יציב בדיוק כמו הישן
		speakSuffix: '\u05B8\u05D0' // ָא
	},
	none: {
		code: 'none',
		displayName: 'עיצור',
		mark: '',
		// שווא נח U+05B0 — "בְּ", "גְ"
		speakSuffix: '\u05B0' // ְ
	}
};

export const ALL_VOWELS: Vowel[] = [VOWELS_BY_CODE.patah, VOWELS_BY_CODE.none];
