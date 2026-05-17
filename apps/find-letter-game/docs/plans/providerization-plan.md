# תכנית: Providerization של "איפה האות?" (ומדריך כללי למשחקים אחרים)

> **סטטוס:** תכנון עתידי. **לא בביצוע כרגע.**
> **תלות:** מבוצע **אחרי** שהסוכן הפלטפורמיזציה סיים לחלץ `ContentProvider` multi-axis ל-`learn-booster-kit`, **וגם** אחרי שתכנית הניקוד (`vowels-support-plan.md`) מומשה.
> **מסמך אחות:** [`vowels-support-plan.md`](./vowels-support-plan.md) — בביצוע כעת, ללא Provider. כשהפרוויידוריזציה תבוצע, היא תעטוף את הdata model החדש (Letter, Vowel, Pair, generateDeck) ב-`ContentProvider` multi-axis. הdata model עצמו נשאר כפי שהוא — רק עוטף.
> **מקורות:** `docs/platform-plan.md` §5, `apps/lotto-game/docs/creating-content-provider.md`, `apps/lotto-game/src/lib/content/types.ts`.
>
> **הערה על מיקום המסמך:** המסמך הזה גנרי ומיועד גם למשחקים אחרים בעתיד. כרגע הוא יושב כאן בגלל מסגרת התכנון הנוכחית; כשתוקם תיקיית `docs/plans/` רוחבית במונורפו — צריך להעביר אותו לשם.

---

## 1. מצב נוכחי

### 1.1 בפרויקט בכללותו

‏- **lotto-game** משתמש ב-`ContentProvider<TItem, TSettings>` ציר-יחיד (`apps/lotto-game/src/lib/content/types.ts`), עם רישום ב-`contentRegistry`. שלושה providers: `letters`, `shapes`, `reading`.
‏- **sort-cards-game** משתמש ב-`ContentPack` (פטרן שונה — סטטי במקום זרימה דינמית).
‏- **find-letter-game** **אינו** משתמש ב-Provider. מאגר האותיות והבחירה שלהן hardcoded ב-`utils/letters.ts` + `stores/settings.svelte.ts`.
‏- כל שאר המשחקים — כל אחד עם המודל שלו.

### 1.2 ב-find-letter ספציפית

המודל הקיים:

```ts
// settings.svelte.ts
selectedLetterIds: string[] // 26 ברירת מחדל

// letters.ts
pickBoard({ count, avoidSimilar, selectedLetterIds }): LetterCard[]
```

הלוגיקה: המשתמש בוחר אילו אותיות לכלול → המשחק שולף מהמאגר → בוחר לוח עם `avoidSimilar`.

### 1.3 הצורך שצף

‏- בלוטו — ציר אחד (`items`) מספיק.
‏- ב-find-letter — ברגע שמוסיפים ניקוד, יש שני צירים: **אותיות × ניקוד**. (ראה `vowels-support-plan.md`.)
‏- בעתיד — צירים נוספים: בחיבור גנרי `operandA × operandB`, בצורה+צבע+גודל וכו'.

ה-Provider הקיים של לוטו **לא יודע multi-axis**. צריך להרחיב.

---

## 2. מצב יעד

### 2.1 ב-kit

`learn-booster-kit` יחשוף `ContentProvider<TSettings>` חדש שמבוסס על `SelectionAxis[]` (לפי `platform-plan.md` §5.3):

```ts
export interface SelectionAxis<T = unknown> {
	id: string;                  // 'letters', 'vowels', 'shapes'
	displayName: string;         // מ-language.ts
	icon?: string;
	getAvailableItems(): ContentItem<T>[];
	allowEmpty?: boolean;        // default: false
	minSelected?: number;        // default: 1
}

export type ProviderSelection = Record<string, string[]>;

export interface ContentProvider<TSettings = unknown> {
	id: string;
	displayName: string;
	icon: string;

	selectionAxes: SelectionAxis[];

	generateDeck(selection: ProviderSelection, settings: TSettings): ContentItem[];
	isValidCombination?(combination: Record<string, string>): boolean;

	generateCardContent(item: ContentItem, settings: TSettings): CardContent;
	contentMatches(a: CardContent, b: CardContent): boolean;

	renderComponent: ComponentType;
	settingsComponent?: ComponentType;

	getDefaultSelection(): ProviderSelection;
	getDefaultSettings?(): TSettings;

	prepareForGame?(): void | Promise<void>;
	cardStyles?: CardStyleOptions;

	// ⬇️ חדש — תוספת לטובת משחקים שאוספים deck מראש (כמו find-letter)
	getSpeakText?(item: ContentItem): string | null;
	areItemsSimilar?(a: ContentItem, b: ContentItem): boolean;
}
```

### 2.2 בלוטו

ה-providers הקיימים של לוטו (ציר-יחיד) ימשיכו לעבוד דרך adapter. ראה §6.

### 2.3 ב-find-letter

יוגדר provider אחד — **`hebrewLettersProvider`** — עם 2 צירים: `letters` ו-`vowels`. המשחק יקבל deck מ-`generateDeck()` במקום לבנות אותו לבדו.

---

## 3. ההצעה הגנרית — `ContentProvider` בעולם find-letter ומשחקים דמויי-find-letter

### 3.1 ההפרדה: ה-Provider מספק תוכן, המשחק מספק חוויה

| תחום | באחריות מי? |
|------|-------------|
| מאגר הפריטים הזמינים | Provider |
| חוקי תקפות צירופים (`isValidCombination`) | Provider |
| בניית deck מהבחירה | Provider |
| יצירת `display` ו-`speak` לכל פריט | Provider |
| צמדי דמיון (`areItemsSimilar`) | Provider |
| בחירת לוח (board layout, גודל לוח, `pickBoard`) | המשחק |
| state machine, cooldown, scoring | המשחק |
| הקראת המטרה הנוכחית (TTS playback) | המשחק (משתמש ב-`getSpeakText` של ה-Provider) |
| persistence של הבחירה | kit (`configManager.updateGameSettings`) |
| UI ההגדרות | kit + Provider (קומפוננטה ב-Provider) |

### 3.2 איזה חוזה צריך המשחק לדרוש מה-Provider?

עבור משחקים מסוג "שמע X, מצא X" (find-letter, ובעתיד אולי lotto-mode, מספרים, צורות):

```ts
interface FindGameContract<TItem> {
	getDeck(): ContentItem<TItem>[];          // קלפים זמינים אחרי הסינון
	getSpeakText(item: ContentItem<TItem>): string | null;
	getDisplayComponent(): ComponentType;     // איך מציגים פריט בכרטיס
	areItemsSimilar(a, b): boolean;           // לבחירת לוח עם avoidSimilar
}
```

כל Provider שיממש את החוזה הזה — יוכל לרוץ ב-find-letter. זה הופך את find-letter ל**מסגרת משחק גנרית** ולא ל"משחק האותיות".

---

## 4. תכנון מפורט ל-find-letter

### 4.1 `hebrewLettersProvider` — מבנה

```ts
// apps/find-letter-game/src/lib/content/hebrew-letters-provider.ts
export const hebrewLettersProvider: ContentProvider<HebrewLettersSettings> = {
	id: 'hebrew-letters',
	displayName: 'אותיות עברית',  // מ-language.ts
	icon: '🔤',

	selectionAxes: [
		{
			id: 'letters',
			displayName: 'אותיות',
			getAvailableItems: () => ALL_LETTERS.map(letterToContentItem),
			minSelected: 1
		},
		{
			id: 'vowels',
			displayName: 'ניקוד',
			getAvailableItems: () => ALL_VOWELS.map(vowelToContentItem),
			minSelected: 1
		}
	],

	generateDeck(selection, settings) {
		const letters = lookupLetters(selection.letters ?? []);
		const vowels = lookupVowels(selection.vowels ?? []);
		return cartesianProduct(letters, vowels)
			.filter(({ letter, vowel }) => isValidCombination(letter, vowel))
			.map(({ letter, vowel }) => pairToContentItem(makePair(letter, vowel)));
	},

	isValidCombination(combo) {
		const letter = lookupLetterById(combo.letters);
		const vowel = lookupVowelByCode(combo.vowels);
		if (!letter || !vowel) return false;
		return !(letter.isFinalForm && (vowel.code === 'shva' || vowel.code === 'none'));
	},

	generateCardContent(item, _settings) {
		return {
			providerId: 'hebrew-letters',
			itemId: item.id,
			data: item.value // LetterVowelPair
		};
	},

	contentMatches(a, b) {
		return a.providerId === 'hebrew-letters'
			&& b.providerId === 'hebrew-letters'
			&& a.itemId === b.itemId;
	},

	getSpeakText(item) {
		const pair = item.value as LetterVowelPair;
		return pair.speak;
	},

	areItemsSimilar(a, b) {
		const pa = a.value as LetterVowelPair;
		const pb = b.value as LetterVowelPair;
		if (pa.id === pb.id) return true;
		return areSimilar(pa.letter.id, pb.letter.id); // לוגיקה קיימת מ-letters.ts
	},

	getDefaultSelection() {
		return {
			letters: DEFAULT_LETTER_IDS,
			vowels: ['patah']
		};
	},

	renderComponent: LetterPairView,
	settingsComponent: undefined // ה-kit ירנדר UI אוטומטי לפי selectionAxes
};
```

### 4.2 שינויים במשחק עצמו

| קובץ | שינוי |
|------|--------|
| `stores/settings.svelte.ts` | מסיר `selectedLetterIds`, `avoidSimilar` עובר ל-game settings ולא Provider. בחירת אותיות+ניקוד עוברת ל-`ProviderSelection`. |
| `utils/letters.ts` | פיצול: `data/letters.ts` (מאגר Letter), `data/vowels.ts` (מאגר Vowel), `pair.ts` (`makePair`, `pairToContentItem`), `similarity.ts` (`areSimilar`, `PHONETIC_SIMILARITY_PAIRS`). `pickBoard()` נשאר בקובץ נפרד. |
| `stores/game-state.svelte.ts` | מקבל `deck: ContentItem[]` מה-Provider במקום מ-`getLettersByIds()`. |
| `routes/settings/+page.svelte` | משתמש בקומפוננטה הגנרית של ה-kit לרינדור `selectionAxes`. |
| `routes/+page.svelte` | מקבל מטרה כ-`ContentItem`, ניגון TTS דרך `provider.getSpeakText()`. |

### 4.3 קומפוננטת התצוגה (`LetterPairView`)

קומפוננטה פשוטה שמקבלת `{ content: CardContent }` ומציגה את `display` של ה-pair. אין הבדל עיצובי בין pair של "ב + פתח" ל"ב + עיצור" — שניהם אותיות עם או בלי ניקוד.

### 4.4 Migration ל-Provider Selection

```ts
// v3 → v4
if (raw.version === 3) {
	const oldLetters = raw.selectedLetterIds ?? DEFAULT_LETTER_IDS;
	raw.providerSelection = {
		letters: oldLetters,
		vowels: ['patah']
	};
	delete raw.selectedLetterIds;
	raw.version = 4;
}
```

---

## 5. ההכללה — מה זה אומר למשחקים אחרים

### 5.1 איזה משחקים יוכלו להפיק תועלת מ-Provider multi-axis?

| משחק | צירים | Provider פוטנציאלי |
|------|-------|---------------------|
| find-letter | letters × vowels | hebrewLettersProvider (כאן) |
| lotto-game.letters | letters | letterPairs (אדפטר ציר-יחיד) |
| lotto-game.shapes | shapes | shapesProvider (אדפטר) |
| lotto-game.reading | readingItems | readingProvider (אדפטר) |
| wordys-game | words (אולי × categories) | wordsProvider |
| sort-cards-game | (ContentPack — מודל שונה לחלוטין) | אופציה למיגרציה עתידית |
| מתמטיקה גנרית (היפותטי) | operandA × operandB × operator | mathProvider |

### 5.2 שיתוף providers בין משחקים — מודל Bitsboard

ברגע ש-`hebrewLettersProvider` קיים, **שני** משחקים יכולים לרוץ עליו:

‏- find-letter: "שמע 'בָּ', מצא את הכרטיס".
‏- lotto-game: "מצא זוגות של 'בָּ'+'בָּ'" — דרך adapter שעוטף את ה-2-axis ל-1-axis (תוצאת המכפלה כפריטים מובהקים).

זו בדיוק המטרה. **תוכן נוצר פעם אחת, רץ על מספר משחקים.**

### 5.3 מתי לא להשתמש ב-multi-axis Provider?

‏- משחקים מקובעים מטבעם (`train-addition`, `passcode-practice`) — נשארים ככה. אין טעם להגדיר Provider שלעולם לא יתחלף.
‏- משחקים שמודל ה-`ContentPack` הסטטי מתאים להם יותר (`sort-cards-game`) — אולי, אבל זה מסלול מקביל ולא תלוי.

---

## 6. תאימות לאחור — providers ציר-יחיד של לוטו

לוטו לא חייב לעבור עכשיו ל-multi-axis. ה-kit יחשוף adapter:

```ts
// learn-booster-kit/src/content/legacy-adapter.ts
export function legacyToMultiAxis<TItem, TSettings>(
	legacy: LegacyContentProvider<TItem, TSettings>
): ContentProvider<TSettings> {
	return {
		...legacy,
		selectionAxes: [{
			id: 'items',
			displayName: legacy.displayName,
			icon: legacy.icon,
			getAvailableItems: () => legacy.getAvailableItems(),
			minSelected: 1
		}],
		generateDeck: (selection, settings) => {
			const ids = selection.items ?? [];
			return legacy.getAvailableItems().filter(item => ids.includes(item.id));
		},
		getDefaultSelection: () => ({
			items: legacy.getSelectedItemIds(legacy.getDefaultSettings())
		})
	};
}
```

לוטו עצמו יישאר בלי שינוי קוד. מי שצורך את ה-Provider של לוטו (אם בכלל) — מקבל view של ה-`multi-axis` interface.

---

## 7. מבנה תיקיות מוצע (ב-find-letter)

```
apps/find-letter-game/src/lib/
├── content/                          ⬅️ חדש
│   ├── hebrew-letters-provider.ts    (ה-provider עצמו)
│   ├── data/
│   │   ├── letters.ts                (Letter[] — 26 ערכים)
│   │   ├── vowels.ts                 (Vowel[] — 12 ערכים)
│   │   └── similarity.ts             (PHONETIC_SIMILARITY_PAIRS, areSimilar)
│   ├── pair.ts                       (makePair, pairToContentItem)
│   └── LetterPairView.svelte         (renderComponent)
├── stores/
│   ├── settings.svelte.ts            (משופץ — ProviderSelection)
│   └── game-state.svelte.ts          (מקבל deck מהProvider)
├── utils/
│   ├── pick-board.ts                 (pickBoard pure function, פולש מ-letters.ts הישן)
│   ├── tts.ts                        (כמו היום)
│   └── ...
└── services/
    └── language.ts                   (כמו היום — + שמות vowels/letters)
```

ה-`utils/letters.ts` הקיים — נמחק, כל מה שבו עובר ל-`content/`.

---

## 8. שלבי הביצוע

### פאזה 1 — ה-kit (תלוי בסוכן הפלטפורמיזציה)

‏- חילוץ multi-axis `ContentProvider` ל-kit.
‏- adapter ל-providers ציר-יחיד של לוטו.
‏- קומפוננטה גנרית `<AxisSelector>` שמרנדרת `selectionAxes`.
‏- (לוטו נשאר כמו שהוא — דרך adapter.)

### פאזה 2 — find-letter, עטיפת ה-data model הקיים ב-Provider

‏בשלב זה תכנית הניקוד (`vowels-support-plan.md`) **כבר מומשה**, כלומר יש לנו `Letter`, `Vowel`, `generateDeck()`, ו-UI עם 2 fieldsets. ‏מה שצריך לעטוף:

‏- ‏יצירת `hebrewLettersProvider` שעוטף את `generateDeck()` הקיים.
‏- ‏מיגרציה: `FindLetterSettings.selectedLetterIds + selectedVowels` → `providerSelection: { letters, vowels }`.
‏- ‏איחוד שני ה-fieldsets ל-`<AxisSelector>` גנרי שמרנדר את `selectionAxes`.
‏- ‏בדיקה: המשחק מתנהג זהה.
‏- **יציאה משלב:** find-letter רץ על Provider, פונקציונליות זהה לפני.

### פאזה 3 — אופציונלי: חיבור Provider של אותיות-עברית ל-lotto

ברגע ש-`hebrewLettersProvider` עובד, אפשר להוסיף אותו ל-`apps/lotto-game/src/lib/content/providers/` כאופציה נוספת. **לא חובה בפאזה הזו** — רק הוכחת concept ש-providers משתפים.

---

## 9. שאלות פתוחות

‏**נסגרו (2026-05-17):**

‏- ~~מיקום ה-Provider~~ → נשאר ב-`find-letter-game/src/lib/content/`. ‏יוצא משם רק כשמשחק שני באמת יצרוך אותו (trigger ברור, לא הנחה תיאורטית).

‏**עדיין פתוחות:**

1. **registry גלובלי** — כרגע לוטו מחזיק `contentRegistry` משלו. בעתיד צריך registry חוצה-משחקים? **לא בפאזה 2.**
2. **גנריזציה מלאה של ה-UI להגדרות** — האם הקומפוננטה ב-kit יודעת לרנדר אופציות מסובכות יותר (slider, radio, וכו') או רק checkboxes? **המלצה: בפאזה הזו רק checkboxes; הרחבה לפי צורך.**
3. **שיתוף similarity בין providers** — אם wordys יקבל Provider של מילים, האם יוכל "להשתמש" בלוגיקת similarity של אותיות? **לא רלוונטי כרגע, השאלה רק כשנגיע לזה.**
4. **משחקים מקובעים שמודדים provider** — האם `train-addition` יקבל Provider סינתטי "מספרים 1-100" כדי לקרוא ממנו את הטיפוסים? **לא — overkill.**

---

## 10. מה מבדיל את התכנית הזו מ-`creating-content-provider.md` של לוטו

המסמך של לוטו ([`apps/lotto-game/docs/creating-content-provider.md`](../../../lotto-game/docs/creating-content-provider.md)) הוא **מדריך פרקטי** ל-provider ציר-יחיד בתוך לוטו, נכון לזמן כתיבתו.

המסמך הזה הוא **תכנית הרחבה** — מ-ציר-יחיד ל-multi-axis, מ-Provider בתוך משחק אחד ל-Provider חוצה-משחקים. אחרי הביצוע, צריך לעדכן את המדריך של לוטו (או לכתוב אחד חדש ב-kit) שמכסה את שני המודלים.

---

## 11. מקורות

‏- `docs/platform-plan.md` §5 — תכנון multi-axis Provider (המקור התיאורטי).
‏- `apps/lotto-game/docs/creating-content-provider.md` — המודל הקיים של לוטו.
‏- `apps/lotto-game/src/lib/content/types.ts` — ה-interface הקיים.
‏- [`./vowels-support-plan.md`](./vowels-support-plan.md) — מסמך אחות, use-case ראשון ל-multi-axis.
‏- `docs/component_structure.md` — מבנה קומפוננטות (חל גם על קומפוננטות ב-`content/`).

---

*מסמך תכנון. עדכון אחרון: 2026-05-17.*
