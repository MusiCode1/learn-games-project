# מוסכמות קוד — Learn Games Project

> מסמך זה מגדיר את **כללי הכתיבה** של קוד בפרויקט: שפה, naming, TypeScript, Svelte 5, מבנה, validation.
>
> לכללי תכנות פונקציונלי (FP, Result, pure functions) ראה [`functional-programming.md`](./functional-programming.md).
> לכללי עיצוב משחק (booster, AdminGate, cooldown) ראה [`game-design-rules.md`](./game-design-rules.md).

---

## 1. שפה ותקשורת

### 1.1 שפת תוכן

| מקום | שפה |
|------|-----|
| ממשק משתמש (UI strings) | עברית |
| Walkthrough / docs / TASK descriptions | עברית |
| הודעות קומיט | עברית |
| הערות בקוד (JSDoc / inline) | עברית |
| שמות משתנים / פונקציות / קבצים | אנגלית (PascalCase / camelCase / kebab-case) |
| Branch names | אנגלית |

### 1.2 כלל מחרוזות עברית קשיחות — **אסור**

```ts
// ❌ אסור — מחרוזת קשיחה בקובץ קוד
<h1>ברוכים הבאים</h1>
throw new Error("שגיאה בטעינה");

// ✅ נכון — דרך קובץ language.ts
import { language } from '$lib/services/language';
<h1>{language.welcome}</h1>
```

הסיבה: single-source-of-truth לטקסטים, אפשרות עתידית ל-i18n, מניעת טקסטים יתומים.

### 1.3 RTL

הממשק חייב לתמוך **כיווניות מימין לשמאל מלאה** ב-CSS וב-DOM:
- `dir="rtl"` ברמת ה-`<html>` או ב-layout
- שימוש ב-CSS logical properties (`inset-inline-start` במקום `left`)
- ב-Tailwind: `ps-*` / `pe-*` / `ms-*` / `me-*` במקום `pl-*` / `pr-*` / `ml-*` / `mr-*`

---

## 2. Stack

| תחום | בחירה |
|------|--------|
| Frontend framework | **SvelteKit 5** (runes) |
| Styling | **Tailwind 4** |
| Build/Dev | **Vite** (מובנה ב-SvelteKit) |
| Package manager | **Bun** (workspaces) |
| Runtime types validation | **ArkType** (לא Zod!) |
| Deployment | **Cloudflare Pages** (per-app) |
| Tests | **Vitest** + browser mode + Playwright (E2E) |

---

## 3. TypeScript

### 3.1 חובה

- TypeScript חובה לכל קובץ לוגיקה. JavaScript רק לקבצי קונפיג בודדים.
- `strict: true` (כבר ב-`.svelte-kit/tsconfig.json`).
- אסור `any` למעט במקרים נדירים עם הערה מסבירה.

### 3.2 `interface` vs `type`

- **`interface`** ברירת מחדל לאובייקטים
- **`type`** כש:
  - יש union (`type Status = 'idle' | 'playing'`)
  - יש intersection או generic-mapping
  - הטיפוס נוצר מתוך `typeof X.infer` (ArkType / Zod)

### 3.3 Runtime validation עם ArkType

- כל **קלט חיצוני** (localStorage, JSON, URL params, BroadcastChannel, API response) חייב לעבור validation.
- הסכמה היא **מקור האמת לטיפוס** (`typeof Schema.infer`), לא להפך.
- שום `as Foo` ללא validation מוקדם.

```ts
import { type } from 'arktype';

const SettingsSchema = type({
  cooldownMs: 'number',
  voiceEnabled: 'boolean',
  "gridSize?": "'2x3' | '3x3' | '3x4' | '4x4'",
});

export type Settings = typeof SettingsSchema.infer;

const result = SettingsSchema(rawJson);
if (result instanceof type.errors) {
  // טיפול בשגיאה
}
```

---

## 4. Svelte 5

### 4.1 Runes (חובה)

- `$state` במקום `let`, ב-state ריאקטיבי
- `$derived` במקום computed properties שמורות
- `$effect` במקום `$:` (reactive declarations)
- `$props` במקום `export let`
- `$bindable` ל-props דו-כיווניים

### 4.2 Event handlers

```svelte
<!-- ✅ Svelte 5 -->
<button onclick={handleClick}>...</button>

<!-- ❌ Svelte 3/4 (אסור) -->
<button on:click={handleClick}>...</button>
```

### 4.3 Slots → Snippets

```svelte
<!-- ✅ Svelte 5 -->
{#snippet item(name)}
  <li>{name}</li>
{/snippet}

<Component {item} />
{@render item('foo')}

<!-- ❌ Svelte 3/4 (אסור) -->
<slot name="item" />
```

### 4.4 העדפות נוספות

- **`$derived` תמיד עדיף** על שמירת ערך מחושב ב-`$state`
- **Props > stores** למידע ספציפי-לרכיב. Stores מתאימים לקיט / מצב גלובלי בלבד.
- **`.svelte.ts`** סיומת חובה לכל קובץ שמשתמש ב-runes מחוץ לקומפוננטה

---

## 5. שמות קבצים ותיקיות

| סוג | מוסכמה | דוגמה |
|-----|---------|--------|
| קומפוננטת Svelte | **PascalCase** | `LetterCard.svelte` |
| מודול TypeScript | **kebab-case** | `game-logic.ts` |
| Runes מחוץ לקומפוננטה | סיומת **`.svelte.ts`** | `game-state.svelte.ts` |
| Test file | `*.spec.ts` או `*.test.ts` | `settings.test.ts` |
| Route folder (SvelteKit) | kebab-case | `find-letter/play/` |

---

## 6. מבנה תיקיות בתוך app

לפי [`component_structure.md`](./component_structure.md) — **Nested Co-location**:

```
src/
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── _components/          # קומפוננטות ל-route הזה (privacy underscore)
│   │   ├── Board.svelte
│   │   └── HeaderBar.svelte
│   └── play/
│       ├── +page.svelte
│       └── _components/
│           └── GameOverlay.svelte
└── lib/
    ├── components/           # קומפוננטות ל-multi-route
    ├── stores/               # *.svelte.ts ל-state גלובלי באפליקציה
    │   ├── settings.svelte.ts
    │   └── game-state.svelte.ts
    ├── services/             # שירותים: language, audio, tts
    ├── utils/                # פונקציות עזר טהורות
    └── types/                # interface declarations
```

### 6.1 הכלל הבסיסי

> קומפוננטה יושבת **באותה תיקייה של ה-Route שמשתמש בה**, עד שהיא משמשת ביותר מ-route אחד — ואז עוברת ל-`src/lib/components/`.

---

## 7. סגנון קוד

- **Prettier** לפורמט. הקונפיג ב-`.prettierrc` של כל app.
- **ESLint** עם הקונפיג הסטנדרטי של SvelteKit.
- שמות **תיאוריים**: `handleCardClick` ולא `hcc`.
- **JSDoc** לפונקציות-API ציבוריות בעברית.
- קומפוננטה ארוכה (>200 שורות) → פיצול ל-`_components/`.
- לוגיקה ארוכה ב-`.svelte` → חילוץ לקובץ `.svelte.ts` או `.ts` נפרד.

---

## 8. תיעוד פר-app

> **בתהליך:** המבנה למטה הוא **היעד**. כיום (2026-05-16) חלק מה-apps עוד לא מכילים את כל הקבצים. כשנוגעים ב-app — להשלים את החסר, לא לחכות לסיבוב מסודר.

כל app **צריך לכלול** (יעד):

| קובץ | תפקיד | סטטוס בפועל |
|------|--------|--------------|
| `AGENTS.md` | הפניה לתיעוד הראשי + הנחיות ספציפיות ל-app | ~5/12 apps |
| `docs/walkthrough.md` | יומן פיתוח עם רשומות chronological-reverse | ~9/12 apps |
| `README.md` | תיאור קצר + Live URLs | משתנה |

**`AGENTS.md` של app בודד** הוא דק — לרוב מפנה ל-`../../AGENTS.md` (root) ומוסיף הנחיות ספציפיות (Svelte MCP, הוראות ל-`live URL`, וכו').

---

## 9. תהליך עבודה

ראה גם:
- סקיל **`commit`** — תהליך קומיט מסודר
- סקיל **`update-walkthrough`** — עדכון יומן הפיתוח
- סקיל **`dev-conventions`** — מוסכמות אישיות (משלים את המסמך הזה)

### 9.1 לפני קומיט — חובה

1. `bun run check` (או `bun run --filter <app> check` ל-app יחיד)
2. עדכון `walkthrough.md` (פר-app אם השינוי פר-app, root אם חוצה)
3. `git status` + `git diff` לבדיקה
4. `git add` **סלקטיבי** — אסור `git add .`
5. אישור מהמשתמש (ראה §9.2 לאופנים)

### 9.2 אישור לקומיטים

לסוכן יש **שלושה מודלים** לבקש אישור — תלוי בהקשר הסשן:

#### מודל א — Per-commit (ברירת מחדל)
לפני **כל** `git commit`, הסוכן מציג:
- רשימת הקבצים שיועלו ל-staging
- הודעת הקומיט המלאה
- ומחכה ל"כן" / "מאשר" / "ok" מהמשתמש.

#### מודל ב — Batch approval (מומלץ למספר קומיטים רצופים)
אם הסוכן יודע מראש שיש **כמה קומיטים** (למשל ניקוי working tree עם 5 קבוצות):
- מציג **את כולם יחד** עם הפרטים המלאים של כל אחד
- מקבל אישור גלובלי אחד
- מבצע את כולם ברצף בלי לעצור

זה חוסך זמן בלי לוותר על שליטה — המשתמש עדיין רואה את כל מה שיתקמט לפני שזה קורה.

#### מודל ג — Session-level autonomous (לסשנים ללא השגחה)
אם המשתמש מצהיר במפורש שהסשן יפעל בלי השגחה (למשל ריצה לילית של שעות):
- הסוכן מבקש פעם אחת **בתחילת הסשן** רשות לבצע קומיטים ללא אישור פר-קומיט
- מקבל **רשות גלובלית** לסשן הזה בלבד
- ממשיך לעקוב אחרי כל יתר הכללים (סלקטיביות, walkthrough, הודעה בעברית, check)
- **אסור** להניח רשות זו ללא הצהרה מפורשת מהמשתמש

### 9.3 פקודות Git — **כל פקודה בנפרד**

```bash
# ❌ שרשור — חוסם בדיקת פלט בין פקודות
git add . && git commit -m "..."
git status && git diff

# ✅ נפרד
git add docs/walkthrough.md
git diff --staged
git commit -m "..."
```

הסיבה: כל פקודה דורשת בדיקת פלט לפני המשך. שרשור עוקף את הבדיקה הזו ומחמיץ שגיאות.

### 9.4 הודעות קומיט — פורמט

```
(scope): כותרת תמציתית בעברית

- פירוט שינוי 1
- פירוט שינוי 2
- ...
```

ה-`scope` בסוגריים — שם ה-app או ה-package (כמו `(find-letter-game)`, `(learn-booster-kit)`, `(docs)`, `(config)`).

### 9.5 קומיטים — אטומיות

- **קומיט אחד = נושא אחד.** אם השינוי נוגע ב-3 apps שונים שלא קשורים — 3 קומיטים.
- שינוי תוכן + שינוי הגדרות = 2 קומיטים נפרדים.

---

## 10. בדיקות

- כל פונקציה טהורה לוגית — חייבת spec ב-Vitest
- **שמות הטסטים בעברית מומלצים** (תואם לרוח התיעוד בפרויקט): `it('מאפס מונה אחרי חזרה למסך הראשי', ...)`. אנגלית מקובלת כשהאופי הטכני מצדיק (`it('applyProfile beginner sets correct values', ...)`).
- **עקביות בתוך קובץ** — לא לערבב עברית ואנגלית באותו `describe` block.
- E2E עם Playwright לזרימות-משתמש קריטיות (`apps/*/e2e/`)
- Coverage לא חובה אבל מועדף ב-lib פנימי

---

## 11. סאונד ואודיו

- **אסור Oscillators** או צלילים מסונתזים
- קבצי MP3/WAV בלבד (ב-`static/sounds/` או ב-CDN של הפרויקט)
- ניהול מרכזי ב-`src/lib/utils/sound.ts` או ב-קיט המשותף (`learn-booster-kit`)

---

## הפניות

- [`functional-programming.md`](./functional-programming.md) — כללי FP + Result type
- [`game-design-rules.md`](./game-design-rules.md) — כללי game design
- [`component_structure.md`](./component_structure.md) — מבנה קומפוננטות (פירוט)
- [`platform-plan.md`](./platform-plan.md) — roadmap לפלטפורמיזציה
