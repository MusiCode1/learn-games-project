# יומן פיתוח (Walkthrough)

## 24/12/2025 - הוספת תצוגה מקדימה למחזק בהגדרות

נוספה אפשרות לראות את המחזק בפעולה ישירות מתוך מסך ההגדרות ב-`wordys-game`.

### 🚀 מה בוצע

1.  **ממשק ניהול (Admin UI)**:

    - נוסף כפתור "הצגת דוגמה" בתוך רכיב `SettingsControls.svelte` (בחלק של הגדרות המחזק).
    - השינוי מאפשר למתפעל לבדוק את הגדרות הבוסטר (וידאו/אפליקציה/אתר) ולוודא תקינות לפני שמתחילים לשחק עם הילד.

2.  **לוגיקה**:
    - שימוש בפונקציה `boosterService.triggerReward` להפעלת המחזק עם הקונפיגורציה הנוכחית של הטופס.

---

## 22/12/2025 - הגירה של משחק הלוטו ל-SvelteKit (Migration)

הושלמה ההגירה של `loto-game` (מ-React) ל-`loto-game-svelte` (ב-SvelteKit).

### 🚀 מה בוצע

1.  **יצירה והגדרת הפרויקט**:

    - הוגדר פרויקט SvelteKit חדש.
    - הותקנו תלויות: `learn-booster-kit`, `canvas-confetti`.
    - הוגדרו קבצי קונפיגורציה (`vite.config.ts`, `tsconfig.json`) לתמיכה ב-Workspaces.

2.  **העברת נכסים (Assets)**:

    - הועתקו קבצי סאונד מ-`train-addition-game` ונוצרו placeholder-ים לחסרים.
    - הועתקו תמונות נדרשות.

3.  **פיתוח רכיבים ולוגיקה**:

    - **Components**: פותחו מחדש ב-Svelte 5 (`Card`, `Board`, `SettingsModal`, `Confetti`).
    - **Logic**: נכתבה מחדש לוגיקת המשחק (`gameLogic.ts`) וניהול המצב (`+page.svelte`) באמצעות Runes (`$state`, `$effect`).
    - **Sound**: הוטמע מנגנון סאונד מבוסס HTML5 Audio ב-`sound.ts`.
    - **Booster**: אינטגרציה עם `learn-booster-kit` דרך `gingimBooster.ts`.

4.  **תיקונים והתאמות**:
    - תוקנו בעיות נגישות (A11y) ברכיבי ההגדרות.
    - סודרו נתיבי ייבוא (`paths`) ב-`tsconfig.json` כדי לזהות את החבילה הפנימית.

---

## 18/12/2025 - העברת רכיבים משותפים לספרייה (Refactor)

### 📦 העברת רכיבים ל-Share Library

הועברו הרכיבים `ProgressWidget` ו-`AdminGate` מתוך `apps/wordys-game` לספרייה המשותפת `packages/learn-booster-kit`.
המטרה היא לאפשר שימוש חוזר ברכיבים אלו בכל אפליקציות הפרויקט.

### 🛠️ שינויים שבוצעו

1. **learn-booster-kit**:
   - הוספו הרכיבים `src/ui/ProgressWidget.svelte` ו-`src/ui/AdminGate.svelte`.
   - עודכן `src/index.ts` לייצוא הרכיבים החדשים.
2. **wordys-game**:
   - הוחלפו הייבואים המקומיים בייבוא מהספרייה המשותפת: `import { ProgressWidget, AdminGate } from 'learn-booster-kit'`.
   - הוסר הקוד הכפול.
3. **train-addition-game**:
   - עודכן `src/routes/game/+page.svelte` לשימוש ב-`ProgressWidget` המשותף.
   - עודכן `src/lib/components/HeaderBar.svelte` לשימוש ב-`AdminGate` המשותף.
   - נמחק `src/lib/components/ProgressWidget.svelte` המקומי.
4. **בדיקות**:
   - הורץ `npm run check` ב-`wordys-game` לוודא תקינות אינטגרציה.
   - הורץ `npm run check` ב-`learn-booster-kit` לוודא תקינות הרכיבים.
   - הורץ `npm run check` ב-`train-addition-game` לוודא תקינות אינטגרציה.

---

## 13/12/2025 - תיקון לולאת בנייה (Build Loop Fix)

תוקנה בעיה שגרמה ללולאה אינסופית בעת הרצת `bun run build`.

### 🐛 הבעיה

שימוש בפקודות `npm run ... --workspaces` בתוך סביבת Bun גרם לרקורסיה אינסופית כאשר `Bun` ניסה להריץ את `npm` שניסה לנהל את ה-workspaces מחדש.

### 🛠️ התיקון

- עודכנו סקריפטים ב-`package.json` הראשי לשימוש בפקודה `bun run --filter '*' ...` במקום `npm`.
- הפקודה `bun run build` כעת מסתיימת (למרות שייתכנו שגיאות בנייה ספציפיות באפליקציות מסוימות, תשתית הבנייה תקינה).

---

## 13/12/2025 - עדכון נהלי פרויקט ותצורה

עודכנו חוקי הפרויקט (`GEMINI.md`) והגדרות התצורה כדי ליישר קו עם סטנדרטים חדשים של עבודה ושפה.

### 📜 מה בוצע

1.  **עדכון נהלי פרויקט (`GEMINI.md`)**:
    - **שפה**: הוגדר כי שדות ממשק המשימה (_TaskName_, _TaskStatus_) יהיו בעברית בלבד.
    - **קוד**: הוסף סעיף המגדיר כי הערות ייכתבו בעברית, בעוד שמות (משתנים/פונקציות) ייכתבו באנגלית.
    - **ארטיפקטים**: פורטה רשימת הארטיפקטים המותרים (`task`, `plan`, `walkthrough`).
    - **חשיבה**: הותר שימוש באנגלית עבור תהליך החשיבה הפנימי (_Thought/Reasoning_).
2.  **תצורה**:
    - עודכן `.gitignore` כך שיתעלם מקבצי לוג (`logs/*`) כדי לשמור על המאגר נקי.
    - נמחק קובץ זמני (`agent_terms.txt`) לאחר שהמידע הוטמע בנהלים.

---

## 13/12/2025 - הגירה למונוריפו (Monorepo)

הושלם בהצלחה תהליך איחוד הפרויקטים למבנה מונו-ריפו (Monorepo).

### 🚀 מה בוצע

1.  **יצירת מבנה**: הפרויקט אורגן מחדש עם תיקיות `apps/` ו-`packages/`.
2.  **מיזוג היסטוריה**:
    - השתמשנו ב-`git-filter-repo` (כלי מודרני ומהיר) כדי לשכתב את ההיסטוריה של כל פרויקט בנפרד.
    - כל הקבצים הוזזו לתיקיות המשנה המתאימות.
    - לכל קומיט נוסף קידומת (Scope) המזהה לאיזה פרויקט הוא שייך (למשל: `(wordys-game):`).
    - ההיסטוריות מוזגו לענף `main` נקי.
3.  **גיבוי**:
    - נוצר ענף `original-state-backup` המכיל את המצב המקורי בדיוק כפי שהיה לפני ההגירה (תמונת מצב).
    - נוצרה תיקיית גיבוי חיצונית (`../temp_migration_source`) ליתר ביטחון.
4.  **טיפול בחריגים**:
    - `learn-booster-kit`: לא היה מאגר git עצמאי ולכן הועתק כקוד חדש (קומיט רגיל).
    - `loto-game` / `wordys-game` / `read-faster` / `learn-booster`: היגרו בהצלחה עם כל ההיסטוריה.

### 📂 סטטוס נוכחי

- **ענף ראשי**: `main` (מכיל את המונוריפו המאוחד).
- **גיבוי**: `original-state-backup`.
- **קבצים**:
  - `apps/wordys-game`
  - `apps/loto-game`
  - `apps/read-faster`
  - `apps/learn-booster`
  - `packages/learn-booster-kit` (הוסף ידנית)

### 🛠️ הנחיות להמשך

- יש למחוק את תיקיית הגיבוי החיצונית `../temp_migration_source` לאחר וידוא סופי שהכל תקין.
- יש לעדכן את הסקריפטים (`package.json`) בשורש כדי לתמוך בעבודה עם Workspaces (למשל עם TurboRepo או סתם npm workspaces).

---

## 10/12/2025 - אינטגרציה של הגדרות Booster

### שיפורים ושילוב מערכת (Integration)

- שולבו הגדרות `learn-booster-kit` ישירות בתוך רכיב `SettingsControls.svelte`.
- הוסר התלות ברכיב `SettingsForm` המוטמע, לטובת חווית משתמש אחידה עם שאר ממשק ההגדרות.
- נוספו כל הפקדים הנדרשים לניהול בוסטר:
  - הפעלה/כיבוי ראשי עם אתחול שירות.
  - לולאה אוטומטית.
  - בחירת סוג פרס (וידאו/אפליקציה/אתר).
  - הגדרת תורות לחיזוק ומשך זמן.
  - הגדרות ספציפיות לכל סוג חיזוק (בחירת אפליקציה מ-Fully Kiosk, תיקיית דרייב, כתובת אתר).
- תוקנו בעיות ייבוא בחבילת `learn-booster-kit` (חשיפת `getAppsList` ו-`isFullyKiosk`).
- טופלו בעיות נגישות (A11y) בתוויות הטפסים החדשים.

### קבצים ששונו

- `apps/wordys-game/src/lib/components/admin/SettingsControls.svelte` - שכתוב מלא לשילוב ההגדרות.
- `packages/learn-booster-kit/src/index.ts` - ייצוא פונקציות עזר.

## 10/12/2025 - תיקון אנימציית מקלדת וירטואלית ושיפור קוד (Refactor)

### תיקון באג

- תוקן באג ברכיב `VirtualKeyboard.svelte` שמנע את אנימציית הלחיצה (`active`) בכפתורי האותיות (חוסר ברווח בשרשור classes).

### שיפור קוד (Refactoring)

- בוצע ארגון מחדש של ה-CSS ברכיב `VirtualKeyboard.svelte`.
- הוחלפו מחרוזות ארוכות של Tailwind classes בקלאסים סמנטיים (`.key-base`, `.key-char`, `.key-delete` וכו') בתוך בלוק `<style>`.
- נעשה שימוש ב-`@apply` כדי לשמור על הכוח של Tailwind תוך כדי ניקוי ה-HTML.

### בדיקות

- הורץ `bun run check` לוודא תקינות.
