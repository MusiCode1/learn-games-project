---
phase: phase-1-letter-vowel-refactor
verifier-slice: light
complexity-score: 1
---

# ‏Phase 1 — Refactor: ‏פיצול `LetterCard` ל-`Letter` + `Vowel` (ניטרלי למשתמש)

## ‏Context

‏תכנון אסטרטגי: [`../vowels-support-plan.md`](../vowels-support-plan.md)
‏אזהרות Sonnet: [`../sonnet-pitfalls.md`](../sonnet-pitfalls.md)

‏המטרה הסופית של תכנית הניקוד היא ‏לאפשר למשתמש לבחור משני צירים — ‏**אותיות × ניקוד**. ‏בפאזה הזו נשנה רק את ה-data model מתחת למכסה המנוע. **המשתמש לא יראה שום שינוי.**

## ‏Scope

### ‏מה כן

‏- ‏פיצול `LetterCard` ‏(שמכיל גם אות וגם פתח, מקובע) ‏ל-`Letter` + `Vowel` + `LetterVowelPair` ‏נגזר.
‏- ‏יצירת `generateDeck()` ‏שמייצר deck של pairs ‏מ-`selectedLetterIds × selectedVowels`.
‏- ‏הוספת `selectedVowels: VowelCode[]` ‏ל-settings, ‏עם default `['patah']`.
‏- ‏Migration v3→v4: ‏ל-settings קיימים, ‏default `selectedVowels = ['patah']`.
‏- ‏עדכון `pickBoard()` ‏לקבל `pairs` במקום `selectedLetterIds`.
‏- ‏עדכון `game-state` ‏לקרוא ל-`generateDeck` ‏ולהעביר את התוצאה.

### ‏מה לא

‏- ‏**אין שינוי ב-UI** ‏(לא ב-`/settings`, ‏לא בלוח). ‏השדה `selectedVowels` ‏לא מוצג בהגדרות.
‏- ‏אין ייצור MP3 חדשים — ‏ה-`speak` של pair `<letter, patah>` ‏זהה ל-`speak` הקיים של אותו letter (`בָּא`, `גָא` וכו'), ‏המיפוי ב-`TTS_FILES` ‏עובד בלי שינוי.
‏- ‏אין הוספת ערכים חדשים ל-`Vowel[]` ‏מעבר ל-`patah` ‏ו-`none` (`none` ‏נוסף כתשתית, ‏אבל **לא** ‏ייווצרו pairs עם `none` ‏בפאזה זו — ‏ה-default `selectedVowels: ['patah']` מבטיח שזה לא יקרה).
‏- ‏אין שינוי ב-similarity logic — ‏`PHONETIC_SIMILARITY_PAIRS` ‏נשאר כפי שהוא, ‏`areSimilar(letterId, letterId)` ‏נשאר ‏על `Letter.id`.

## ‏Architecture: ‏מ-`LetterCard` ל-`LetterVowelPair`

```ts
// ‏היום (legacy)
interface LetterCard {
  id: string;        // 'ba'
  display: string;   // 'בַּ'
  speak: string;     // 'בָּא'
  group: LetterGroup;
}

// ‏החדש
interface Letter {
  id: string;             // 'b' (עירומה, ‏בלי ניקוד)
  char: string;           // 'ב'
  displayChar: string;    // 'בּ' (עם דגש אם רלוונטי)
  name: string;           // 'בית דגושה'
  hasDagesh: boolean;
  isFinalForm: boolean;
  sinSide?: 'right' | 'left';
  group: LetterGroup;     // ‏נשאר לתאימות
  /** ‏מיפוי id ישן של LetterCard ל-letter החדש — ‏לתאימות לאחור עם settings ו-similarity */
  legacyCardId: string;   // 'ba' (= ה-id הישן של LetterCard עם פתח)
}

type VowelCode = 'patah' | 'none';  // ‏פאזה 1: ‏שני אלה בלבד

interface Vowel {
  code: VowelCode;
  displayName: string;   // ‏מ-language.ts
  mark: string;          // 'ַ' ‏או '' (none)
  /** ‏בנייה דינמית של speak מצירוף letter+vowel. ‏פאזה 1: ‏רק patah → 'ָא' */
  speakSuffix: string;
}

interface LetterVowelPair {
  /** ‏id מורכב: `${letter.legacyCardId}` ‏עבור patah (תאימות), ‏`${letter.id}__none` ‏עבור none */
  id: string;
  letter: Letter;
  vowel: Vowel;
  display: string;     // ‏נבנה: letter.displayChar + vowel.mark
  speak: string;       // ‏נבנה: letter.char + vowel.speakSuffix (‏או הסוואה ‏ל-speak הישן עבור patah)
  /** ‏לתאימות עם קוד legacy שמצפה ל-LetterCard */
  group: LetterGroup;
}
```

### ‏Backwards-compat critical decision

‏**`pair.id` של `<letter, patah>` ‏שווה ל-`LetterCard.id` ‏הישן.** ‏זה מאפשר:
‏- ‏`selectedLetterIds: ['ba', 'ga', ...]` ‏הקיים — ‏ממשיך לעבוד. ‏הוא מצביע על ‏ה-`legacyCardId` ‏של ‏`Letter`.
‏- ‏`PHONETIC_SIMILARITY_PAIRS` ‏שמשתמש ב-ids כמו `'ba'`, `'va_rafe'` — ‏ממשיך לעבוד.
‏- ‏`TTS_FILES['בָּא'] = 'Ba.mp3'` — ‏ממשיך לעבוד, ‏כי ה-`speak` של pair `<b, patah>` ‏נבנה להיות בדיוק `'בָּא'`.

‏**עבור pair `<letter, none>`** ‏ה-id הוא ‏`'b__none'`, ‏ה-`speak` הוא ‏`'בְּ'`. ‏בפאזה 1 ‏זה לא יקרה בפועל כי ‏`selectedVowels = ['patah']` ‏(אבל המבנה מוכן לפאזה 2).

## ‏Sub-phases

‏### Sub-phase 1.1: ‏יצירת types + מאגרי data (חדשים)

‏Testing: **`tdd`**

‏- ‏צור `src/lib/data/letters.ts`:
  ‏- ‏26 ערכי `Letter`, ‏אחד פר ‏`LetterCard` ‏קיים ב-`utils/letters.ts`.
  ‏- ‏`legacyCardId` ‏זהה ל-`LetterCard.id` ‏הישן.
  ‏- ‏מיפוי שדות: ‏`char` = ‏האות בלי ניקוד ובלי דגש (‏`'ב'`, `'כ'`, `'ש'`); ‏`displayChar` = ‏עם דגש/שיניים אם רלוונטי (`'בּ'`, `'שׁ'`); ‏`hasDagesh`, ‏`isFinalForm`, ‏`sinSide` ‏לפי `LetterCard`.
  ‏- ‏לדוגמה: ‏`{ id: 'b', char: 'ב', displayChar: 'בּ', name: 'בית דגושה', hasDagesh: true, isFinalForm: false, group: 'base', legacyCardId: 'ba' }`
‏- ‏צור `src/lib/data/vowels.ts`:
  ‏- ‏2 ערכים: ‏`patah` ‏ו-`none`.
  ‏- ‏`patah`: ‏`mark: 'ַ'`, ‏`speakSuffix: 'ָא'` ‏(זהה ל-`speak` הישן: ‏`'בָּא'`).
  ‏- ‏`none`: ‏`mark: ''`, ‏`speakSuffix: 'ְ'` ‏(שווא נח: `'בְּ'`).
  ‏- ‏`displayName` ‏יקרא מ-`language.ts` ‏(אם הוא לא קיים שם — ‏הוסף).
‏- ‏Tests (Vitest):
  ‏- ‏`letters.test.ts`: ‏26 ‏ערכים, ‏כל ‏`legacyCardId` ‏ייחודי, ‏כל ‏`legacyCardId` ‏קיים ב-`utils/letters.ts` הישן.
  ‏- ‏`vowels.test.ts`: ‏2 ערכים, ‏codes ייחודיים.

‏### Sub-phase 1.2: ‏`makePair`, `generateDeck`, `isValidCombination`

‏Testing: **`tdd`**

‏- ‏צור `src/lib/utils/pair.ts`:
  ‏- ‏`makePair(letter, vowel): LetterVowelPair`
    ‏- ‏`id`: ‏אם ‏`vowel.code === 'patah'` ‏→ ‏`letter.legacyCardId` ‏(לתאימות). ‏אחרת: ‏`${letter.id}__${vowel.code}`.
    ‏- ‏`display`: ‏`letter.displayChar + vowel.mark`.
    ‏- ‏`speak`: ‏`letter.char + vowel.speakSuffix` (‏לפתח: ‏`'ב'+'ָא' = 'בָא'` ‏— **חריג**: ‏פתח בנוי כך שייתאים ל-`speak` הישן `'בָּא'` שכולל גם דגש. ‏ה-`speakSuffix` של פתח אינו `'ָא'` ‏אלא נדרש combining וניהול דגש).
    ‏- ‏**שימו לב**: ‏`speak` הישן כולל את ה-displayChar (`'בָּא'` ‏מכיל ‏`'בּ'` ‏עם דגש). ‏הפתרון: ‏`speak = letter.displayChar + vowel.mark + vowel.tail` ‏היכן ‏`tail` הוא ‏`'א'` ‏לפתח, ‏`''` ‏לnone. ‏או — ‏לקבל את ה-speak הישן בדיוק מ-`TTS_FILES`/`LetterCard` ‏הישן בעבור patah. ‏**Executor: ‏בחר את הגישה שמייצרת `speak` זהה למיליארד אחוז ל-`LetterCard.speak` הישן עבור pair `<letter, patah>`. ‏בדוק עם test רגרסיה.**
    ‏- ‏`group`: ‏`letter.group`.
  ‏- ‏`generateDeck(selectedLetterIds: string[], selectedVowels: VowelCode[]): LetterVowelPair[]`
    ‏- ‏שלוף את ה-`Letter`s ‏לפי ‏`legacyCardId === selectedLetterId`.
    ‏- ‏שלוף את ה-`Vowel`s ‏לפי ‏code.
    ‏- ‏מכפלה קרטזית, ‏סנן ע"י ‏`isValidCombination`.
    ‏- ‏החזר `LetterVowelPair[]`.
  ‏- ‏`isValidCombination(letter, vowel): boolean`
    ‏- ‏בפאזה 1 ‏תמיד מחזיר `true` (אין סופיות עדיין).
    ‏- ‏המבנה מוכן: ‏`if (letter.isFinalForm && (vowel.code === 'shva' || vowel.code === 'none')) return false;` ‏— ‏יישאר כcomment או מומש כי הוא מוכן לעתיד.
‏- ‏Tests:
  ‏- ‏`pair.test.ts`:
    ‏- ‏`makePair(b_letter, patah_vowel).id === 'ba'` (= ‏ה-LetterCard.id הישן).
    ‏- ‏`makePair(b_letter, patah_vowel).speak === 'בָּא'` (זהה ל-`LetterCard` הישן).
    ‏- ‏`makePair(b_letter, patah_vowel).display === 'בַּ'` (זהה ל-`LetterCard` הישן).
    ‏- ‏`makePair(b_letter, none_vowel).id === 'b__none'`.
    ‏- ‏`makePair(b_letter, none_vowel).speak === 'בְּ'`.
    ‏- ‏**regression test critical**: ‏לכל אחת מ-26 האותיות, ‏`makePair(letter, patah).{id, display, speak} === ALL_LETTERS[i].{id, display, speak}` ‏(הישן). ‏אם זה לא מתקיים — ‏גם ה-TTS files mapping ‏יישבר.
    ‏- ‏`generateDeck(DEFAULT_LETTER_IDS, ['patah']).length === 26`.
    ‏- ‏`generateDeck(['ba', 'ga'], ['patah', 'none']).length === 4` (cartesian).

‏### Sub-phase 1.3: ‏עדכון settings + migration

‏Testing: **`tdd`**

‏- ‏עדכן `src/lib/stores/settings.svelte.ts`:
  ‏- ‏הוסף ל-`makeDefaults()`: ‏`selectedVowels: ['patah'] as VowelCode[]`.
  ‏- ‏`DATA_KEYS` ‏ייכלל אוטומטית (`Object.keys(makeDefaults())`).
  ‏- ‏`FindLetterSettings` type ‏ייגזר אוטומטית — ‏בלי לגעת.
‏- ‏עדכן `src/lib/stores/settings-migration.ts`:
  ‏- ‏הוסף הענפה ל-`schemaVersion === 4`: ‏מעבירה את הנתונים כמו שהם.
  ‏- ‏עדכן את ענף `schemaVersion === 3`: ‏מוסיף `selectedVowels: ['patah']`, ‏מעדכן `schemaVersion: 4`.
  ‏- ‏עדכן את ענף `schemaVersion === 2`: ‏מוסיף `selectedVowels: ['patah']`, ‏`schemaVersion: 4`.
  ‏- ‏**שים לב**: ‏`schemaVersion` ‏לא קיים כרגע ב-`makeDefaults`. ‏צריך להוסיף אותו (`schemaVersion: 4`).
‏- ‏Tests:
  ‏- ‏`settings-migration.test.ts` ‏(הקיים) ‏— ‏הוסף tests ל-migration v3→v4: ‏default ‏הוא ‏`['patah']`.
  ‏- ‏Edge case: ‏legacy ‏v2 ‏עם ‏`activeGroups: ['base']` — ‏יוצא עם ‏`selectedVowels: ['patah']` ‏ו-`schemaVersion: 4`.

‏### Sub-phase 1.4: ‏עדכון `pickBoard` ‏ו-`utils/letters.ts`

‏Testing: **`integration`**

‏- ‏עדכן `src/lib/utils/letters.ts`:
  ‏- ‏ה-interface `LetterCard` ‏יישאר ‏(deprecated, JSDoc tag) ‏לתאימות עם ‏`game-state.svelte.ts` ‏ו-`Board.svelte` ‏לתקופת ביניים. **לא למחוק.**
  ‏- ‏`type LetterCard = LetterVowelPair` ‏— ‏הופך לalias.
  ‏- ‏`pickBoard()`: ‏הסר את ה-option ‏`selectedLetterIds`, ‏הסר את ה-option ‏`groups` (deprecated). ‏הוסף option יחיד: ‏`pairs: LetterVowelPair[]`.
    ‏```ts
    export type PickBoardOptions = {
      count: number;
      avoidSimilar: boolean;
      pairs: LetterVowelPair[];
    };
    ```
  ‏- ‏`pickBoard()` ‏ישתמש ב-`pairs` ‏ישירות (`shuffle` + similarity).
  ‏- ‏`areSimilar(idA, idB)`: ‏נשאר בלי שינוי. ‏הוא מקבל ids שמתאימים ל-`legacyCardId` ‏(= `pair.id` ‏עבור patah). ‏עבור pair `<letter, none>` ‏ה-id ‏הוא `'b__none'`, ‏ולכן `areSimilar('b__none', 'b__none') === true` ‏רק דרך הענף ‏`idA === idB`. ‏זה מקובל בפאזה זו.
  ‏- ‏הסר את ‏`getLettersByIds`, `getLettersForGroups`. ‏(הם בשימוש רק ב-`pickBoard` ‏הישן ‏— ‏אם משהו אחר מייבא, ‏עדכן.) ‏עשה ‏`grep -rn "getLettersByIds\|getLettersForGroups"` ‏ב-`src/` ‏לפני המחיקה.
‏- ‏עדכן `src/lib/stores/game-state.svelte.ts`:
  ‏- ‏`startBoard()`: ‏ייצר ‏`const deck = generateDeck(settings.selectedLetterIds, settings.selectedVowels)`, ‏ואז ‏`this.board = pickBoard({ count: settings.totalCellsInGrid, pairs: deck, avoidSimilar: settings.avoidSimilar })`.
  ‏- ‏שדות ‏`board: LetterCard[]` ‏ו-`target: LetterCard | null` ‏נשארים בשמם, ‏אבל ‏`LetterCard` ‏עכשיו ‏alias ל-`LetterVowelPair`. ‏שום שינוי בהתנהגות.
‏- ‏Tests:
  ‏- ‏`pickBoard.test.ts` ‏(אם קיים — ‏או חדש): ‏עם `pairs: generateDeck(DEFAULT_LETTER_IDS, ['patah'])`, ‏מחזיר ‏count כרטיסים, ‏עם ‏`avoidSimilar: true` ‏אין שני ‏ids ‏שדומים.
  ‏- ‏Integration: ‏`startBoard()` ‏מייצר board של ‏`pair` ‏עם ‏`pair.display` ‏ו-`pair.speak` ‏זהים ל-`LetterCard` הישן.

‏### Sub-phase 1.5: ‏Board UI components

‏Testing: **`manual`**

‏- ‏עדכן `src/routes/_components/Board.svelte`:
  ‏- ‏שינוי import: ‏`import type { LetterCard as LetterCardType } from '$lib/utils/letters'` ‏נשאר (alias).
  ‏- ‏לא נדרש שינוי בהתנהגות.
‏- ‏עדכן `src/routes/_components/LetterCard.svelte`:
  ‏- ‏אותו דבר. `card.display` ‏ו-`card.speak` ‏עדיין קיימים.
‏- ‏**שום שינוי visual.** ‏זה רק בדיקה שה-types עברו נכון.

## ‏Data Flow Bridges

| Producer | Consumer | Data | Mechanism | קובץ:שורה |
|----------|----------|------|-----------|-----------|
| ‏Settings store | game-state.startBoard | `selectedLetterIds`, `selectedVowels` | ‏קריאה ישירה ‏`settings.selectedLetterIds`/`selectedVowels` | game-state.svelte.ts:93-95 |
| ‏`generateDeck()` | ‏`pickBoard()` | `LetterVowelPair[]` | ‏העברה כ-arg ‏`{ pairs }` | game-state.svelte.ts:93-98 |
| ‏`pickBoard()` | ‏Board.svelte | `LetterVowelPair[]` (assigned ל-`gameState.board`) | ‏reactive ‏`$state` | game-state.svelte.ts:55 → Board.svelte:8 |
| ‏Migration v3→v4 | ‏localStorage | ‏`selectedVowels`, `schemaVersion: 4` | ‏ב-`migrateSettings()`, ‏בריצת layout | settings-migration.ts |
| ‏gameState.target | TTS | ‏`pair.speak` | ‏`speak(this.target.speak)` | game-state.svelte.ts:148 |

‏לכל שורה — ‏integration test ‏שמפעיל את שני הצדדים יחדיו.

## ‏DELETE blocks

‏בפאזה זו **אין מחיקות גדולות**. ‏הכל תוספות + ‏refactor incremental. ‏מה שכן:

‏1. ‏ב-`src/lib/utils/letters.ts`:
   ‏- ‏מחק את ה-functions `getLettersByIds`, `getLettersForGroups` ‏(שורות ~141-174, ‏רוב התוכן של החצי השני של הקובץ). **לפני המחיקה — ‏`grep -rn "getLettersByIds\\|getLettersForGroups"` ‏ב-`apps/find-letter-game/src/`.** ‏אם יש imports — ‏עדכן את ה-call sites קודם.
   ‏- ‏מחק את ‏`ALL_LETTERS_ALPHABETICAL` ‏ו-`DEFAULT_LETTER_IDS` — **לא**, ‏השאר. ‏הם בשימוש ב-`settings.svelte.ts` ‏וב-UI של ההגדרות.
   ‏- ‏מחק את ‏`type PickBoardOptions` ‏הקיים (שורות 266-285) ‏והחלף לחדש (פשוט יותר).

## ‏Anti-patterns ‏(מ-`sonnet-pitfalls.md` ‏+ ‏ספציפיים)

‏מתוך `sonnet-pitfalls.md`:

‏- ‏**1.1** — ‏`$state.snapshot` ‏ב-settings.svelte.ts ‏נשבר. ‏אל תיגע ב-`dataSnapshot()`.
‏- ‏**2.1** — ‏מחיקה חלקית של `utils/letters.ts`. ‏אל תמחק `pickBoard`, ‏אל תמחק ‏`ALL_LETTERS` או ‏`PHONETIC_SIMILARITY_PAIRS`. ‏מה שכן נמחק — ‏ראה DELETE blocks.
‏- ‏**4.1** — ‏Settings → game-state ‏לא לשכוח רענון deck. ‏בפאזה זו `startBoard()` כבר נקרא בכל פעם ש-board חדש נדרש, ‏אז זה נכון.
‏- ‏**4.2** — ‏Migration. ‏חובה integration test ‏עם localStorage payload v3 ‏אמיתי.

‏ספציפי לפאזה זו:

‏- ‏**`pair.id` ‏עבור pair `<letter, patah>` ‏חייב להיות ‏שווה ל-`legacyCardId`**. ‏אם לא — ‏`PHONETIC_SIMILARITY_PAIRS` ‏יישבר וגם `selectedLetterIds` הקיים יישבר.
‏- ‏**`pair.speak` ‏עבור ‏pair `<letter, patah>` ‏חייב להיות ‏שווה בדיוק ל-`LetterCard.speak` ‏הישן**. ‏אחרת ‏`TTS_FILES` ‏לא ימצא קובץ MP3 ‏וה-TTS ישתבר fallback ל-Web Speech.
‏- ‏**אסור להוסיף ערכים ל-`Vowel[]` ‏מעבר ל-`patah` ‏ו-`none` בפאזה זו.** ‏שאר 10 הניקודים — ‏פאזה 3.
‏- ‏**אל תיצור UI לבחירת ניקוד בפאזה זו.** ‏זה פאזה 2. ‏גם אם מפתה — ‏STOP.

## ‏DoD

‏- [ ] ‏`bun run check` ‏ירוק (TypeScript + lint)
‏- [ ] ‏`bun test` ‏ירוק (כל ה-tests החדשים + הקיימים)
‏- [ ] ‏`makePair(letter, patah).speak` ‏זהה ל-`LetterCard.speak` ‏הישן ‏עבור כל 26 האותיות (regression test)
‏- [ ] ‏Integration test: ‏localStorage v3 → ‏migration → ‏settings תקין עם ‏`selectedVowels: ['patah']` ‏ו-`schemaVersion: 4`
‏- [ ] ‏**Screenshot של הלוח לפני ואחרי הריפקטור** ‏— ‏זהות visuelle ‏מוחלטת. ‏Mobile (390×844) ‏ו-desktop (1280×800). ‏שמור ב-`/tmp/find-letter-phase-1/`.
‏- [ ] ‏**E2E manual flow** ‏בדפדפן:
  ‏1. ‏טען את ‏`/` ‏עם localStorage v3 ‏ישן.
  ‏2. ‏וודא שמופיע הלוח עם 12 אותיות (3x4).
  ‏3. ‏וודא שהמטרה הראשונה מוקראת (TTS).
  ‏4. ‏לחץ על המטרה הנכונה — ‏צליל הצלחה, ‏מטרה חדשה.
  ‏5. ‏לחץ על אות שגויה — ‏צליל error, ‏shake, ‏cooldown.
  ‏6. ‏פתח DevTools → ‏localStorage. ‏וודא ‏`schemaVersion: 4` ‏ו-`selectedVowels: ['patah']`.
  ‏7. ‏טען את ‏`/settings`. ‏וודא ש**לא הופיע** ‏fieldset של ניקוד (לא בפאזה זו).
‏- [ ] ‏תיעוד ‏ב-`docs/walkthrough.md` ‏של פאזה 1, ‏עם רשימת ה-files שהשתנו.

## ‏Environment notes

‏- ‏Dev server: ‏`bun run --filter find-letter-game dev` (port 5179)
‏- ‏Browser: ‏linux-gui ‏עם pw-clean.sh ‏(ראה ‏`linux-gui-browser` skill)
‏- ‏Preview server (build): ‏port 5180
‏- ‏Pico tunnel ‏אם נדרש מבחוץ: ‏ראה `walkthrough.md` ‏סעיף Tunnels
‏- ‏Working directory: ‏`/home/user/projects/learn-games-project/apps/find-letter-game`

## ‏Complexity Score Breakdown

```
Integration / Data flow:
[ ] ‏Cross-store data flow חדש                       0  (refactor של flow קיים, ‏לא חדש)
[ ] ‏Streaming / real-time                            0
[ ] ‏Protocol contract חדש                            0

Code surface:
[X] ‏Refactor של קוד קיים                            +1
[ ] >5 files touched ב->2 packages                  0  (כל ה-files באותו package)
[ ] ‏State machine / async coordination               0

External dependencies:
[ ] ‏ספרייה חיצונית חדשה                              0
[ ] ‏DOM mutation / monkey-patching                  0

Risk indicators:
[ ] 3 הslices האחרונים באזור הזה החזירו bugs        0  (אין case studies קודמים)
[X] ‏Test coverage <70% ‏על הקוד שמשתנה               +1  (יש tests אבל לא מקיפים)
[X] ‏Deploy לפרודקשן מיד אחרי הסליס                  +2  (Cloudflare Pages)

Mitigators:
[X] ‏Pure logic, ‏אין IO                              -2  (data + functions, ללא IO ב-core)
[X] ‏TDD מלא, tests מקיפים על behavior חדש           -1
[ ] ‏Greenfield, ‏אין call sites קיימים               0  (יש call sites)

Total: 1 + 1 + 2 - 2 - 1 = 1
Tier: light only, no verifier-phase
```

## ‏Verifier-slice-light ‏תזכורת

‏בסיום הביצוע (לפני commit):

```
Task(subagent_type="verifier-slice-light", prompt="""
brief: apps/find-letter-game/docs/plans/briefs/phase-1-letter-vowel-refactor-brief.md
slice: phase-1-letter-vowel-refactor
base commit: <hash לפני הביצוע>
environment: dev server על port 5179, browser דרך linux-gui+pw-clean.sh
""")
```

‏הדוח יישמר ב-`apps/find-letter-game/docs/plans/verification/phase-1-letter-vowel-refactor-report.md`.

---

*‏Brief נכתב ע"י Opus, 2026-05-17. ‏גרסה 1.*
