# הוראות לשימוש בסוכני קוד (Copilot / AI) — Monorepo "learn-games-project"

**מטרת הקובץ:** להעניק הנחיות תמציתיות, מדויקות ושמישות לסוכני AI שמבצעים שינויים בקוד, בדיקות ובתיעוד במערכת הזו.

## 📐 תמונת מצב כללית
- זה מונו-ריפו: **`apps/`** (יישומים) ו-**`packages/`** (ספריות משותפות). ראו גם `docs/component_structure.md` ו-`docs/walkthrough.md` להחלטות ארכיטקטורה. ✅
- UI מבוסס **Svelte 5 + Vite**, עם רכיבים משותפים ב-`packages/learn-booster-kit`.
- קומפוננטות מקומיות ממוקמות לצד ה-Route ב-`_components` (Co-location).

## ⚙️ הגדרות סביבה ופקודות שימושיות
- עדיף לעבוד מהשורש עם Bun: 
  - התקנה: `bun install`
  - פיתוח לכל המונוריפו: `bun run --filter '*' dev`
  - בנייה לכל הפרוייקט: `bun run --filter '*' build`
  - בדיקות/סינק: `bun run --filter '*' check`
  - לינט: `bun run --filter '*' lint`
- ניתן להריץ פקודות ספציפיות לפרויקט: `cd apps/wordys-game && npm run dev` (או `npm run build`, `npm test`).
- Playwright: e2e נמצאות בדרך-כלל בתיקיית `e2e/` של ה-app; להרצתן: `npm run test:e2e` בתוך ה-app. אם דרושות דפדפנים: `npx playwright install`.

## ✅ בדיקות ולינט
- Unit: Vitest (`npm run test:unit`), E2E: Playwright (`playwright test`).
- לפני כל קומיט בקש להריץ: `bun run --filter '*' check` או `npm run check` בפרויקט הרלוונטי.

## ✍️ קונבנציות קוד ותקשורת
- **שפה:** תקשורת מול המשתמש, הודעות קומיט, תיעוד ושדות משימה — **עברית בלבד** (עם כתיבה ימין-לשמאל). 🔁
- **קוד:** שמות משתנים/פונקציות וקבצים ב-**אנגלית** (Pascal/camel/kebab בהתאם להקשר). הערות בקוד ו-Docs — בעברית.
- UI טקסטים צריכים להיות RTL ותומכים בעברית.

## 🧩 דפוסי פרויקט חשובים (פרטיים למערכת זו)
- סאונד: קבצי אודיו אמיתיים ב-`static/sounds`; קבצים לא בשימוש — להעביר ל-`unused_sounds`.
- שיתוף רכיבים: חפש את `packages/learn-booster-kit` לרכיבים המשותפים (למשל `ProgressWidget`, `AdminGate`).
- Co-location: קומפוננטות ספציפיות ל-route ב`src/routes/.../_components`.

## 🛠️ עבודה עם Svelte
- Svelte 5 — השתמש ב-`svelte-check` ו-`svelte-kit sync` כשנדרש.
- **אצל סוכני AI:** השתמש ב-Svelte MCP (`svelte-autofixer`) לפני שליחת קוד Svelte — בצע עד שלא נשארים אזהרות/הצעות.

## 📋 נהלי Git וקומיטים (חמורים)
- **אל תבצע קומיטים או pushes ללא אישור מפורש מהמשתמש.**
- בחר לקבצים ספציפיים בלבד (`git add path/to/file`). אין להשתמש ב-`git add .` באופן גורף.
- הודעות קומיט יהיו בעברית ותמציתיות. אחרי שינוי משמעותי — עדכן `docs/walkthrough.md` בפרטי מה ששינית (ציין תאריך ושעה).

## 📚 איפה לחפש עוד חוקים ו-AGENTS
- קבצי חוקים קיימים לפרוייקט:
  - `apps/*/AGENTS.md` (חוקים ספציפיים לאפליקציות)
  - `apps/*/.github/copilot-instructions.md` (הוראות מקומיות)
  - `.agent/rules/project-rules.md` (כללי מרכזיים)
  - `docs/walkthrough.md`, `docs/component_structure.md`

## ❗ כללי התנהגות לסוכני AI
- הרץ בדיקות ובנה את הפרויקט לפני הצעת קומיט. אם הבילד נכשל — דווח והמתן להנחיות.
- בקש אישור לפני ביצוע פקודות שמשנות מצב (install, commit, push, migration).
- הימנע מהנחות לא מבוססות — השתמש בקבצים המדויקים שצוינו (למשל `playwright.config.ts`, `package.json` של ה-app).

---

אם תרצה, אעדכן את הגרסה הזו כדי לכלול דוגמאות קוד נוספות או פיצ'רים ספציפיים של אפליקציות מסוימות (למשל `wordys-game` או `learn-booster`). בבקשה עדכן מה חסר או מה לא ברור. ✅