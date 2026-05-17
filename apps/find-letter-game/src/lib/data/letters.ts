/**
 * מאגר אותיות עבריות — מופרד מ-LetterCard הישן.
 *
 * כל ערך מייצג **אות** בלבד (ללא ניקוד).
 * ה-legacyCardId מאפשר תאימות לאחור עם LetterCard.id הישן,
 * עם selectedLetterIds ב-localStorage, ועם PHONETIC_SIMILARITY_PAIRS.
 *
 * מסמך תכנון: docs/plans/vowels-support-plan.md §3
 */

import type { LetterGroup } from '../utils/letters';

export interface Letter {
	/** מזהה ייחודי של האות — ללא ניקוד (לדוגמה: 'b', 'k', 'sh') */
	id: string;
	/** האות בלי דגש ובלי ניקוד (לדוגמה: 'ב', 'כ', 'ש') */
	char: string;
	/** האות לתצוגה — עם דגש/שיניים אם רלוונטי (לדוגמה: 'בּ', 'שׁ') */
	displayChar: string;
	/** שם האות לנגישות ו-dev-tools (לדוגמה: 'בית דגושה') */
	name: string;
	/** האם הצורה הזו כוללת דגש בנוי-פנימה (בּ, כּ, פּ, תּ) */
	hasDagesh: boolean;
	/** האם זו צורה סופית (ך, ם, ן, ף, ץ) */
	isFinalForm: boolean;
	/** עבור שׁ ו-שׂ — איזו נקודה */
	sinSide?: 'right' | 'left';
	/** הקבוצה שאליה שייכת האות — לתאימות עם קוד legacy */
	group: LetterGroup;
	/**
	 * מיפוי ה-id הישן של LetterCard עם פתח — לתאימות לאחור.
	 * selectedLetterIds ב-localStorage מצביע על ה-id הזה.
	 * PHONETIC_SIMILARITY_PAIRS משתמש ב-id הזה.
	 */
	legacyCardId: string;
	/**
	 * ה-speak הישן בדיוק כפי שהופיע ב-LetterCard עם פתח.
	 * נשמר כקבוע כי לחלק מהאותיות ה-speak אינו `displayChar + 'ָא'` פשוט
	 * (חריגים: za='זַה', tza='[Israeli accent] צַה', qa='כָּא', tav='טָא',
	 * fa_rafe='Fa', sa_sin='סָא', aa='אָא', va_rafe='וָא').
	 *
	 * makePair(letter, patah).speak === letter.legacySpeakPatah (תמיד).
	 * ה-TTS_FILES mapping בנוי בדיוק סביב הערכים האלה.
	 */
	legacySpeakPatah: string;
	/**
	 * ה-display הישן בדיוק כפי שהופיע ב-LetterCard עם פתח.
	 * נשמר כי ה-display עם פתח אינו תמיד `displayChar + mark` פשוט
	 * (לדוגמה: ba='בַּ' מכיל גם פתח וגם דגש ב-displayChar).
	 */
	legacyDisplayPatah: string;
	/**
	 * האות לשימוש ב-speak כשהיא שונה מ-`char`.
	 * קיים רק עבור האותיות הרפות: va_rafe → 'ו', cha_rafe → 'ח'.
	 * עבור fa_rafe — speak נקבע על ידי TTS_FILES ישירות (תעתיק לטיני).
	 * אם לא קיים, makePair ישתמש ב-`char`.
	 */
	speakChar?: string;
}

// ===== קבוצה: base =====

const BASE_LETTERS_DATA: Letter[] = [
	{
		id: 'a',
		char: 'א',
		displayChar: 'א',
		name: 'אלף',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'a',
		legacySpeakPatah: 'אָא',
		legacyDisplayPatah: 'אַ'
	},
	{
		id: 'b',
		char: 'ב',
		displayChar: 'בּ',
		name: 'בית דגושה',
		hasDagesh: true,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ba',
		legacySpeakPatah: 'בָּא',
		legacyDisplayPatah: 'בַּ'
	},
	{
		id: 'g',
		char: 'ג',
		displayChar: 'ג',
		name: 'גימל',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ga',
		legacySpeakPatah: 'גָא',
		legacyDisplayPatah: 'גַ'
	},
	{
		id: 'd',
		char: 'ד',
		displayChar: 'ד',
		name: 'דלת',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'da',
		legacySpeakPatah: 'דָא',
		legacyDisplayPatah: 'דַ'
	},
	{
		id: 'h',
		char: 'ה',
		displayChar: 'ה',
		name: 'הא',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ha',
		legacySpeakPatah: 'הָא',
		legacyDisplayPatah: 'הַ'
	},
	{
		id: 'v',
		char: 'ו',
		displayChar: 'ו',
		name: 'וו',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'va',
		legacySpeakPatah: 'וָא',
		legacyDisplayPatah: 'וַ'
	},
	{
		id: 'z',
		char: 'ז',
		displayChar: 'ז',
		name: 'זין',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'za',
		legacySpeakPatah: 'זַה', // חריג: לא 'זָא'
		legacyDisplayPatah: 'זַ'
	},
	{
		id: 'ch',
		char: 'ח',
		displayChar: 'ח',
		name: 'חית',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'cha',
		legacySpeakPatah: 'חָא',
		legacyDisplayPatah: 'חַ'
	},
	{
		id: 't',
		char: 'ט',
		displayChar: 'ט',
		name: 'טית',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ta',
		legacySpeakPatah: 'טָא',
		legacyDisplayPatah: 'טַ'
	},
	{
		id: 'y',
		char: 'י',
		displayChar: 'י',
		name: 'יוד',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ya',
		legacySpeakPatah: 'יָא',
		legacyDisplayPatah: 'יַ'
	},
	{
		id: 'k',
		char: 'כ',
		displayChar: 'כּ',
		name: 'כף דגושה',
		hasDagesh: true,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ka',
		legacySpeakPatah: 'כָּא',
		legacyDisplayPatah: 'כַּ'
	},
	{
		id: 'l',
		char: 'ל',
		displayChar: 'ל',
		name: 'למד',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'la',
		legacySpeakPatah: 'לָא',
		legacyDisplayPatah: 'לַ'
	},
	{
		id: 'mm',
		char: 'מ',
		displayChar: 'מ',
		name: 'מם',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ma',
		legacySpeakPatah: 'מָא',
		legacyDisplayPatah: 'מַ'
	},
	{
		id: 'nn',
		char: 'נ',
		displayChar: 'נ',
		name: 'נון',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'na',
		legacySpeakPatah: 'נָא',
		legacyDisplayPatah: 'נַ'
	},
	{
		id: 's',
		char: 'ס',
		displayChar: 'ס',
		name: 'סמך',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'sa',
		legacySpeakPatah: 'סָא',
		legacyDisplayPatah: 'סַ'
	},
	{
		id: 'p',
		char: 'פ',
		displayChar: 'פּ',
		name: 'פה דגושה',
		hasDagesh: true,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'pa',
		legacySpeakPatah: 'פָּא',
		legacyDisplayPatah: 'פַּ'
	},
	{
		id: 'tz',
		char: 'צ',
		displayChar: 'צ',
		name: 'צדי',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'tza',
		legacySpeakPatah: '[Israeli accent] צַה', // חריג: accent tag + לא 'ָא'
		legacyDisplayPatah: 'צַ'
	},
	{
		id: 'q',
		char: 'ק',
		displayChar: 'ק',
		name: 'קוף',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'qa',
		legacySpeakPatah: 'כָּא', // חריג: ק = כּ — אותו קובץ TTS
		legacyDisplayPatah: 'קַ'
	},
	{
		id: 'r',
		char: 'ר',
		displayChar: 'ר',
		name: 'ריש',
		hasDagesh: false,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'ra',
		legacySpeakPatah: 'רָא',
		legacyDisplayPatah: 'רַ'
	},
	{
		id: 'sh',
		char: 'ש',
		displayChar: 'שׁ',
		name: 'שין ימנית',
		hasDagesh: false,
		isFinalForm: false,
		sinSide: 'right',
		group: 'base',
		legacyCardId: 'sha',
		legacySpeakPatah: 'שָׁא',
		legacyDisplayPatah: 'שַׁ'
	},
	{
		id: 'tav',
		char: 'ת',
		displayChar: 'תּ',
		name: 'תו דגושה',
		hasDagesh: true,
		isFinalForm: false,
		group: 'base',
		legacyCardId: 'tav',
		legacySpeakPatah: 'טָא', // חריג: ת = ט — אותו קובץ TTS
		legacyDisplayPatah: 'תַּ'
	}
];

// ===== קבוצה: confusing =====

const CONFUSING_LETTERS_DATA: Letter[] = [
	{
		id: 'sin',
		char: 'ש',
		displayChar: 'שׂ',
		name: 'שין שמאלית',
		hasDagesh: false,
		isFinalForm: false,
		sinSide: 'left',
		group: 'confusing',
		legacyCardId: 'sa_sin',
		legacySpeakPatah: 'סָא', // חריג: שׂ = ס — אותו קובץ TTS
		legacyDisplayPatah: 'שַׂ'
	},
	{
		id: 'aa',
		char: 'ע',
		displayChar: 'ע',
		name: 'עין',
		hasDagesh: false,
		isFinalForm: false,
		group: 'confusing',
		legacyCardId: 'aa',
		legacySpeakPatah: 'אָא', // חריג: ע = א — אותו קובץ TTS
		legacyDisplayPatah: 'עַ'
	}
];

// ===== קבוצה: rafe =====

const RAFE_LETTERS_DATA: Letter[] = [
	{
		id: 'v_rafe',
		char: 'ב',
		displayChar: 'ב',
		name: 'בית רפה',
		hasDagesh: false,
		isFinalForm: false,
		group: 'rafe',
		legacyCardId: 'va_rafe',
		legacySpeakPatah: 'וָא', // חריג: ב רפה נשמעת כ-ו
		legacyDisplayPatah: 'בַ',
		speakChar: 'ו' // לעיצור: 'ו' + שווא = 'וְ' (כמו va/ו)
	},
	{
		id: 'ch_rafe',
		char: 'כ',
		displayChar: 'כ',
		name: 'כף רפה',
		hasDagesh: false,
		isFinalForm: false,
		group: 'rafe',
		legacyCardId: 'cha_rafe',
		legacySpeakPatah: 'חָא', // חריג: כ רפה נשמעת כ-ח
		legacyDisplayPatah: 'כַ',
		speakChar: 'ח' // לעיצור: 'ח' + שווא = 'חְ' (כמו ch/ח)
	},
	{
		id: 'f_rafe',
		char: 'פ',
		displayChar: 'פ',
		name: 'פה רפה',
		hasDagesh: false,
		isFinalForm: false,
		group: 'rafe',
		legacyCardId: 'fa_rafe',
		legacySpeakPatah: 'Fa', // חריג: תעתיק לטיני — ראה הערה ב-letters.ts הישן
		legacyDisplayPatah: 'פַ',
		speakChar: 'F' // לעיצור: 'F' + שווא = 'Fְ' — מופה ל-F.mp3 (נפרד מ-P.mp3!)
		              // מבטיח הבחנה מ-p (פּ דגושה) שגם char='פ' וייצר 'פְ' → P.mp3
	}
];

// ===== מאגר מאוחד =====

export const ALL_LETTERS_DATA: Letter[] = [
	...BASE_LETTERS_DATA,
	...CONFUSING_LETTERS_DATA,
	...RAFE_LETTERS_DATA
];

/** מיפוי legacyCardId → Letter — לשימוש ב-generateDeck */
export const LETTERS_BY_LEGACY_ID: Map<string, Letter> = new Map(
	ALL_LETTERS_DATA.map((l) => [l.legacyCardId, l])
);
