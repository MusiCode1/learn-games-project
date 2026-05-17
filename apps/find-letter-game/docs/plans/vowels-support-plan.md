# תכנית: תמיכה בסוגי ניקוד במשחק "איפה האות?"

> **סטטוס:** תכנון. בביצוע (פאזות אינקרמנטליות).
> **תלות:** עצמאי — לא תלוי בסוכן הפלטפורמיזציה / kit Provider.
> **מסמך קשור:** [`providerization-plan.md`](./providerization-plan.md) — תכנית עתידית נפרדת. כשתבוצע, היא תעטוף את הdata model החדש של מסמך זה ב-`ContentProvider` multi-axis. בינתיים — הdata model החדש חי בתוך `find-letter-game` עצמו.
> **מקור השראה:** [`../kriale-vowels-generator.md`](../kriale-vowels-generator.md) — תיעוד "קריאה להמראה".

---

## 1. מצב נוכחי

קובץ `src/lib/utils/letters.ts` מגדיר 26 כרטיסים, **כולם עם פתח**:

```ts
{ id: 'ba', display: 'בַּ', speak: 'בָּא', group: 'base' }
```

- האות והניקוד מקובעים יחד ב-`display`.
- `speak` נוצר כקבוע (אות + קמץ + א בסוף, ל-TTS יציב — אומת מול Gemini transcription).
- בחירת המשתמש: `selectedLetterIds: string[]` — רק רשימת אותיות, אין ציר ניקוד.
- TTS_FILES ממפה `speak` text → קובץ MP3 ב-R2.

**מגבלה מרכזית:** אין דרך ללמד את התלמיד "ניקוד" כמושג, או לתרגל אותה אות עם תנועות שונות.

---

## 2. מצב יעד

‏- האות והניקוד **מופרדים** במודל הנתונים.
‏- המשתמש בוחר משני צירים: **אותיות** × **ניקוד**.
‏- ה-deck הוא **מכפלה קרטזית מסוננת** של הבחירות (כמו ב-kriale).
‏- תמיכה בכל 12 סוגי הניקוד של kriale, **כולל "עיצור" (none)** שמשמעו "האות לבד" — TTS כהברה עם שווא נח (`בְּ`, `גְּ`, `מְ`).
‏- בפועל, הביצוע יהיה **פאזתי** — ראה §8.

---

## 3. מודל הנתונים החדש

### 3.1 הפרדה: `Letter` × `Vowel`

```ts
/** ניקוד — סימן אחד בלבד, ללא קשר לאות */
export type VowelCode =
	| 'patah'    // ַ  U+05B7
	| 'kamatz'   // ָ  U+05B8
	| 'shva'     // ְ  U+05B0
	| 'none'     // — (עיצור)
	| 'segol'    // ֶ  U+05B6
	| 'tzere'    // ֵ  U+05B5
	| 'hirik'    // ִ  U+05B4
	| 'kubutz'   // ֻ  U+05BB
	| 'shuruk'   // וּ U+05D5+U+05BC (מורכב — דורש טיפול מיוחד)
	| 'holam'    // ֹ  U+05B9
	| 'hataf-patah'  // ֲ
	| 'hataf-segol'; // ֱ

export interface Vowel {
	code: VowelCode;
	displayName: string;     // "פתח", "עיצור", ...
	mark: string;            // "ַ" — ה-combining character (ריק ל-none)
	speakSuffix: string;     // איך מבטאים את הצירוף "אות+ניקוד" ב-TTS (ראה §4)
}

/** אות עברית — הצורה העירומה ביותר שניתן */
export interface Letter {
	id: string;              // 'b', 'b-dagesh', 'k-final', 'sh-right', ...
	char: string;            // 'ב' (בלי דגש, בלי ניקוד)
	displayChar: string;     // 'בּ' אם דגושה, 'ך' אם סופית — לתצוגה
	name: string;            // 'בית', 'בית דגושה' — לטקסט נגיש/dev-tools
	hasDagesh: boolean;      // האם הצורה הזו כוללת דגש בנוי-פנימה (בּ, כּ, פּ, תּ)
	isFinalForm: boolean;    // האם זו צורה סופית (ך, ם, ן, ף, ץ)
	sinSide?: 'right' | 'left'; // עבור שׁ ו-שׂ
}
```

### 3.2 הצירוף — `LetterVowelPair` (נגזר, לא נשמר)

```ts
/** צירוף שמוצג כקלף בודד במשחק */
export interface LetterVowelPair {
	id: string;              // `${letter.id}__${vowel.code}` — `b__patah`, `b__none`
	letter: Letter;
	vowel: Vowel;
	display: string;         // 'בַּ' — מורכב מ-letter.displayChar + vowel.mark
	speak: string;           // 'בָּא' / 'בְּ' / 'בִּי' — לפי TTS strategy (§4)
}
```

הצירוף **נגזר תמיד מ-`Letter`+`Vowel`** דרך פונקציה pure:

```ts
function makePair(letter: Letter, vowel: Vowel): LetterVowelPair { ... }
```

זה מאפשר ל-deck להיווצר on-the-fly מבחירת המורה.

### 3.3 מאגרי הנתונים

מבנה פנימי ב-find-letter (בלי Provider — ישר ב-`lib/`):

‏- `lib/data/letters.ts` — 26+ ערכי `Letter` (פתיחה: 26 בסיסיות; בעתיד +5 סופיות).
‏- `lib/data/vowels.ts` — 12 ערכי `Vowel`.
‏- `lib/data/pair-tts.ts` — מיפוי `pairId → mp3-filename`, או נגזר אוטומטית מ-`speak`.
‏- `lib/utils/pair.ts` — `makePair()`, `generateDeck()`, `isValidCombination()`.
‏- `lib/utils/letters.ts` הקיים — נשאר, אבל מצומצם: רק `pickBoard()` ו-similarity. המאגר עצמו עובר ל-`data/letters.ts`.

---

## 4. אסטרטגיית TTS

### 4.1 העיקרון

כל צירוף `LetterVowelPair` מחזיק `speak: string`. מנגנון ה-TTS הקיים (פרוקסי AAC + cache R2 + ElevenLabs eleven_v3) ימשיך לעבוד כמו שהוא — הוא הופך טקסט ל-MP3 דרך hash דטרמיניסטי.

**שינוי:** במקום שלכל כרטיס יהיה `speak` קבוע ב-`letters.ts`, ה-`speak` נגזר מ-`{letter, vowel}`.

### 4.2 חוקי הגזירה (טבלת `vowel.speakSuffix`)

| `vowel.code` | `mark` | `speakSuffix` | דוגמה (`ב`) | הערה |
|--------------|--------|---------------|-------------|------|
| `patah`      | ַ      | "ָ" + "א"      | `בָּא`       | כמו היום (קמץ + א ב-TTS) |
| `kamatz`     | ָ      | "ָ" + "א"      | `בָּא`       | **זהה צלילית לפתח — אותו MP3.** ראה §4.3 |
| `shva`       | ְ      | "ְ"            | `בְּ`        | שווא נע — דורש בדיקת eleven_v3 |
| `none`       | (אין)  | "ְ"            | `בְּ`        | **עיצור** — אותו צליל כמו שווא נח |
| `segol`      | ֶ      | "ֶ" + "א"      | `בֶּא`       | |
| `tzere`      | ֵ      | "ֵ" + "א"      | `בֵּא`       | |
| `hirik`      | ִ      | "ִ" + "י"      | `בִּי`       | חיריק → מסיים ב-יוד |
| `kubutz`     | ֻ      | "ֻ"            | `בֻּ`        | קצרצר — אולי דורש פוסט-עיבוד |
| `shuruk`     | וּ     | "וּ"           | `בּוּ`       | מורכב (ו+דגש) — דורש unicode care |
| `holam`      | ֹ      | "ֹ" + "א"      | `בֹּא`       | |
| `hataf-patah`| ֲ      | "ֲ" + "א"      | `בֲּא`       | חטף — מאוד קצר; אולי זהה לפתח |
| `hataf-segol`| ֱ      | "ֱ" + "א"      | `בֱּא`       | |

### 4.3 קמץ ≡ פתח — שיתוף MP3

‏בעברית מודרנית קמץ ופתח נשמעים זהים (חוץ מקמץ קטן, שלא מטופל במשחק). **החלטה:** קובץ MP3 משותף לשניהם. ה-`speak` של pair `<letter, kamatz>` ושל `<letter, patah>` יהיה זהה (`בָּא`), והקובץ מ-R2 יוגש פעמיים. שני ה-pairs נשארים **כרטיסים נפרדים** במשחק (`display` שונה: `בַּ` vs `בָּ`) — רק ה-audio משותף.

### 4.4 גרוניות (א, ע) + עיצור (none) — מקרה מיוחד

הצליל הרצוי: **glottal stop קצר עם שובל אוויר** — "אֶה" קצרצר ולא מאומץ, כמו "מכת תוף" או אנחה קלה. לא `אַה` מלא, ולא שתיקה גמורה.

‏דרכי מימוש אפשריות (לנסות בעת הייצור — לא נקבע מראש):

‏1. **תעתיק לטיני קצר** ‏ב-`speak`, למשל `'eh'` או `'uh'`. eleven_v3 קורא תעתיק כפי שנכתב.
‏2. **Audio tags של eleven_v3** ‏— `[short ah] [breath]` או דומה.
‏3. **קובץ ייעודי שהוקלט/נחתך ידנית** ‏שעוקף את ה-TTS לחלוטין עבור שני המקרים האלה (`<a, none>`, `<aa, none>`).

‏אסטרטגיית בדיקה: לייצר 3-4 variants לכל אות גרונית, להאזין, לבחור הטוב ביותר. אם איכות לא משביעת רצון בכל הניסיונות — נכין קובץ אחד "אֶה קצר" משותף ל-`a` ו-`aa`.

**חוקי קצה נוספים:**
1. שורוק (`וּ`) על אות שאינה ו דורש שילוב unicode `letter + ו + dagesh` שדורש אימות. **פנימי לפיתוח — אני אטפל בעת המימוש.**

### 4.5 שלב אימות פר-ניקוד

לפני הוספת כל ניקוד חדש למאגר הזמין למשתמש, נעבור על השלבים הבאים:

1. ייצור MP3 דרך הפרוקסי לכל 26 הצירופים (`<letter, vowel>`).
2. הקשבה ידנית + (אופציונלי) Gemini transcription אוטומטי כמו ב-walkthrough §9.
3. תיקון `speak` ידני לצירופים שיוצאים גרוע (כמו `Fa` הלטיני לפי הצורך).
4. עדכון `pair-tts.ts` ו-deploy.

### 4.6 fallback

אם צירוף לא קיים ב-cache + הפרוקסי כושל → המשחק לא יציע את הצירוף בלוח. זאת על-ידי סינון פנימי ב-`generateDeck()`.

---

## 5. בחירת המורה — UI

### 5.1 מבנה

מסך ההגדרות הקיים `/settings/+page.svelte` יקבל אזור חדש:

```
┌─ אותיות ─────────────────────────┐
│ [✓] הכל  (26 נבחרות)             │
│ [✓] א  [✓] בּ  [✓] ב  [✓] ג ...   │
└──────────────────────────────────┘

┌─ ניקוד ──────────────────────────┐
│ [✓] הכל  (3 נבחרים)              │
│ [✓] פתח  [✓] עיצור  [✓] חיריק    │
│ [ ] קמץ  [ ] שווא  [ ] סגול ...  │
└──────────────────────────────────┘
```

### 5.2 ולידציה

‏- חייב להיות **לפחות אות אחת** (קיים).
‏- חייב להיות **לפחות ניקוד אחד** (חדש).
‏- מעבר עתידי לסופיות: סופית + (שווא/none) → תוצג הודעה "אין צירופים תקפים. בחרי ניקוד אחר או הסירי סופיות."

### 5.3 קומפוננטה

UI ספציפי ב-`/settings/+page.svelte` של find-letter — fieldset של ניקוד נוסף לקיים של אותיות. דומה מבנית לקיים, לא קומפוננטה גנרית.

**הערה עתידית:** ‏כשתבוצע התכנית של פרוויידוריזציה (`providerization-plan.md`), שני ה-fieldsets האלה יתאחדו לקומפוננטה גנרית `<AxisSelector>` שמרנדרת כל `selectionAxes` של provider. בינתיים — שני fieldsets ספציפיים מספיקים. הקוד שלהם דומה מספיק שהריפקטור יהיה ישיר.

---

## 6. הגדרות (settings)

### 6.1 מבנה חדש

`FindLetterSettings` ב-`stores/settings.svelte.ts` יקבל שדה חדש:

```ts
function makeDefaults() {
	return {
		// ... קיים
		selectedLetterIds: [...DEFAULT_LETTER_IDS] as string[],
		selectedVowels: ['patah'] as VowelCode[], // 👈 חדש
		// ...
	};
}
```

### 6.2 מיגרציה

`settings-migration.ts` יקבל גרסת migration חדשה:

```ts
// v3 → v4
if (raw.version === 3) {
	raw.selectedVowels = ['patah']; // ברירת מחדל = התנהגות הקיימת
	raw.version = 4;
}
```

מבטיח שכל המשתמשים הקיימים נשארים עם החוויה הזהה (פתח בלבד) עד שיפעילו ניקודים נוספים בעצמם.

### 6.3 קוד `language.ts`

כל שמות הניקודים בעברית (`פתח`, `עיצור`, `שווא`, ...) **חייבים** ב-`language.ts` ולא ב-`vowels.ts`. ב-`vowels.ts` ישבו רק קודים וסימני unicode.

---

## 7. בחירת לוח (`pickBoard`) — עדכון

הפונקציה `pickBoard()` ב-`letters.ts` מקבלת היום `selectedLetterIds: string[]`. במצב החדש היא תקבל deck של `LetterVowelPair[]` שכבר נוצר:

```ts
// היום
pickBoard({ count, avoidSimilar, selectedLetterIds })

// מחר
pickBoard({ count, avoidSimilar, pairs }) // pairs: LetterVowelPair[]
```

**מי בונה את ה-pairs?** ‏פונקציה pure ‏ב-`lib/utils/pair.ts`:

```ts
function generateDeck(
	selectedLetterIds: string[],
	selectedVowels: VowelCode[]
): LetterVowelPair[] {
	const letters = lookupLetters(selectedLetterIds);
	const vowels = lookupVowels(selectedVowels);
	return cartesianProduct(letters, vowels)
		.filter(({ letter, vowel }) => isValidCombination(letter, vowel))
		.map(({ letter, vowel }) => makePair(letter, vowel));
}
```

‏הקריאה: `game-state.svelte.ts` ‏יקרא ‏`generateDeck(settings.selectedLetterIds, settings.selectedVowels)` ‏ויעביר ל-`pickBoard`.

### 7.1 דמיון (similarity) — שינוי משמעות

צמדי הדמיון הקיימים (`PHONETIC_SIMILARITY_PAIRS`) הם בין `letter.id` — בלי תלות בניקוד. במצב החדש:

‏- שני pairs נחשבים "דומים" אם:
  ‏- אותה אות (`a.letter.id === b.letter.id`) **או**
  ‏- האותיות שלהם בצמד phonetic (`areSimilar(a.letter.id, b.letter.id)`).
‏- הניקוד **לא משפיע** על similarity (לפחות בגרסה ראשונה).

זה תואם את המודל הקיים: אם המורה בחר `ב` + `ו` עם פתח וגם עם חיריק, הלוח לא יציג `בַּ` ו-`וַ` יחד (דומים), אבל **יציג** `בַּ` ו-`בִּי` יחד (אותה אות, ניקוד שונה — תרגיל לגיטימי).

‏**שאלה פתוחה:** האם להוסיף flag `avoidSameLetter` בנפרד מ-`avoidSimilar`?

---

## 8. שלבי הביצוע

### פאזה 1 — Refactor למבנה Letter + Vowel (ניטרלי למשתמש)

**מטרה:** ‏פיצול ה-data model בלי לשנות את חוויית המשתמש. אחרי הפאזה הזו ‏המשחק מתנהג זהה לקיים — רק שמתחת למכסה המנוע, ‏ה-deck נוצר מ-`generateDeck()` שמקבל letters × vowels.

**TODO:**
1. ‏צור `lib/data/vowels.ts` ‏עם **2 ערכים בלבד**: `patah` ו-`none`. ‏שאר 10 הניקודים יתווספו בפאזה 3.
2. ‏צור `lib/data/letters.ts` ‏עם 26 ערכי `Letter` (פיצול מ-`LetterCard` הקיים — בלי `vowel` בתוך הערך).
3. ‏צור `lib/utils/pair.ts` ‏עם `makePair()`, `generateDeck()`, `isValidCombination()`.
4. ‏עדכן `FindLetterSettings`: ‏הוסף `selectedVowels: VowelCode[]` עם default `['patah']`.
5. ‏Migration `v3→v4`: ‏ערך ברירת מחדל ‏`selectedVowels = ['patah']`.
6. ‏עדכן `game-state.svelte.ts`: ‏קורא ל-`generateDeck(settings.selectedLetterIds, settings.selectedVowels)` ‏ומעביר ‏ל-`pickBoard()`.
7. ‏עדכן `pickBoard()` ב-`letters.ts`: ‏מקבל `pairs: LetterVowelPair[]` במקום `selectedLetterIds`.
8. ‏עדכן UI ‏של הלוח: ‏מציג `pair.display` ‏ושולח ‏`pair.speak` ל-TTS.
9. ‏Mockup compliance audit: ‏המשחק מתנהג זהה לקיים. ‏אין שינוי visual.

‏**יציאה משלב:** ‏המשתמש לא רואה שום שינוי. ‏המבנה הפנימי החדש פעיל.

### פאזה 2 — חשיפת UI ניקוד + תמיכה בעיצור

‏אחרי שהמבנה החדש יציב — חשיפת fieldset של ניקוד למשתמש, ‏עם ‏2 ערכים: `patah` ו-`none`.

**TODO:**
1. ‏ייצור MP3 ל-26 הצירופים `<letter, none>`: ‏`speak = letter + שווא` (`בְּ`, `גְּ`, ...).
2. ‏טיפול בגרוניות (א, ע) + עיצור: ‏ניסויים ‏(תעתיק לטיני / audio tags / קובץ ייעודי) ‏לפי §4.4. ‏בחירת ה-variant הטוב ביותר.
3. ‏עדכון `lib/data/pair-tts.ts` ‏עם המיפויים החדשים.
4. ‏הוספת fieldset "ניקוד" ב-`/settings/+page.svelte`. ‏ולידציה: לפחות ניקוד אחד.
5. ‏עדכון `language.ts` ‏עם שמות הניקודים בעברית.
6. ‏Mockup compliance audit: ‏screenshot של מסך ההגדרות ‏(עם fieldset ניקוד) ‏+ screenshot של לוח שמערב פתח ועיצור ‏+ flow מלא ‏(בחירה → לוח → השמעה → לחיצה נכונה).

‏**יציאה משלב:** ‏המשתמש בוחר בין פתח לעיצור, באותו לוח או בנפרד.

### פאזה 3 — הוספת 10 הניקודים הנותרים

‏כל סבב = ניקוד אחד. סדר מומלץ (לפי תדירות בעברית בסיסית):

1. ‏חיריק (`hirik`) — תנועה נפוצה.
2. ‏סגול (`segol`).
3. ‏חולם (`holam`).
4. ‏שורוק (`shuruk`) — דורש טיפול unicode מיוחד.
5. ‏צירה (`tzere`).
6. ‏שווא (`shva`) — דומה לעיצור, מצריך הסבר פדגוגי.
7. ‏קמץ (`kamatz`) — צלילית זהה לפתח; MP3 משותף לפי §4.3.
8. ‏קובוץ (`kubutz`).
9. ‏חטף פתח (`hataf-patah`).
10. ‏חטף סגול (`hataf-segol`).

לכל ניקוד: ייצור MP3 → בדיקה → תיעוד החריגות → release.

### פאזה 4 — סופיות (out of scope של תכנון זה)

עתידי. דורש: 5 ערכי `Letter` חדשים, מנגנון `isValidCombination` לסינון `final + (shva|none)`, MP3 ייעודיים.

---

## 9. חוקי סינון (`isValidCombination`)

לפי המודל של kriale (תועד ב-§7 של מסמך kriale):

```ts
function isValidCombination(letter: Letter, vowel: Vowel): boolean {
	// סופית + שווא/עיצור = פסול
	if (letter.isFinalForm && (vowel.code === 'shva' || vowel.code === 'none')) {
		return false;
	}
	// בעתיד: צירופים נוספים שהוכחו כבעייתיים ב-TTS
	return true;
}
```

‏בפאזה 1-2 אין סופיות, אז הפונקציה לעולם לא תחזיר `false`. בפאזה 3 היא תהפוך פעילה.

---

## 10. תאימות לאחור (Backward Compatibility)

‏- **משתמשים קיימים**: ‏מיגרציה אוטומטית של settings (v3→v4) שולחת `selectedVowels = ['patah']`. חוויה זהה.
‏- **קוד legacy**: `getLettersByIds()` ו-`pickBoard()` עם `selectedLetterIds` נשמרים כ-shims שמתרגמים לפנים ל-API החדש.
‏- **TTS_FILES legacy**: הקבצים הקיימים (`Ba.mp3`, `Ka.mp3`, וכו') ימשיכו לעבוד דרך מיפוי בודד — ה-`speak` של pair `<b, patah>` נשאר `בָּא`.

---

## 11. שאלות פתוחות

‏**נסגרו (2026-05-17):**

‏- ~~קמץ vs פתח~~ → אותו MP3, כרטיסים נפרדים. (§4.3)
‏- ~~שווא נח על גרוניות~~ → "מכת תוף / אנחה קצרה — אֶה קצר". אסטרטגיית מימוש בעת הייצור. (§4.4)
‏- ~~פרסטים תמטיים~~ → לא נחוץ. בחירת אותיות+ניקוד מהצירים בעצמה כבר נותנת למורה את הגמישות הנדרשת.

‏**עדיין פתוחות:**

1. **דגש כתת-ניקוד** — מבחינה לשונית `בּ` שונה מ-`ב`. אצלנו זה מוגדר כשתי אותיות נפרדות. צריך להישאר ככה גם בעולם החדש (יותר ברור פדגוגית).
2. **avoid-same-letter ב-board** — האם להוסיף flag נפרד מ-`avoidSimilar`? למשל אם המשתמש בחר `ב` עם פתח וגם עם חיריק, האם `בַּ` ו-`בִּי` יכולים להופיע באותו לוח? נחליט בעת מימוש לפי תחושת UX.

---

## 12. Handoff ל-Sonnet

‏ביצוע הפאזות מועבר ל-Sonnet executor דרך `Task(subagent_type="executor", ...)`. ‏המסמך הזה הוא **תכנון אסטרטגי** — לא brief מבצעי.

‏הפאזות שלנו **כולן בטווח complexity score 0-3** ‏(pure logic / refactor, ‏עם TDD, ‏ללא cross-package / protocols חדשים). ‏לכן:

‏- ‏`verifier-slice: light` ‏לכל פאזה (~15 דק').
‏- ‏**אין verifier-phase** — לא נדרש לscore נמוך.

‏לפני כל פאזה:

1. ‏Opus כותב brief מפורט ב-`briefs/phase-N-{name}-brief.md` ‏לפי [`briefs/README.md`](./briefs/README.md).
2. ‏ה-brief מקשר לסעיף הרלוונטי כאן ‏ול-[`sonnet-pitfalls.md`](./sonnet-pitfalls.md).
3. ‏אישור משתמש לbrief.
4. ‏`Task(subagent_type="executor", prompt="brief: <path>, slice: <name>, env: ...")`.
5. ‏בסוף — `Task(subagent_type="verifier-slice-light", ...)` → דוח ב-`verification/<phase>-report.md`.
6. ‏Opus קורא דוח. אם נקי — אישור משתמש → commit. ‏אם לא — iteration.

## 13. מקורות

‏- [`../kriale-vowels-generator.md`](../kriale-vowels-generator.md) — המסמך המקורי על "קריאה להמראה".
‏- [`../similar-letters.md`](../similar-letters.md) — צמדי הדמיון הקיימים.
‏- [`./providerization-plan.md`](./providerization-plan.md) — מסמך אחות; שני המסמכים יחד מהווים את התכנית המלאה.
‏- `docs/platform-plan.md` §5 — תכנון multi-axis Provider רוחבי.

---

*מסמך תכנון. עדכון אחרון: 2026-05-17.*
