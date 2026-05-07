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
 */

export type LetterGroup = 'base' | 'confusing' | 'rafe';

export interface LetterCard {
	/** מזהה ייחודי לכרטיס (לדוגמה 'ba', 'ga', 'va_rafe') */
	id: string;
	/** האות עם הניקוד לתצוגה (לדוגמה 'בַּ', 'בַ') */
	display: string;
	/** הטקסט שיוקרא ע"י ה-TTS (לדוגמה 'בָּה', 'וָה') */
	speak: string;
	/** הקבוצה שאליה שייך הכרטיס */
	group: LetterGroup;
}

// ===== קבוצה: base =====

const BASE_LETTERS: LetterCard[] = [
	{ id: 'a', display: 'אַ', speak: 'אָה', group: 'base' },
	{ id: 'ba', display: 'בַּ', speak: 'בָּה', group: 'base' },
	{ id: 'ga', display: 'גַ', speak: 'גָה', group: 'base' },
	{ id: 'da', display: 'דַ', speak: 'דָה', group: 'base' },
	{ id: 'ha', display: 'הַ', speak: 'הָה', group: 'base' },
	{ id: 'va', display: 'וַ', speak: 'וָה', group: 'base' },
	{ id: 'za', display: 'זַ', speak: 'זָה', group: 'base' },
	{ id: 'cha', display: 'חַ', speak: 'חָה', group: 'base' },
	{ id: 'ta', display: 'טַ', speak: 'טָה', group: 'base' },
	{ id: 'ya', display: 'יַ', speak: 'יָה', group: 'base' },
	{ id: 'ka', display: 'כַּ', speak: 'כָּה', group: 'base' },
	{ id: 'la', display: 'לַ', speak: 'לָה', group: 'base' },
	{ id: 'ma', display: 'מַ', speak: 'מָה', group: 'base' },
	{ id: 'na', display: 'נַ', speak: 'נָה', group: 'base' },
	{ id: 'sa', display: 'סַ', speak: 'סָה', group: 'base' },
	{ id: 'pa', display: 'פַּ', speak: 'פָּה', group: 'base' },
	{ id: 'tza', display: 'צַ', speak: 'צָה', group: 'base' },
	{ id: 'qa', display: 'קַ', speak: 'קָה', group: 'base' },
	{ id: 'ra', display: 'רַ', speak: 'רָה', group: 'base' },
	{ id: 'sha', display: 'שַׁ', speak: 'שָׁה', group: 'base' },
	{ id: 'tav', display: 'תַּ', speak: 'תָּה', group: 'base' }
];

// ===== קבוצה: confusing =====

const CONFUSING_LETTERS: LetterCard[] = [
	{ id: 'sa_sin', display: 'שַׂ', speak: 'סָה', group: 'confusing' },
	{ id: 'aa', display: 'עַ', speak: 'אָה', group: 'confusing' }
];

// ===== קבוצה: rafe =====

const RAFE_LETTERS: LetterCard[] = [
	{ id: 'va_rafe', display: 'בַ', speak: 'וָה', group: 'rafe' },
	{ id: 'cha_rafe', display: 'כַ', speak: 'חָה', group: 'rafe' },
	{ id: 'fa_rafe', display: 'פַ', speak: 'פָה', group: 'rafe' }
];

// ===== מאגר מאוחד =====

export const ALL_LETTERS: LetterCard[] = [...BASE_LETTERS, ...CONFUSING_LETTERS, ...RAFE_LETTERS];

const LETTERS_BY_GROUP: Record<LetterGroup, LetterCard[]> = {
	base: BASE_LETTERS,
	confusing: CONFUSING_LETTERS,
	rafe: RAFE_LETTERS
};

/** מחזיר את כל האותיות בקבוצות הפעילות. */
export function getLettersForGroups(groups: LetterGroup[]): LetterCard[] {
	return groups.flatMap((g) => LETTERS_BY_GROUP[g] ?? []);
}

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
 * צמדים צליליים — נשמעים זהה או כמעט זהה.
 * ראו `docs/similar-letters.md` סעיף 3.
 */
export const SIMILARITY_PAIRS: SimilarityPair[] = [
	// === צמדים צליליים חזקים — שלושת המבוקשים במסמך (סעיף 3) ===
	{ a: 'sa', b: 'sa_sin', kind: 'phonetic', strength: 'strong' }, // ס ↔ שׂ — אותו צליל בעברית מודרנית
	{ a: 'cha_rafe', b: 'cha', kind: 'phonetic', strength: 'strong' }, // כ רפה ↔ ח
	{ a: 'va_rafe', b: 'va', kind: 'phonetic', strength: 'strong' }, // ב רפה ↔ ו

	// === צמדים צליליים חזקים נוספים (מהמסמך, סעיף 3) ===
	{ a: 'ta', b: 'tav', kind: 'phonetic', strength: 'strong' }, // ט ↔ ת
	{ a: 'a', b: 'aa', kind: 'phonetic', strength: 'strong' }, // א ↔ ע — שתיהן אלמות

	// === אותה אות בצורה דגושה ורפה — אסור לערבב אותן באותו לוח ===
	// (מבלבלים מאוד ויזואלית: כּ/כַ, פּ/פַ; ב'/בַ אוטומטית מכוסה ע"י va_rafe↔va)
	{ a: 'ba', b: 'va_rafe', kind: 'visual', strength: 'strong' }, // בּ ↔ בַ (רפה)
	{ a: 'ka', b: 'cha_rafe', kind: 'visual', strength: 'strong' }, // כּ ↔ כַ (רפה)
	{ a: 'pa', b: 'fa_rafe', kind: 'visual', strength: 'strong' }, // פּ ↔ פַ (רפה)

	// === צמדים צורניים (מהמסמך, סעיף 3) ===
	{ a: 'da', b: 'ra', kind: 'visual', strength: 'medium' }, // ד ↔ ר
	{ a: 'cha', b: 'ha', kind: 'visual', strength: 'medium' }, // ח ↔ ה
	{ a: 'va', b: 'za', kind: 'visual', strength: 'medium' }, // ו ↔ ז
	{ a: 'ga', b: 'na', kind: 'visual', strength: 'medium' }, // ג ↔ נ
	{ a: 'ya', b: 'va', kind: 'visual', strength: 'medium' } // י ↔ ו
];

/**
 * בונה מפת חבר → קבוצת חברים דומים, מבוססת על הצמדים.
 * לדוגמה: similarMap['sa'] = ['sa_sin'].
 */
function buildSimilarityMap(): Map<string, Set<string>> {
	const m = new Map<string, Set<string>>();
	for (const p of SIMILARITY_PAIRS) {
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
 */
export interface PickBoardOptions {
	/** מספר כרטיסים בלוח (לפי גודל הגריד) */
	count: number;
	/** הקבוצות הפעילות (מתוכן שואבים אותיות) */
	groups: LetterGroup[];
	/** האם לוודא שאין שני כרטיסים "דומים" באותו לוח */
	avoidSimilar: boolean;
}

/** מספר ניסיונות מקסימלי לבניית לוח שעומד ב-avoidSimilar */
const PICK_BOARD_MAX_ATTEMPTS = 50;

/**
 * ניסיון בודד לבחירת לוח חמדני: עוברים על pool מעורבב ומוסיפים
 * כרטיס רק אם אף נבחר קודם אינו דומה לו.
 */
function pickBoardAttempt(pool: LetterCard[], count: number): LetterCard[] {
	const shuffled = [...pool].sort(() => Math.random() - 0.5);
	const chosen: LetterCard[] = [];
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
 * בחירת אותיות ללוח חדש.
 *
 * אם `avoidSimilar=true`, מנסים עד `PICK_BOARD_MAX_ATTEMPTS` פעמים
 * לבחור לוח רנדומלי שעומד באילוץ. אם אף ניסיון לא הצליח (כי האילוץ
 * חזק מדי בהינתן הקבוצות הפעילות וגודל הלוח), חוזרים למצב הטוב ביותר
 * שנמצא ומשלימים אותו עם כרטיסים נוספים בלי האילוץ — שהמשחק לא ייתקע.
 */
export function pickBoard(opts: PickBoardOptions): LetterCard[] {
	const pool = getLettersForGroups(opts.groups);
	if (pool.length === 0) return [];

	if (!opts.avoidSimilar) {
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, Math.min(opts.count, shuffled.length));
	}

	// ננסה כמה פעמים לקבל לוח שעומד ב-constraint
	let best: LetterCard[] = [];
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
