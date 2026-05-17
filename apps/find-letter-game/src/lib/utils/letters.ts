/**
 * מאגר האותיות של "איפה האות?"
 *
 * שלוש קבוצות (Letter Groups):
 *   - `base`       — 21 אותיות עם פתח, כולל ב/כ/פ דגושות.
 *   - `confusing`  — אותיות שמייצרות צמדים צליליים/צורניים מעבר ל-base
 *                    (שׂ שמאלית, ע).
 *   - `rafe`       — אותיות רפות עם פתח (בַ, כַ, פַ) עם הקראה מקורבת
 *                    לצליל הרפה (ב→ו, כ→ח, פ נשמעת כמו "f").
 *
 * צמדי דמיון נפרדים מהקבוצות — מגדירים אילו אותיות נחשבות "דומות"
 * זו לזו, כדי שמנגנון בחירת הלוח יוכל למנוע הצגת שתי אותיות
 * דומות באותו לוח.
 *
 * רקע: docs/similar-letters.md
 * עדכון Phase 1 (2026-05-17): data/letters.ts הוא המאגר החדש.
 *   - LetterCard הוא כעת alias ל-LetterVowelPair
 *   - pickBoard מקבל pairs: LetterVowelPair[] ישירות
 *   - getLettersByIds, getLettersForGroups הוסרו (לא בשימוש)
 */

import type { LetterVowelPair } from './pair';

export type LetterGroup = 'base' | 'confusing' | 'rafe';

/**
 * @deprecated — type alias ל-LetterVowelPair. בשימוש לתאימות עם Board.svelte ו-game-state.
 * יישמר עד לסיום המיגרציה המלאה.
 */
export type LetterCard = LetterVowelPair;

// ===== legacy data (ALL_LETTERS) — נשמר לתאימות =====

/*
 * הערה על ה-`speak`:
 *
 * ה-TTS (ElevenLabs eleven_v3) נוטה "ליישר" אותיות גרוניות לעברית מודרנית.
 * כשמסיימים מילה ב-`ה` (אם-קריאה), המודל לפעמים מבלע את העיצור הראשון
 * ובמיוחד גורם ל-`ח` להישמע כמו `ה`, ל-`ט` להישמע כמו `ה`, וכו'.
 * הפתרון: לסיים את ה-`speak` ב-`א` במקום `ה`.
 *
 * חריג: `fa_rafe` משתמש בתעתיק לטיני (`Fa`) כי Sarah/eleven_v3 מתעלם באופן
 * עקבי מהבחנת דגש/רפה של פ' בעברית — כל וריאנט עברי יצא Pa במקום Fa.
 * בתעתיק לטיני המודל קורא את ההברה כמו שהיא נכתבת.
 *
 * אומת מול Gemini transcription על כל הקבצים — ראו docs/walkthrough.md.
 *
 * עדכון Phase 1: ALL_LETTERS נוצר מ-generateDeck() של data/letters.ts + data/vowels.ts.
 * השדות id/display/speak זהים בדיוק לישן.
 */

import { ALL_LETTERS_DATA, LETTERS_BY_LEGACY_ID } from '../data/letters';
import { VOWELS_BY_CODE } from '../data/vowels';
import { makePair, generateDeck } from './pair';

// בנייה דינמית מה-data החדש — זהה בדיוק ל-ALL_LETTERS הישן
const _patah = VOWELS_BY_CODE.patah;

const BASE_LETTERS: LetterVowelPair[] = ALL_LETTERS_DATA
	.filter((l) => l.group === 'base')
	.map((l) => makePair(l, _patah));

const CONFUSING_LETTERS: LetterVowelPair[] = ALL_LETTERS_DATA
	.filter((l) => l.group === 'confusing')
	.map((l) => makePair(l, _patah));

const RAFE_LETTERS: LetterVowelPair[] = ALL_LETTERS_DATA
	.filter((l) => l.group === 'rafe')
	.map((l) => makePair(l, _patah));

// ===== מיפוי קבצי TTS סטטיים =====

/**
 * מיפוי טקסטי הקראה (`speak`) → שמות קבצי MP3 ב-CDN הסטטי.
 *
 * הקבצים אוחסנו ב-R2 (`tzlev-static`) תחת
 * `${VITE_STATIC_BASE_URL}/shared/tts/find-letter/<filename>`,
 * נוצרו דרך ElevenLabs (Sarah/eleven_v3) ואושרו ידנית.
 *
 * כל ערך כאן חייב להתאים ל-`speak` של כרטיס אחד או יותר ב-`ALL_LETTERS`.
 * אם מוסיפים אות עם `speak` חדש — צריך גם להעלות קובץ ל-R2 ולהוסיף שורה כאן.
 */
export const TTS_FILES: Record<string, string> = {
	// ===== פתח — פאזה 1 =====
	אָא: 'A.mp3',
	בָּא: 'Ba.mp3',
	גָא: 'Ga.mp3',
	דָא: 'Da.mp3',
	הָא: 'Ha.mp3',
	וָא: 'Va.mp3',
	זַה: 'Za.mp3',
	חָא: 'Cha.mp3',
	טָא: 'Ta.mp3',
	יָא: 'Ya.mp3',
	כָּא: 'Ka.mp3',
	לָא: 'La.mp3',
	מָא: 'Ma.mp3',
	נָא: 'Na.mp3',
	סָא: 'Sa.mp3',
	פָּא: 'Pa.mp3',
	'[Israeli accent] צַה': 'Tsa.mp3',
	רָא: 'Ra.mp3',
	שָׁא: 'Sha.mp3',
	Fa: 'Fa.mp3',

	// ===== עיצור (none) — פאזה 2 =====
	// ב: char='ב' → 'בְ'. גם va_rafe עם speakChar='ו' מייצר 'וְ' → V.mp3
	'בְ': 'B.mp3',
	'גְ': 'G.mp3',    // [Israeli accent] גְ
	'דְ': 'D.mp3',
	'הְ': 'H.mp3',
	'וְ': 'V.mp3',    // v (ו) + va_rafe (speakChar='ו')
	'זְ': 'Z.mp3',    // [Israeli accent] זְ
	'חְ': 'Ch.mp3',   // ch (ח) + cha_rafe (speakChar='ח')
	'טְ': 'T.mp3',    // [Israeli accent] טְ
	'יְ': 'Y.mp3',    // [Israeli accent] יְ
	'כְ': 'K.mp3',    // [Israeli accent] כְּ
	'לְ': 'L.mp3',
	'מְ': 'M.mp3',    // [Israeli accent] מְ
	'נְ': 'N.mp3',
	'סְ': 'S.mp3',    // [Israeli accent] סְ
	'פְ': 'P.mp3',    // p (פּ דגושה, char='פ')
	'צְ': 'Tz.mp3',   // [Israeli accent] צְ
	'קְ': 'K.mp3',    // q (ק) — אותו צליל כ-כּ (כמו בסיבוב 1)
	'רְ': 'R.mp3',    // פשרה — American R
	// sh (שׁ) + sin (שׂ): שניהם char='ש' → speak='שְ'. ה-TTS מפיק צליל shin.
	// sin אמורה לצלול כ-S אבל אין דרך להפריד בלי speakChar (מחוץ לscope).
	'שְ': 'Sh.mp3',
	'תְ': 'T.mp3',    // tav (ת) — אותו צליל כ-ט (כמו בסיבוב 1)
	// fa_rafe: speakChar='F' → speak='Fְ' (Latin F + שווא) → נפרד מ-P.mp3
	// eslint-disable-next-line no-misleading-character-class -- Intentional: Latin F + Hebrew shva
	'Fְ': 'F.mp3',

	// ===== גרוניות + עיצור — פאזה 2 (ממתין להחלטה) =====
	// 'אְ': 'A-consonant.mp3',  ← יוסף אחרי NEEDS_DECISION
	// 'עְ': 'Aa-consonant.mp3', ← יוסף אחרי NEEDS_DECISION
};

/**
 * מחזיר את שם קובץ ה-TTS הסטטי עבור טקסט נתון, או `null` אם לא ממופה.
 * הטקסט מנורמל (`trim` + NFC) לפני החיפוש.
 */
export function getTtsFilename(text: string): string | null {
	const key = text.trim().normalize('NFC');
	return TTS_FILES[key] ?? null;
}

// ===== מאגר מאוחד =====

export const ALL_LETTERS: LetterVowelPair[] = [...BASE_LETTERS, ...CONFUSING_LETTERS, ...RAFE_LETTERS];

export const LETTERS_BY_GROUP: Record<LetterGroup, LetterVowelPair[]> = {
	base: BASE_LETTERS,
	confusing: CONFUSING_LETTERS,
	rafe: RAFE_LETTERS
};

// ===== כל האותיות לפי סדר א-ב =====

/** מפה פנימית: legacyCardId → LetterVowelPair, לשימוש ב-ALL_LETTERS_ALPHABETICAL */
const _lettersById = new Map(ALL_LETTERS.map(c => [c.id, c]));

/**
 * כל 26 האותיות לפי סדר א-ב — לתצוגה ב-UI של בחירת אותיות.
 * הסדר: א, בּ, בַ, ג, ד, ה, ו, ז, ח, ט, י, כּ, כַ, ל, מ, נ, ס, ע, פּ, פַ, צ, ק, ר, שׁ, שׂ, ת
 */
export const ALL_LETTERS_ALPHABETICAL: LetterVowelPair[] = [
	'a', 'ba', 'va_rafe', 'ga', 'da', 'ha', 'va', 'za', 'cha', 'ta', 'ya',
	'ka', 'cha_rafe', 'la', 'ma', 'na', 'sa', 'aa', 'pa', 'fa_rafe', 'tza',
	'qa', 'ra', 'sha', 'sa_sin', 'tav'
].map(id => _lettersById.get(id)!);

/** מזהי כל 26 האותיות — ברירת המחדל לבחירת אותיות */
export const DEFAULT_LETTER_IDS: string[] = ALL_LETTERS_ALPHABETICAL.map(c => c.id);

// ===== צמדי דמיון =====

export type SimilarityKind = 'visual' | 'phonetic';
export type SimilarityStrength = 'strong' | 'medium';

export interface SimilarityPair {
	a: string;
	b: string;
	kind: SimilarityKind;
	strength: SimilarityStrength;
}

/**
 * צמדים צליליים — נשמעים זהה או כמעט זהה בעברית מודרנית.
 * אלה **הצמדים היחידים** שמשפיעים על `areSimilar()` ועל מנגנון
 * `avoidSimilar` בבחירת הלוח.
 *
 * ראו `docs/similar-letters.md` סעיף 3 ו-§9.1.
 */
export const PHONETIC_SIMILARITY_PAIRS: SimilarityPair[] = [
	// === חזקים — צליל זהה לחלוטין ===
	{ a: 'sa', b: 'sa_sin', kind: 'phonetic', strength: 'strong' },    // ס ↔ שׂ — אותו צליל בעברית מודרנית
	{ a: 'cha_rafe', b: 'cha', kind: 'phonetic', strength: 'strong' }, // כ רפה ↔ ח
	{ a: 'va_rafe', b: 'va', kind: 'phonetic', strength: 'strong' },   // ב רפה ↔ ו
	{ a: 'ta', b: 'tav', kind: 'phonetic', strength: 'strong' },       // ט ↔ ת
	{ a: 'a', b: 'aa', kind: 'phonetic', strength: 'strong' },         // א ↔ ע — שתיהן אלמות
	{ a: 'qa', b: 'ka', kind: 'phonetic', strength: 'strong' },        // ק ↔ כּ — דומות מאוד בעברית מודרנית

	// === בינוניים — דמיון צלילי משמעותי ===
	{ a: 'a', b: 'ha', kind: 'phonetic', strength: 'medium' },         // א ↔ ה — גרוניות שלרוב מבוטאות זהה
	{ a: 'aa', b: 'ha', kind: 'phonetic', strength: 'medium' },        // ע ↔ ה — גרוניות שלרוב מבוטאות זהה
	{ a: 'sa', b: 'za', kind: 'phonetic', strength: 'medium' },        // ס ↔ ז — שיניות (חסרות/קוליות)
	{ a: 'tza', b: 'ta', kind: 'phonetic', strength: 'medium' },       // צ ↔ ט — דומות בהגייה אצל ילדים
];

/**
 * צמדי דמיון צורניים — מתועדים אך **לא** מופעלים בלוגיקת `areSimilar`.
 *
 * החלטה (2026-05-12): הסבב הנוכחי מטפל בדמיון צלילי בלבד.
 * לפרטים ראו docs/similar-letters.md §9.1.
 *
 * כשיגיע הזמן — לאחד עם `PHONETIC_SIMILARITY_PAIRS` או להוסיף פרמטר `kind`.
 */
export const VISUAL_SIMILARITY_PAIRS_FUTURE: SimilarityPair[] = [
	{ a: 'ba', b: 'va_rafe', kind: 'visual', strength: 'strong' },   // בּ ↔ בַ
	{ a: 'ka', b: 'cha_rafe', kind: 'visual', strength: 'strong' },  // כּ ↔ כַ
	{ a: 'pa', b: 'fa_rafe', kind: 'visual', strength: 'strong' },   // פּ ↔ פַ
	{ a: 'da', b: 'ra', kind: 'visual', strength: 'medium' },        // ד ↔ ר
	{ a: 'cha', b: 'ha', kind: 'visual', strength: 'medium' },       // ח ↔ ה
	{ a: 'va', b: 'za', kind: 'visual', strength: 'medium' },        // ו ↔ ז
	{ a: 'ga', b: 'na', kind: 'visual', strength: 'medium' },        // ג ↔ נ
	{ a: 'ya', b: 'va', kind: 'visual', strength: 'medium' },        // י ↔ ו
	{ a: 'sha', b: 'sa_sin', kind: 'visual', strength: 'strong' },   // שׁ ↔ שׂ
	{ a: 'cha', b: 'tav', kind: 'visual', strength: 'strong' },      // ח ↔ ת
	{ a: 'aa', b: 'tza', kind: 'visual', strength: 'strong' },       // ע ↔ צ
	{ a: 'aa', b: 'ta', kind: 'visual', strength: 'medium' },        // ע ↔ ט
	{ a: 'qa', b: 'ha', kind: 'visual', strength: 'medium' },        // ק ↔ ה
];

/**
 * בונה מפת חבר → קבוצת חברים דומים, מבוססת על הצמדים הצליליים בלבד.
 * לדוגמה: similarMap['sa'] = Set{'sa_sin'}.
 */
function buildSimilarityMap(): Map<string, Set<string>> {
	const m = new Map<string, Set<string>>();
	for (const p of PHONETIC_SIMILARITY_PAIRS) { // ← שינוי: רק צלילי
		if (!m.has(p.a)) m.set(p.a, new Set());
		if (!m.has(p.b)) m.set(p.b, new Set());
		m.get(p.a)!.add(p.b);
		m.get(p.b)!.add(p.a);
	}
	return m;
}

const SIMILARITY_MAP = buildSimilarityMap();

/** האם שני כרטיסים נחשבים "דומים" (לפי הצמדים)? */
export function areSimilar(idA: string, idB: string): boolean {
	if (idA === idB) return true;
	return SIMILARITY_MAP.get(idA)?.has(idB) ?? false;
}

// ===== בחירה ללוח =====

/**
 * אופציות בחירה לבחירת לוח.
 * Phase 1: מקבל pairs: LetterVowelPair[] ישירות (מ-generateDeck).
 */
export type PickBoardOptions = {
	/** מספר כרטיסים בלוח (לפי גודל הגריד) */
	count: number;
	/** האם לוודא שאין שני כרטיסים "דומים" באותו לוח */
	avoidSimilar: boolean;
	/** ה-pairs שנוצרו מ-generateDeck — pool מוכן */
	pairs: LetterVowelPair[];
};

/** מספר ניסיונות מקסימלי לבניית לוח שעומד ב-avoidSimilar */
const PICK_BOARD_MAX_ATTEMPTS = 50;

/**
 * ניסיון בודד לבחירת לוח חמדני: עוברים על pool מעורבב ומוסיפים
 * כרטיס רק אם אף נבחר קודם אינו דומה לו.
 */
function pickBoardAttempt(pool: LetterVowelPair[], count: number): LetterVowelPair[] {
	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	const chosen: LetterVowelPair[] = [];
	const chosenIds = new Set<string>();

	for (const card of shuffled) {
		if (chosen.length >= count) break;
		const conflict = [...chosenIds].some((id) => areSimilar(id, card.id));
		if (!conflict) {
			chosen.push(card);
			chosenIds.add(card.id);
		}
	}
	return chosen;
}

/**
 * בחירת כרטיסים ללוח חדש.
 *
 * מקבל pairs: LetterVowelPair[] שנוצרו מ-generateDeck().
 * אם `avoidSimilar=true`, מנסים עד `PICK_BOARD_MAX_ATTEMPTS` פעמים
 * לבחור לוח רנדומלי שעומד באילוץ.
 */
export function pickBoard(opts: PickBoardOptions): LetterVowelPair[] {
	const pool = opts.pairs;
	if (pool.length === 0) return [];

	if (!opts.avoidSimilar) {
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, Math.min(opts.count, shuffled.length));
	}

	// ננסה כמה פעמים לקבל לוח שעומד ב-constraint
	let best: LetterVowelPair[] = [];
	for (let i = 0; i < PICK_BOARD_MAX_ATTEMPTS; i++) {
		const attempt = pickBoardAttempt(pool, opts.count);
		if (attempt.length === opts.count) return attempt;
		if (attempt.length > best.length) best = attempt;
	}

	// אף ניסיון לא הצליח להגיע ל-count — נשלים מהמאגר בלי האילוץ
	console.warn(
		`[find-letter] avoidSimilar: best attempt got ${best.length}/${opts.count}; filling without constraint.`
	);
	const chosenIds = new Set(best.map((c) => c.id));
	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	for (const card of shuffled) {
		if (best.length >= opts.count) break;
		if (chosenIds.has(card.id)) continue;
		best.push(card);
		chosenIds.add(card.id);
	}

	return best;
}

// Re-export generateDeck for use by game-state (convenience)
export { generateDeck } from './pair';
