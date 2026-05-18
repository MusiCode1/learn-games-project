---
phase: phase-3-remaining-vowels
verifier-slice: light
complexity-score: 0
---

# ‏Phase 3 — הוספת 10 הניקודים הנותרים (data only)

## ‏Context

‏תכנון אסטרטגי: [`../vowels-support-plan.md`](../vowels-support-plan.md) — ‏פאזה 3
‏אזהרות Sonnet: [`../sonnet-pitfalls.md`](../sonnet-pitfalls.md)
‏פאזות קודמות: ‏`00bf317` (phase-1), ‏`6b47bb6` (phase-2), ‏`9d2269d` (UI fix)

‏בפאזה 2 ‏התגלה שאיכות ה-TTS לעיצור לא משביעת רצון (`be` ‏במקום `b`). ‏ההחלטה: ‏לחלץ ייצור MP3 לכל הניקודים לעבודה נפרדת אחת מקיפה (~280 קבצים), ‏כך שכאן נוסיף **רק את ה-data** ‏ל-10 הניקודים הנותרים. ‏ה-UI הקיים (`VowelSelectionGrid`) יציג אוטומטית, ‏וצירופים יפלו ל-Web Speech עד שה-MP3 יהיו מוכנים.

## ‏Scope

### ‏מה כן

‏- ‏10 entries חדשים ב-`src/lib/data/vowels.ts`: ‏חיריק, סגול, חולם, שורוק, צירה, שווא, קמץ, קובוץ, חטף פתח, חטף סגול.
‏- ‏10 שמות בעברית ב-`src/lib/services/language.ts`.
‏- ‏Tests ב-`src/lib/data/vowels.test.ts` ‏(הרחבה).
‏- ‏Update ל-`tests/letters.test.ts` ‏(#22 coverage) ‏לסנן צירופים שאין להם MP3.

### ‏מה לא

‏- ‏אין ייצור MP3.
‏- ‏אין שינוי בקומפוננטות UI (יעדכנו אוטומטית).
‏- ‏אין שינוי ב-`makePair`, ‏`generateDeck`, ‏`isValidCombination`.
‏- ‏אין סופיות.
‏- ‏אין שינוי ב-similarity logic.

## ‏Sub-phases

### ‏Sub-phase 3.1: ‏הוספת ערכי `Vowel`

‏Testing: **`tdd`**

‏עדכן `src/lib/data/vowels.ts` ‏ל-12 entries. ‏הקיימים: ‏`patah`, `none`. ‏החדשים:

| ‏code | ‏mark (Unicode) | ‏speakSuffix | ‏הערה |
|------|----------------|--------------|------|
| ‏`kamatz` | `'ָ'` (U+05B8) | ‏`'ָא'` (קמץ + א) | ‏בעברית מודרנית זהה לפתח צלילית |
| ‏`segol` | `'ֶ'` (U+05B6) | ‏`'ֶא'` | |
| ‏`tzere` | `'ֵ'` (U+05B5) | ‏`'ֵא'` | |
| ‏`hirik` | `'ִ'` (U+05B4) | ‏`'ִי'` (חיריק + יוד) | ‏חיריק מסיים ב-יוד |
| ‏`kubutz` | `'ֻ'` (U+05BB) | ‏`'ֻ'` | ‏קצר; ‏בלי תוספת |
| ‏`shuruk` | `'וּ'` (U+05D5 + U+05BC) | ‏`'וּ'` | **‏שני chars** — ‏ראה §Special handling |
| ‏`holam` | `'ֹ'` (U+05B9) | ‏`'ֹא'` | |
| ‏`shva` | `'ְ'` (U+05B0) | ‏`'ְ'` | ‏זהה צלילית ל-`none` |
| ‏`hataf-patah` | `'ֲ'` (U+05B2) | ‏`'ֲא'` | |
| ‏`hataf-segol` | `'ֱ'` (U+05B1) | ‏`'ֱא'` | |

**‏הערה על `displayName`:** ‏השדה ב-`Vowel` ‏ימשיך לקרוא מ-`language.ts` ‏(לפי הקיים). ‏אם המבנה הקיים הוא ‏`displayName: language.vowelNamePatah`, ‏פשוט הוסף עוד 10 entries מתאימים.

**‏Test:** ‏`vowels.test.ts` ‏יוודא 12 entries, ‏codes ייחודיים, ‏mark לכל אחד.

### ‏Sub-phase 3.2: ‏שמות בעברית ב-`language.ts`

‏Testing: **`none`** ‏(typecheck יתפוס breakage)

‏הוסף ‏ל-`src/lib/services/language.ts`, ‏בסעיף "שמות הניקודים" ‏שיצרת ב-פאזה 2:

```ts
// שמות הניקודים
vowelNamePatah: 'פתח',
vowelNameNone: 'עיצור',
vowelNameKamatz: 'קמץ',
vowelNameSegol: 'סגול',
vowelNameTzere: 'צירה',
vowelNameHirik: 'חיריק',
vowelNameKubutz: 'קובוץ',
vowelNameShuruk: 'שורוק',
vowelNameHolam: 'חולם',
vowelNameShva: 'שווא',
vowelNameHatafPatah: 'חטף פתח',
vowelNameHatafSegol: 'חטף סגול',
```

**‏שים לב:** ‏הסדר הפדגוגי (קמץ → חיריק → סגול → צירה → חולם → שורוק → ‏שווא → קובוץ → חטפים → עיצור) ‏עדיף על הסדר הא"בי. ‏בwowels.ts ‏הסידור הסידורי קובע את ה-display order ב-VowelSelectionGrid.

‏סדר מומלץ ב-`vowels.ts` (לפי תדירות פדגוגית):
1. ‏patah
2. ‏kamatz
3. ‏hirik
4. ‏segol
5. ‏tzere
6. ‏holam
7. ‏shuruk
8. ‏kubutz
9. ‏shva
10. ‏hataf-patah
11. ‏hataf-segol
12. ‏none

### ‏Sub-phase 3.3: ‏Special handling — שורוק (`וּ`)

‏Testing: **`tdd`** ‏(בתוך `pair.test.ts`)

‏שורוק ייחודי כי הוא **2 chars**: ‏ו (U+05D5) + ‏דגש (U+05BC).

‏ב-`makePair`, ‏החישוב הקיים הוא:

```ts
display = letter.displayChar + vowel.mark
speak = (letter.speakChar ?? letter.char) + vowel.speakSuffix
```

‏עבור pair `<b, shuruk>`:
‏- ‏`display = 'בּ' + 'וּ' = 'בּוּ'` ✓
‏- ‏`speak = 'ב' + 'וּ' = 'בוּ'` ✓

‏עבור pair `<v, shuruk>`:
‏- ‏`display = 'ו' + 'וּ' = 'ווּ'` — ‏ויזואלית שתי ויו, ‏נראה מוזר.
‏- ‏`speak = 'ו' + 'וּ' = 'ווּ'` — ‏הקראה "vu", ‏לכאורה נכון.

**‏שאלה פדגוגית:** ‏האם להציע ‏ו+שורוק? ‏ויזואלית זה ‏'ווּ' ‏שלא נכון. ‏לפי kriale, ‏זה לא מסוננים. ‏אבל הם השאירו את ההחלטה למורה.

**‏החלטה לפאזה זו:** ‏לא לסנן. ‏המורה יחליט אם לבחור ‏ו+שורוק. ‏ב-`isValidCombination` ‏לא נוסיף כללים חדשים.

**‏Test:** ‏`pair.test.ts` ‏יוודא:
‏- ‏`makePair(b_letter, shuruk_vowel).display === 'בּוּ'`
‏- ‏`makePair(b_letter, shuruk_vowel).speak === 'בוּ'`
‏- ‏אורך ‏`shuruk.mark` ‏הוא 2 ‏(לא 1).

### ‏Sub-phase 3.4: ‏עדכון test coverage (#22)

‏Testing: **`integration`**

‏הtest #22 ב-`letters.test.ts` ‏מוודא שכל ה-`speak` ‏של pairs ‏המייצרים את ‏`selectedVowels` ‏ממופים ב-`TTS_FILES`. ‏בפאזה 2 עדכננו אותו לסנן גרוניות+עיצור. ‏עכשיו, ‏אחרי הוספת 10 ניקודים, ‏יהיו ~286 צירופים חדשים שאין להם MP3.

**‏שינוי לטסט:** ‏סנן כך שיבדוק רק את הצירופים שיש להם MP3 — ‏כלומר רק `patah` ‏ו-`none` ‏(חוץ מהגרוניות+עיצור). ‏עבור 10 הניקודים החדשים, ‏הצירופים אמורים ליפול ל-Web Speech ‏וזה תקין.

‏הפילטר:

```ts
// בfunction של הtest #22
const PAIRS_WITH_MP3: VowelCode[] = ['patah', 'none'];
const pairsToCheck = ALL_LETTERS.flatMap(letter =>
    PAIRS_WITH_MP3
        .map(vowelCode => makePair(letter, lookupVowel(vowelCode)))
        .filter(pair => {
            // ‏סנן גרוניות + עיצור (אין MP3, fallback ל-Web Speech)
            if ((letter.id === 'a' || letter.id === 'aa') && vowelCode === 'none') return false;
            return true;
        })
);
```

‏אם המשתנה ‏`PAIRS_WITH_MP3` ‏יורחב בעתיד (כשייצור ה-MP3 ייגמר), ‏הtest יעדכן אוטומטית.

## ‏Data Flow Bridges

‏אין שינויי data flow בפאזה זו. ‏כל המנגנון הקיים (`generateDeck`, `makePair`, ‏`pickBoard`, ‏TTS fallback) ‏מטפל אוטומטית.

## ‏DELETE blocks

‏אין מחיקות.

## ‏Anti-patterns

‏מתוך `sonnet-pitfalls.md`:

‏- ‏**1.1** — ‏`$state.snapshot` ‏ב-settings.svelte.ts ‏נשבר. ‏אל תיגע.
‏- ‏**3.5** — ‏TTS לעיצור גרוע — ‏ידוע, ‏לא לתקן בפאזה זו.

‏ספציפי לפאזה זו:

‏- ‏**אל תוסיף MP3 לאף ניקוד חדש.** ‏ייצור MP3 בעבודה נפרדת בעתיד.
‏- ‏**אל תיגע ב-`makePair` או `generateDeck`** — ‏הם מתעדכנים אוטומטית מ-`ALL_VOWELS`.
‏- ‏**אל תוסיף עוד כללים ל-`isValidCombination`** — ‏לא בפאזה זו. ‏(סופיות + שווא/none = פאזה 4.)
‏- ‏**Unicode שורוק**: ‏`'וּ'` ‏הוא ‏`'\u05D5\u05BC'` (2 chars). ‏וודא ש-`.length === 2`, ‏לא 1. ‏Sonnet עלול להניח combining mark יחיד.

## ‏DoD

‏- [ ] ‏`bun run check` ירוק
‏- [ ] ‏`bun test` ירוק (כולל tests חדשים ל-12 vowels + שורוק)
‏- [ ] ‏`VowelSelectionGrid` ‏ב-`/settings` מציג 12 ‏כפתורים (במקום 2)
‏- [ ] ‏בחירת ‏ניקוד חדש (לדוגמה חיריק) → ‏לוח עם `בִּי`, `גִי`, ‏וכו'
‏- [ ] ‏TTS — Web Speech fallback פעיל לצירופים חדשים (לא MP3 שגוי או שגיאה)
‏- [ ] ‏Screenshot של ‏`/settings` ‏עם 12 ניקודים
‏- [ ] ‏Screenshot של לוח עם ניקוד חדש (לדוגמה חיריק)
‏- [ ] ‏Test #22 (coverage) ‏מעודכן ועובר (סינון הצירופים בלי MP3)
‏- [ ] ‏תיעוד ב-`docs/walkthrough.md` (פר-app, לא root) — ‏entry של פאזה 3

## ‏Environment notes

‏- ‏Working directory: ‏`/home/user/projects/learn-games-project/apps/find-letter-game`
‏- ‏Preview server רץ: ‏proc `proc_2026-05-17T2247_7f9f27` (port 5180)
‏- ‏Tunnel: ‏`https://musicode-find-letter.nue.tuns.sh` → ‏5180
‏- ‏Test: ‏`bun test` ‏מ-find-letter-game
‏- ‏Build: ‏`bun run build` ‏(נדרש לפני שתחזיר preview לראות שינויים)

## ‏Complexity Score Breakdown

```
Integration / Data flow: 0
Code surface:
[ ] ‏Refactor: 0 (תוספות בלבד)
[ ] >5 files: 0 (3 קבצים)
[ ] ‏State machine: 0

External: 0

Risk:
[X] ‏Deploy לפרודקשן: +2

Mitigators:
[X] ‏Pure logic: -2
[X] ‏TDD: -1

Total: 2 - 2 - 1 = -1 → 0 (‏לא יכול להיות שלילי)
Tier: light only
```

## ‏Verifier-slice-light ‏תזכורת

```
Task(subagent_type="verifier-slice-light", prompt="""
brief: apps/find-letter-game/docs/plans/briefs/phase-3-remaining-vowels-brief.md
slice: phase-3-remaining-vowels
base commit: 9d2269d
environment: preview port 5180, browser linux-gui+pw-clean.sh
""")
```

‏ה-verifier יבדוק:

‏- ‏`/settings` ‏מציג 12 ניקודים
‏- ‏בחירת חיריק (או ניקוד אחר חדש) → ‏לוח עם הצירופים החדשים מוצג נכון (visual)
‏- ‏TTS לא קורס — ‏Web Speech fallback פעיל
‏- ‏Tests עוברים
‏- ‏Mobile + desktop screenshots

‏הדוח יישמר ב-`apps/find-letter-game/docs/plans/verification/phase-3-remaining-vowels-report.md`.

---

*‏Brief נכתב ע"י Opus, 2026-05-17. ‏גרסה 1.*
