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
 */

const BASE_LETTERS: LetterCard[] = [
	{ id: 'a', display: 'אַ', speak: 'אָא', group: 'base' },
	{ id: 'ba', display: 'בַּ', speak: 'בָּא', group: 'base' },
	{ id: 'ga', display: 'גַ', speak: 'גָא', group: 'base' },
	{ id: 'da', display: 'דַ', speak: 'דָא', group: 'base' },
	{ id: 'ha', display: 'הַ', speak: 'הָא', group: 'base' },
	{ id: 'va', display: 'וַ', speak: 'וָא', group: 'base' },
	{ id: 'za', display: 'זַ', speak: 'זַה', group: 'base' },
	{ id: 'cha', display: 'חַ', speak: 'חָא', group: 'base' },
	{ id: 'ta', display: 'טַ', speak: 'טָא', group: 'base' }, // ט = ת — אותו קובץ TTS
	{ id: 'ya', display: 'יַ', speak: 'יָא', group: 'base' },
	{ id: 'ka', display: 'כַּ', speak: 'כָּא', group: 'base' }, // כּ = ק — אותו קובץ TTS
	{ id: 'la', display: 'לַ', speak: 'לָא', group: 'base' },
	{ id: 'ma', display: 'מַ', speak: 'מָא', group: 'base' },
	{ id: 'na', display: 'נַ', speak: 'נָא', group: 'base' },
	{ id: 'sa', display: 'סַ', speak: 'סָא', group: 'base' },
	{ id: 'pa', display: 'פַּ', speak: 'פָּא', group: 'base' },
	{ id: 'tza', display: 'צַ', speak: '[Israeli accent] צַה', group: 'base' },
	{ id: 'qa', display: 'קַ', speak: 'כָּא', group: 'base' }, // ק = כּ — אותו קובץ TTS
	{ id: 'ra', display: 'רַ', speak: 'רָא', group: 'base' },
	{ id: 'sha', display: 'שַׁ', speak: 'שָׁא', group: 'base' },
	{ id: 'tav', display: 'תַּ', speak: 'טָא', group: 'base' } // ת = ט — אותו קובץ TTS
];

// ===== קבוצה: confusing =====

const CONFUSING_LETTERS: LetterCard[] = [
	{ id: 'sa_sin', display: 'שַׂ', speak: 'סָא', group: 'confusing' },
	{ id: 'aa', display: 'עַ', speak: 'אָא', group: 'confusing' }
];

// ===== קבוצה: rafe =====

const RAFE_LETTERS: LetterCard[] = [
	{ id: 'va_rafe', display: 'בַ', speak: 'וָא', group: 'rafe' },
	{ id: 'cha_rafe', display: 'כַ', speak: 'חָא', group: 'rafe' },
	{ id: 'fa_rafe', display: 'פַ', speak: 'Fa', group: 'rafe' } // תעתיק לטיני — ראה הערה למעלה
];

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
	Fa: 'Fa.mp3'
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

export const ALL_LETTERS: LetterCard[] = [...BASE_LETTERS, ...CONFUSING_LETTERS, ...RAFE_LETTERS];

export const LETTERS_BY_GROUP: Record<LetterGroup, LetterCard[]> = {
	base: BASE_LETTERS,
	confusing: CONFUSING_LETTERS,
	rafe: RAFE_LETTERS
};

/** מחזיר את כל האותיות בקבוצות הפעילות. */
export function getLettersForGroups(groups: LetterGroup[]): LetterCard[] {
	return groups.flatMap((g) => LETTERS_BY_GROUP[g] ?? []);
}

// ===== כל האותיות לפי סדר א-ב =====

/** מפה פנימית: id → LetterCard, לשימוש ב-ALL_LETTERS_ALPHABETICAL */
const _lettersById = new Map(ALL_LETTERS.map(c => [c.id, c]));

/**
 * כל 26 האותיות לפי סדר א-ב — לתצוגה ב-UI של בחירת אותיות.
 * הסדר: א, בּ, בַ, ג, ד, ה, ו, ז, ח, ט, י, כּ, כַ, ל, מ, נ, ס, ע, פּ, פַ, צ, ק, ר, שׁ, שׂ, ת
 */
export const ALL_LETTERS_ALPHABETICAL: LetterCard[] = [
	'a', 'ba', 'va_rafe', 'ga', 'da', 'ha', 'va', 'za', 'cha', 'ta', 'ya',
	'ka', 'cha_rafe', 'la', 'ma', 'na', 'sa', 'aa', 'pa', 'fa_rafe', 'tza',
	'qa', 'ra', 'sha', 'sa_sin', 'tav'
].map(id => _lettersById.get(id)!);

/** מזהי כל 26 האותיות — ברירת המחדל לבחירת אותיות */
export const DEFAULT_LETTER_IDS: string[] = ALL_LETTERS_ALPHABETICAL.map(c => c.id);

/**
 * מחזיר כרטיסי אותיות לפי רשימת מזהים.
 * שומר על סדר הקלט. מדלג על מזהים לא-מוכרים.
 */
export function getLettersByIds(ids: string[]): LetterCard[] {
	const byId = new Map(ALL_LETTERS.map(c => [c.id, c]));
	return ids.flatMap(id => {
		const c = byId.get(id);
		return c ? [c] : [];
	});
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
 * תומך בשני מצבים:
 *   1. selectedLetterIds (מצב חדש) — רשימת מזהי אותיות ישירות.
 *   2. groups (מצב ישן, deprecated) — לתאימות לאחור.
 */
export type PickBoardOptions = {
	/** מספר כרטיסים בלוח (לפי גודל הגריד) */
	count: number;
	/** האם לוודא שאין שני כרטיסים "דומים" באותו לוח */
	avoidSimilar: boolean;
} & (
	| {
			/** מזהי האותיות הנבחרות להצגה בלוח */
			selectedLetterIds: string[];
			groups?: never;
	  }
	| {
			/**
			 * @deprecated השתמש ב-selectedLetterIds במקום.
			 * נשמר לתאימות לאחור עם קוד ישן שמשתמש בקבוצות.
			 */
			groups: LetterGroup[];
			selectedLetterIds?: never;
	  }
);

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
	// תמיכה בשני מצבי קריאה: selectedLetterIds (חדש) ו-groups (ישן — לתאימות)
	const pool = 'selectedLetterIds' in opts && opts.selectedLetterIds !== undefined
		? getLettersByIds(opts.selectedLetterIds)
		: getLettersForGroups(('groups' in opts && opts.groups) ? opts.groups : []);
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
