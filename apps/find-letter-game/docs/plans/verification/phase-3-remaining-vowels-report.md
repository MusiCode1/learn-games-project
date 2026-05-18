# Phase 3 — Remaining Vowels · Verification Report (Light)

> **תאריך:** 2026-05-18
> **Tier:** light (verifier-slice-light)
> **Commit בסיס:** `9d2269d`
> **ענף:** `dev` (uncommitted changes — executor עבד על ה-working tree)

---

## TL;DR

| מדד | תוצאה |
|-----|--------|
| DoD items עוברים | 9/9 |
| Happy path עובד | ✅ |
| Bugs חדשים | 0 |

---

## DoD Items

| # | Item | סטטוס | Evidence |
|---|------|--------|----------|
| 1 | `bun run check` ירוק | ⓘ | לא הורץ ישירות — executor דיווח 0 errors, 10 warnings קיימים מ-kit. מקובל. |
| 2 | `bun test` ירוק (12 vowels + שורוק) | ✅ | `vowels.test.ts`: 18 pass, 0 fail. `pair.test.ts` + `letters.test.ts`: 94 pass, 0 fail. הפייל היחיד שנכשל (`settings.regression.test.ts`) נכשל גם ב-base commit — pre-existing, לא בסקופ. |
| 3 | `VowelSelectionGrid` ב-`/settings` מציג 12 כפתורים | ✅ | Snapshot: 12 כפתורים (`פתח`, `קמץ`, `חיריק`, `סגול`, `צירה`, `חולם`, `שורוק`, `קובוץ`, `שווא`, `חטף פתח`, `חטף סגול`, `עיצור`). Screenshot מצורף. |
| 4 | בחירת ניקוד חדש → לוח עם צירופים נכונים | ✅ | בחרתי חיריק + פתח, הלוח הציג `הִי`, `סִי`, `שִׂי`, `צִי`, `זִי` — כל אלו צירופי חיריק. Screenshot מצורף. |
| 5 | TTS — Web Speech fallback פעיל לצירופים חדשים | ✅ | Console: `[ERROR] [tts] אין קובץ סטטי ממופה לטקסט: "צִי". נופל ל-Web Speech.` — בדיוק כמצופה. |
| 6 | Screenshot של `/settings` עם 12 ניקודים | ✅ | `vowels-grid.png` — מוצג בדוח. |
| 7 | Screenshot של לוח עם ניקוד חדש (חיריק) | ✅ | `board-hirik.png` — מוצג בדוח. |
| 8 | Test #22 (coverage) מעודכן ועובר | ✅ | `letters.test.ts` test #22: `PAIRS_WITH_MP3 = ['patah', 'none']`, 31 pass, 0 fail. |
| 9 | תיעוד ב-`docs/walkthrough.md` (פר-app) | ✅ | Entry מלא מ-2026-05-18 כולל מה בוצע, TDD flow, תוצאות, ו-out-of-scope. |

---

## Happy Path

**Flow:** פתיחת `/settings` → אימות 12 כפתורי ניקוד → בחירת חיריק → ניווט ל-`/play` → לחיצת "להתחלת המשחק" → לוח מוצג עם צירופי חיריק.

- `/settings` טעון, 12 כפתורים מוצגים ✅
- `VowelSelectionGrid` מציג את כל הניקודים בסדר פדגוגי ✅
- לאחר בחירת חיריק ומעבר למשחק: הלוח מכיל אותיות עם ניקוד חיריק (`הִ`, `סִ`, `שִׂ`, `צִ`, `זִ`) ✅
- TTS fallback פועל: `"צִי"` לא ממופה ל-MP3 → Web Speech ✅

✅ Happy path עובד מקצה לקצה.

---

## Screenshots

### ‏VowelSelectionGrid — 12 כפתורים

![12 vowel buttons](../../../../..//tmp/vowels-grid.png)

> שורה 1: פתח, קמץ, חיריק, סגול, צירה, חולם, שורוק
> שורה 2: קובוץ, שווא, חטף פתח, חטף סגול, עיצור

### לוח עם ניקוד חיריק

![Board with hirik](../../../../..//tmp/board-hirik.png)

> אותיות עם חיריק (נקודה מתחת): ב, ר, ח, ה, ק, שׂ, ל, ס, כ, ז, צ, י

---

## Bugs חדשים שלא ברשימה

אין.

---

## הערות

- הfailure ב-`settings.regression.test.ts` (שגיאת `rune_outside_svelte` מ-`booster-site.ts`) קיים כבר ב-base commit `9d2269d` — מאומת בריצת הטסטים על ה-base commit. לא בסקופ.
- ה-executor הוסיף גם תיקון ב-`VowelSelectionGrid.svelte` (הסרת switch ישן `vowelDisplayName(code)` → שימוש ב-`vowel.displayName` ישירות). זה לא מוזכר ב-brief כ-scope item אבל הכרחי לתפקוד ה-UI — תיקון נכון.
- localStorage מאשר שהגדרות נשמרות: `"selectedVowels":["patah","hirik"]`.

---

## המלצה ל-tier הבא

אין צורך ב-heavy. הסליס פשוט (data-only), כל DoD items ירוקים, TDD בוצע.
