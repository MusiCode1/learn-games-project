# יומן פיתוח - kit-test-screen

## 2026-05-17 00:25

### שיפור מסך game להתאמה למקור

#### מה בוצע?

**`showcase/game/+page.svelte`** — 4 שיפורים:

1. **color="secondary"** ל-SpeakerIcon IconButton — כתום ב-find-letter, צהוב ב-wordys, rose ב-portal
2. **subtitle בHeaderBar** — "הקשיבו וגעו באות הנכונה" (`.title-wrap` + `.subtitle`)
3. **ProgressWidget mock** — `<aside class="progress-mock">` עם track/fill ו-`progressPct = $derived((score%12)/12*100)`
4. **Grid עטוף ב-`Card variant="framed"`** — מסגרת כתומה ב-find-letter, ניטרלי בשאר

**`Card.svelte`** — תיקון: `ribbonStyle` הפך ל-`$derived` (מנע Svelte warning)

## 2026-05-17 00:12

### מסך משחק אינטראקטיבי לבחינת themes

#### מה בוצע?

**`src/routes/showcase/game/+page.svelte`** — פסאודו-משחק "מצא את האות"

- `GameShell` + `HeaderBar` מלא: SpeakerIcon+label, כפתור משחק חדש, SegmentedControl גודל לוח, ScoreBadge ×2, SettingsIcon
- גריד כרטיסים בCSSgrid: 2×3 / 3×3 / 3×4 לפי בחירה
- `lbk-anim-shake` על תשובה שגויה, `lbk-anim-pop` על תשובה נכונה
- `CooldownOverlay` 2.5s אחרי טעות
- `generateRound`: 1 target + distractors מ-LETTERS, Fisher-Yates shuffle
- `$effect` יחיד לinit + מעקב אחרי gridSize דרך `gridCount(gridSize)`
- nav link "Game" ב-layout

#### מעקפים ופתרונות

- **infinite loop בסיכון**: `$effect` מריץ `generateRound` שמשמש `targetLetter` → tracking. פתרון: מחיקת השורה `const available = LETTERS.filter(l => l !== targetLetter)` שלא הייתה נחוצה, ומחיקת `$effect` כפול

## 2026-05-17 00:11

### מסך ברוכים הבאים לבחינת themes

#### מה בוצע?

**`src/routes/showcase/welcome/+page.svelte`** — מסך פתיחה מלא

- `GameShell` + `StartScreen` מהקיט במסך מלא
- `heroIllustration` snippet: gradient box 200×200 עם אמוג'י 🎮
- `secondaryActions`: IconButton הגדרות + קישור חזרה
- primary action מנווט ל-`/showcase/game`

**`+layout.svelte`** — הוספת nav link "Welcome"

## 2026-05-17 00:10

### הרחבת theme switcher — 8 themes

#### מה בוצע?

- `+layout.svelte`: הרחבת Theme type + 5 options חדשות (Find Letter, Wordy's, Slate Dark, Read Faster, Portal)
- שחזור השינויים הידניים שנמחקו בטעות בקומיט e28d32c (theme switcher בשלמותו)

#### מעקפים ופתרונות

- הקובץ היה ב-working tree (uncommitted) עם השינויים הידניים — נשמרו ועודכנו במקום לדרוס

## 2026-05-17 00:08

### תיקון: layout.css — @import עם .css extension מפורש

#### מה בוצע?

- `layout.css`: שינוי `@import 'learn-booster-kit/styles'` → `@import 'learn-booster-kit/styles.css'`

#### מעקפים ופתרונות

- **Tailwind 4 loadStylesheet**: Tailwind לא מוסיף `.css` extension אוטומטית ב-@import paths — הוא פותח את הpath כמו שהוא. Vite alias מחזיר `src/styles` (ללא extension) וTailwind נכשל ב-ENOENT. הפיתרון: הוספת `.css` מפורש לimport.
- הבעיה הייתה pre-existing (קיימת לפני הפרויקט הזה) — ה-SSR dev server לא עבד כלל בלי התיקון הזה.

## 2026-05-17 00:07

### Showcase page — הצגת כל קומפוננטות ה-component system + theme switcher

#### מה בוצע?

**1. `src/routes/showcase/+page.svelte`** — דף showcase חדש

- מציג את כל הprimitives: Button, IconButton, SegmentedControl, ScoreBadge, Card
- מציג animation hooks: useShake, usePop
- מציג CooldownOverlay (3 שניות)
- מציג HeaderBar עם 3 אזורים
- מציג StartScreen בתוך preview box
- swatches לכל Color Tokens
- RTL מלא

**2. `src/routes/+layout.svelte`** — עדכון עם theme switcher

- navigation: Booster Test / Showcase
- `<select>` לבחירת theme: default/kids/minimal
- `$effect` מגדיר `document.documentElement.dataset.theme` ב-runtime
- CSS variables משתנים מיד עם החלפת theme

#### החלטות ארכיטקטורה

- **`data-theme` על `<html>`**: שינוי theme-attribute על document.documentElement מפעיל את כל ה-CSS overrides של [data-theme='kids'] וכו'

## 2026-02-21 00:00

### הסרת @source עם path יחסי ל-learn-booster-kit

#### מה בוצע?

**1. `src/routes/layout.css`**

- הוחלף `@source '../../../../packages/learn-booster-kit'` ב-`@import 'learn-booster-kit/styles'`.

**2. `vite.config.ts`**

- ה-alias של `learn-booster-kit` שונה מ-`src/index.ts` (קובץ ספציפי) ל-`src/` (ספרייה).
- כך `learn-booster-kit` → `src/index.ts` ו-`learn-booster-kit/styles` → `src/styles.css`.

#### החלטות ארכיטקטורה

- **שינוי alias לספרייה**: כשה-alias מצביע לספרייה (ולא לקובץ ספציפי), Vite מפנה sub-paths כמו `/styles` לקבצים בספרייה. זה מאפשר הרחבה עתידית (למשל `learn-booster-kit/types`) ללא שינוי בconfig.

---
