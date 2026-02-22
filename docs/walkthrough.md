# יומן פיתוח (Walkthrough)

מסמך זה מתעד שינויים **חוצי פרויקטים** ותשתית כללית במונוריפו.  
לתיעוד ספציפי של כל פרויקט, ראה את קובץ `docs/walkthrough.md` בתוך תיקיית הפרויקט.

---

## 2026-02-22 02:45

### עדכון קבצי בדיקות learn-booster-kit לאחר רפקטורינג מבנה src

עדכון `test/src.ts` וכל קבצי ה-spec כדי שיתאימו למבנה הקבצים החדש שנוצר ברפקטורינג קודם (ארגון מחדש לתת-תיקיות `config/`, `video/`, `fully-kiosk/`), ועדכון מפתחות localStorage שהשתנו מ-`gingim-booster-*` ל-`learn-booster-*`.

#### מה בוצע?

**1. test/src.ts — מקור אמת יחיד לנתיבי ייבוא בבדיקות**

- עודכנו כל הנתיבים לאחר הרפקטורינג:
  - `../src/lib/sleep` ← `../src/lib/utils/sleep`
  - `../src/lib/config-manager` ← `../src/lib/config/config-manager`
  - `../src/lib/default-config` ← `../src/lib/config/default-config`
  - `../src/lib/profile-manager` ← `../src/lib/config/profile-manager`
  - `../src/lib/video-loader` ← `../src/lib/video/video-loader`
  - `../src/lib/get-app-list` ← `../src/lib/fully-kiosk/get-app-list`

**2. קבצי spec — תיקון נתיבי vi.doMock ו-dynamic imports**

- `test/get-app-list.spec.ts`: עודכנו מסכות ל-`fully-kiosk/fully-kiosk`, `config/config-manager`, ויבוא דינמי ל-`fully-kiosk/get-app-list`.
- `test/video-loader.spec.ts`: עודכנו מסכות ל-`video/google-drive-video`, `fully-kiosk/fully-kiosk`, ויבוא דינמי ל-`video/video-loader`.
- `test/profile-manager.spec.ts` + `test/profile-manager.migration.spec.ts`: תוקנו ייבואים ל-`config/default-config` ו-`config/profile-manager`.

**3. עדכון מפתחות localStorage בבדיקות**

- `config-manager.spec.ts`: המפתח `gingim-booster-config` ← `learn-booster-config`.
- `config-manager.migration.spec.ts`: עודכנו הבדיקות מ"לפני רפקטורינג" ל"אחרי רפקטורינג" — הבדיקות כעת מוודאות שמירה תחת המפתח החדש ו-null תחת הישן.
- `profile-manager.spec.ts` + `profile-manager.migration.spec.ts`: המפתח `gingim-booster-profiles:v1` ← `learn-booster-profiles:v1`.

#### תוצאה

14/14 קבצי בדיקות עוברים, 106 בדיקות עוברות, 9 todo.

---

## 2026-02-21 00:00

### ייצוא CSS מ-learn-booster-kit — הסרת @source עם path יחסי

הפיכת `learn-booster-kit` לpackage שמייצא את ה-CSS שלו עצמו, כך שאפליקציות צורכות לא צריכות לדעת על מבנה הקבצים הפנימי.

#### מה בוצע?

**1. learn-booster-kit — הוספת CSS export**

- נוצר `src/styles.css` עם `@source '.'` — מורה ל-Tailwind לסרוק את כל `src/`.
- נוסף export רשמי בpackage.json: `"./styles": "./src/styles.css"`.

**2. כל האפליקציות הצורכות**

- הוחלף `@source '../../../../packages/learn-booster-kit'` ב-`@import 'learn-booster-kit/styles'` בכל `layout.css`.
- `kit-test-screen`: עודכן גם ה-alias ב-`vite.config.ts` מ-`src/index.ts` ל-`src/` (ספרייה), כדי ש-`learn-booster-kit/styles` יפנה ל-`src/styles.css` דרך ה-alias.

#### החלטות ארכיטקטורה

- **`@import 'package/styles'` במקום `@source '../node_modules/package'`**: זהו הפטרן המוצהר של Tailwind CSS 4 לספריות — הספרייה מייצאת קובץ CSS עם `@source`, הצרכן עושה `@import`. הفائدה: הצרכן לא צריך לדעת מה מבנה הקבצים הפנימי של הpackage.
- **`@source '.'` ולא נתיב ספציפי**: סורק את כל `src/`, כולל קבצים עתידיים, ללא צורך לעדכן את הconfigs.

---

## 2026-02-19 18:26

### הקשחת lifecycle ב-learn-booster-kit ושיפור ברירת מחדל לווידאו

בוצעו שינויים בספרייה המשותפת `learn-booster-kit` כדי למנוע שימוש בשירות לפני אתחול, לשפר אבחון תקלות בזרימות תגמול, ולעדכן ברירת מחדל למקור וידאו מבוסס Google Drive.

#### מה בוצע?

**1. BoosterService - הקשחת אתחול וניהול מצב**

- נוספה אכיפת אתחול (`ensureInitialized`) לפני גישה ל-`config`, `timer`, `isRewardActive` ולפני רישום controls.
- `init()` מחזיר מופע מאותחל מסוג `BoosterServiceInitialized`.
- התווסף ייצוא type ציבורי `BoosterServiceInitialized` דרך `src/index.ts`.
- נוסף `activeRewardSessionId` כדי לשייך פעולות async לסשן reward ספציפי ולהקטין זליגת מצב בין סשנים.

**2. אבחון Timeout בזרימות Reward**

- נוספה תשתית `startRewardWatchdog` עם payload אבחוני (טיימר, סטטוס מודאל, סימני stall וסיבת חשד).
- חיבור watchdog לזרימות `video`, `site`, `app` עם ניקוי subscriptions/timeout בסיום.
- הורחב watcher של Fully עם `getStatus()` לטובת דיווח מדויק יותר ב-timeout.

**3. ברירות מחדל קונפיגורציה**

- עודכנה ברירת המחדל `video.source` מ-`local` ל-`google-drive` בקובץ `default-config`.

#### החלטות ארכיטקטורה

- **Guard ברמת Service במקום להסתמך על סדר קריאות חיצוני**: נבחרה אכיפה פנימית בשירות כדי למנוע שימוש שגוי גם אם צרכן ספרייה לא ממתין נכון ל-`init`.
- **Watchdog תצפיתי ולא מנגנון ביטול כפוי**: נבחר logging אבחוני במקום force-close, כדי להימנע מהחמרת תקלות UX ולתת שקיפות לצווארי בקבוק אמיתיים בזמן ריצה.

## 2026-02-11 13:00 - עדכוני TTS ו-Kiosk (Train Game)

נוספה תמיכה ב-Fully Kiosk Browser עבור Text-to-Speech ואפשרות לשינוי נוסח השאלה.

### 🚀 מה בוצע

1.  **Fully Kiosk Polyfill**:
    - נוסף ממשק `FullyKiosk` ומימוש ב-`tts.ts`.
    - המערכת מזהה אוטומטית אם היא רצה ב-Fully Kiosk ומשתמשת במנוע ה-TTS המובנה שלו (אמין יותר בקיוסק).

2.  **שאלה ומשוב מפורטים**:
    - נוספה הגדרה חדשה: `detailedQuestion`.
    - **משוב הצלחה מפורט**: "נכון! 3 ועוד 3 שווה 6! כל הכבוד!".
    - **חזרה על השאלה בעת טעות**: אם "שאלה מפורטת" פעילה, לאחר טעות המערכת תשאל שוב "כמה זה X ועוד Y?" כדי לחזק את הלמידה.
    - **מקור אמת יחיד (`VOICE_ASSETS`)**: כל קבצי הקול והטקסטים אוחדו לאובייקט אחד ב-`tts.ts`, המאפשר ניהול קל ושימוש ב-TTS כגיבוי לכל חלק חסר.

3.  **ממשק משתמש**:
    - נוסף מתג (Toggle) בהגדרות לשליטה על "שאלה מפורטת".

---

## 2025-12-24 19:33 - עדכון Workflow לתיעוד פיתוח

עודכנו קבצי ה-workflows של תהליך התיעוד עם הנחיות מפורטות יותר.

### 🛠️ מה בוצע

**1. עדכון `update_walkthrough.md`:**

- **מיקום תיעוד**: הוספת הבהרה - שינויים ספציפיים לפרויקט יתועדו בתוך תיקיית הפרויקט, שינויים חוצי-פרויקטים יתועדו בתיקייה הראשית.
- **הדגשת שעה**: הוספת הערה שחובה לציין תאריך **ושעה** מלאים.
- **קטגוריות חדשות**:
  - **החלטות ארכיטקטורה** - תיעוד למה נבחרה גישה מסוימת על פני אחרות.
  - **מעקפים (Workarounds)** - תיעוד פתרונות לבעיות ספציפיות עם הסבר.

**2. עדכון `commit.md`:**

- הוסרה כפילות תיעוד ה-walkthrough והוחלפה בהפניה ל-workflow הייעודי.

#### החלטות ארכיטקטורה

- **הפרדת תיעוד לפי פרויקט**: החלטה לכתוב תיעוד ספציפי בתוך כל פרויקט (ולא בתיקייה מרכזית) כדי לשמור על קשר הדוק בין הקוד לתיעוד שלו.

---

## 24/12/2025 18:50 - סידור מבנה קומפוננטות (Co-location)

בוצע ארגון מחדש של מבנה הקומפוננטות בכל הפרויקטים בהתאם לעיקרון **Co-location** - מיקום קומפוננטות ייחודיות לדף בתוך תיקיית `_components` ליד ה-Route שלהן.

### 🚀 מה בוצע

1.  **הגדרת סטנדרט**:
    - נוצר מסמך [docs/component_structure.md](file:///d:/UserProjects/ThzoharHalev/learn-games-project/docs/component_structure.md) המתעד את האפשרויות והסטנדרט שנבחר.

2.  **train-addition-game**:
    - 8 קומפוננטות הועברו ל-`src/routes/game/_components`
    - `SettingsControls` הועבר ל-`src/routes/settings/_components`
    - נשאר רק `HeaderBar` ב-`src/lib/components` (משותף)

3.  **wordys-game**:
    - 8 קומפוננטות הועברו ל-`src/routes/(no-settings)/game/[shelfId]/[boxId]/_components`
    - `SettingsControls` הועבר ל-`src/routes/admin/settings/_components`
    - `src/lib/components` נמחק (ריק)

### 📚 הנחיות להמשך

- קומפוננטות בשימוש יחיד: למקם בתיקיית `_components` של ה-Route.
- קומפוננטות משותפות: למקם ב-`src/lib/components`.

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
   - הוחלפו הייבואים המקומיים בייבוא מהספרייה המשותפת.
3. **train-addition-game**:
   - עודכנו הרכיבים לשימוש ברכיבים המשותפים.

---

## 13/12/2025 - תיקון לולאת בנייה (Build Loop Fix)

תוקנה בעיה שגרמה ללולאה אינסופית בעת הרצת `bun run build`.

### 🐛 הבעיה

שימוש בפקודות `npm run ... --workspaces` בתוך סביבת Bun גרם לרקורסיה אינסופית.

### 🛠️ התיקון

- עודכנו סקריפטים ב-`package.json` הראשי לשימוש בפקודה `bun run --filter '*' ...`.

---

## 13/12/2025 - עדכון נהלי פרויקט ותצורה

עודכנו חוקי הפרויקט (`GEMINI.md`) והגדרות התצורה כדי ליישר קו עם סטנדרטים חדשים של עבודה ושפה.

### 📜 מה בוצע

1.  **עדכון נהלי פרויקט (`GEMINI.md`)**:
    - **שפה**: הוגדר כי שדות ממשק המשימה יהיו בעברית בלבד.
    - **קוד**: הוסף סעיף המגדיר כי הערות ייכתבו בעברית, שמות באנגלית.
2.  **תצורה**:
    - עודכן `.gitignore` כך שיתעלם מקבצי לוג.

---

## 13/12/2025 - הגירה למונוריפו (Monorepo)

הושלם בהצלחה תהליך איחוד הפרויקטים למבנה מונו-ריפו (Monorepo).

### 🚀 מה בוצע

1.  **יצירת מבנה**: הפרויקט אורגן מחדש עם תיקיות `apps/` ו-`packages/`.
2.  **מיזוג היסטוריה**: השתמשנו ב-`git-filter-repo` לשכתוב ההיסטוריה.
3.  **גיבוי**: נוצר ענף `original-state-backup`.

### 📂 סטטוס נוכחי

- **ענף ראשי**: `main` (מכיל את המונוריפו המאוחד).
- **גיבוי**: `original-state-backup`.
