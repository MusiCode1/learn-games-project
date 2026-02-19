# תוכנית ארגון מחדש של learn-booster-kit - הפרדת קוד ג'ינגים

## Context

חבילת `learn-booster-kit` הצטברה לאורך זמן וערבבה קוד גנרי (מנגנון תגמול, ניהול פרופילים, ניהול הגדרות) עם קוד ספציפי לאתר gingim.net (זיהוי עמודים, קונפיגורציית משחקים, הזרקת קוד). ארבע אפליקציות צרכניות (lotto-game, train-addition-game, wordys-game, kit-test-screen) משתמשות רק בחלק הגנרי. האפליקציה `apps/learn-booster` (הזרקה לג'ינגים) מחזיקה עותק עצמאי של כל הקבצים.

**מטרה:** הפרדת כל הקוד הספציפי לג'ינגים לתת-תיקייה `gingim/`, ניקוי שמות מ-branding ג'ינגים, ופישוט המבנה.

---

## שלב 1: יצירת תיקיית `gingim/` והעברת קבצים

**יצירת:** `packages/learn-booster-kit/src/lib/gingim/`

### העברת קבצים שאינם בשימוש ע"י אפליקציות צרכניות:

| קובץ מקור | יעד |
|---|---|
| `src/lib/game-config.ts` | `src/lib/gingim/game-config.ts` |
| `src/lib/booster-site.ts` | `src/lib/gingim/booster-site.ts` |
| `src/lib/booster-video.ts` | `src/lib/gingim/booster-video.ts` |
| `src/lib/config-store.svelte.ts` | `src/lib/gingim/config-store.svelte.ts` |

### יצירת קובץ חדש לזיהוי סביבת ג'ינגים:

**`src/lib/gingim/env-detection.ts`** - חילוץ הלוגיקה מ-`config-manager.ts`:
```typescript
export interface GingimEnvVals {
  isGingim: boolean;
  isGamePage: boolean;
  isGamesListPage: boolean;
  isGingimHomepage: boolean;
  isBoosterIframe: boolean;
  isDirectToGamePage: boolean;
}

export function getGingimEnvVals(): GingimEnvVals { ... }
```

### יצירת `src/lib/gingim/index.ts`:
ייצוא של כל הקוד הספציפי לג'ינגים מנקודה אחת.

---

## שלב 2: ניקוי `config-manager.ts`

**קובץ:** `packages/learn-booster-kit/src/lib/config-manager.ts`

- הסרת `GAME_PAGE_URL` ו-`DEV_SERVER_HOSTNAME` (ג'ינגים-ספציפי)
- פישוט `getEnvVals()` - להשאיר רק שדות גנריים:
  ```
  hostname, fullPath, isIframe, selfUrl, isDevServer, devMode, deployServer, isDeployServer
  ```
- שדות ג'ינגים (`isGingim`, `isGamePage` וכו') - להשאיר ב-type עם `@deprecated` וערך `false` קבוע (backward compat)

---

## שלב 3: ניקוי `default-config.ts`

**קובץ:** `packages/learn-booster-kit/src/lib/default-config.ts`

- הסרת fallback URL של ג'ינגים: `"https://gingim.net/wp-content/uploads/new_games/tidy_up/"` -> `""`

---

## שלב 4: ניקוי `get-app-list.ts`

**קובץ:** `packages/learn-booster-kit/src/lib/get-app-list.ts`

- הסרת בדיקת `currrntUrl?.origin === "https://gingim.net"` - שימוש במשתנה סביבה `VITE_DEMO_APP_LIST_ORIGIN` במקום hardcoded

---

## שלב 5: שינוי שם CSS class

### מ-`.gingim-booster` ל-`.learn-booster`

**קבצים לעדכון ב-kit:**
- `src/ui/component-composer.ts` (שורות 41, 48)
- `src/ui/BoosterContainer.svelte` (שורה 83)
- `src/ui/app.css` (שורה 24)

**קבצים לעדכון באפליקציות צרכניות:**
- יש לבדוק אם יש references ל-`.gingim-booster` באפליקציות - אם כן, לעדכן גם שם

---

## שלב 6: שינוי שמות Logger

### מ-`[gingim-booster]` ל-`[learn-booster]`

**קבצים:**
- `src/lib/logger.svelte.ts` - prefix
- `src/lib/booster-service.ts` - watchdog log

---

## שלב 7: מיגרציית מפתחות localStorage

### שינוי שמות עם backward compatibility

**`src/lib/config-manager.ts`:**
- מפתח ישן: `"gingim-booster-config"` -> חדש: `"learn-booster-config"`
- פונקציית מיגרציה: אם קיים מפתח ישן, להעתיק לחדש ולמחוק ישן

**`src/lib/profile-manager.ts`:**
- מפתח ישן: `"gingim-booster-profiles:v1"` -> חדש: `"learn-booster-profiles:v1"`
- אותה לוגיקת מיגרציה

**`src/lib/get-app-list.ts`:**
- `aad` string: `"gingim-booster-fully-kiosk-key:v1"` -> `"learn-booster-fully-kiosk-key:v1"`
- שימו לב: זה משפיע על הצפנה/פענוח - צריך לתמוך בשני הערכים בפענוח

---

## שלב 8: עדכון `types.ts` ו-`index.ts`

**`src/types.ts`:**
- סימון שדות ג'ינגים ב-`envVals` כ-`@deprecated`
- סימון `system.disableGameCodeInjection` כ-`@deprecated`

**`src/index.ts`:**
- הוספת export למודול gingim: `export * as gingim from "./lib/gingim"`

---

## סדר ביצוע

```
שלב 1 (gingim/ + העברה)  ← בטוח, קבצים שלא בשימוש
  ↓
שלב 2 (config-manager)   ← תלוי ב-1 (env-detection חולץ)
  ↓
שלב 3-4 (default, app-list) ← עצמאיים
  ↓
שלב 5-6 (CSS + logger)   ← עצמאיים, קוסמטי
  ↓
שלב 7 (localStorage)     ← זהיר, דורש מיגרציה
  ↓
שלב 8 (types + exports)  ← אחרון, סיכום
```

---

## אימות

1. **Build:** `cd packages/learn-booster-kit && npm run build` - וודא שה-build עובר
2. **Type check:** וודא ש-TypeScript מרוצה באפליקציות צרכניות
3. **Build אפליקציות:** `npm run build` בכל אחת מהאפליקציות הצרכניות (lotto-game, train-addition-game, wordys-game, kit-test-screen)
4. **אל תגע ב-`apps/learn-booster`** - לאפליקציה הזו יש עותק עצמאי של הקבצים, שינויים ב-kit לא משפיעים עליה
5. **localStorage:** בדיקה ידנית שמיגרציה עובדת - הגדרות ישנות לא אובדות

---
---

# פאזה 2: ארגון מחדש של מבנה הקוד

## Context

אחרי הפרדת קוד הג'ינגים (פאזה 1), כל הקבצים ב-`lib/` עדיין שטוחים בתיקייה אחת - 10+ קבצים בלי שום הגיון קיבוצי. כשמחפשים משהו, צריך לסרוק את כל הקבצים כדי למצוא את הנכון. אותו דבר ב-`ui/components/` - קומפוננטות settings ליד קומפוננטות וידאו ליד קומפוננטות גנריות.

**מטרה:** ארגון הקבצים לפי domains/תחומי אחריות כך שהכלל יהיה: "אם אני צריך לשנות X, ברור שזה בתיקייה Y".

---

## מבנה נוכחי (אחרי פאזה 1) → מבנה חדש

```
lib/
  booster-service.ts        ← נשאר (הליבה, האורקסטרטור)
  logger.svelte.ts          ← נשאר (חוצה-תחומים, בשימוש בכל מקום)

  config/                   ← חדש: "הגדרות ואיך הן נשמרות"
    config-manager.ts
    default-config.ts
    profile-manager.ts
    index.ts                ← barrel re-export

  video/                    ← חדש: "מאיפה מגיעים הסרטונים"
    video-loader.ts
    google-drive-video.ts
    index.ts                ← barrel re-export

  fully-kiosk/              ← חדש: "קוד ספציפי ל-Fully Kiosk"
    fully-kiosk.ts
    get-app-list.ts
    index.ts                ← barrel re-export

  utils/                    ← קיים, רק מוסיפים sleep
    cancel-full-screen.ts
    encript-decrypt-text.ts
    ms-to-time.ts
    shuffle-array.ts
    timer.ts
    sleep.ts                ← עובר מ-lib/sleep.ts

  gingim/                   ← מפאזה 1
```

---

## הסבר לכל קיבוץ

### `config/` — הגדרות ושמירה
**"אני צריך לשנות משהו בהגדרות או בפרופילים" → `config/`**

| קובץ | תפקיד |
|---|---|
| `config-manager.ts` | CRUD הגדרות, localStorage, listeners, `getEnvVals()` |
| `default-config.ts` | ערכי ברירת מחדל |
| `profile-manager.ts` | ניהול פרופילים (CRUD + localStorage) |

שלושת הקבצים תלויים זה בזה: config-manager מייבא מ-profile-manager ומ-default-config.

### `video/` — טעינת סרטונים
**"אני צריך לתקן משהו בטעינת סרטונים" → `video/`**

| קובץ | תפקיד |
|---|---|
| `video-loader.ts` | אורקסטרטור - מחליט מאיזה מקור לטעון, מערבב |
| `google-drive-video.ts` | Google Drive API לקבלת URLs של סרטונים |

### `fully-kiosk/` — קוד ספציפי ל-Fully Kiosk
**"אני צריך לשנות משהו בהתנהגות הטאבלט/קיוסק" → `fully-kiosk/`**

| קובץ | תפקיד |
|---|---|
| `fully-kiosk.ts` | זיהוי Fully Kiosk, גישה לקבצים, blob |
| `get-app-list.ts` | שליפת רשימת אפליקציות מותקנות דרך Fully Kiosk |

### מה נשאר ב-`lib/` root
- **`booster-service.ts`** — ה-orchestrator המרכזי. הוא מייבא מ-config/, משתמש ב-utils/timer, ומנהל את כל תהליך התגמול. הוא **הוא** ה-lib.
- **`logger.svelte.ts`** — בשימוש כמעט בכל קובץ. utility חוצה-תחומים.

### `sleep.ts` → `utils/sleep.ts`
קובץ בן 3 שורות, pure utility. שייך ליד shuffle-array ו-ms-to-time.

---

## שלבי ביצוע

### שלב 9: יצירת `lib/config/`
1. יצירת `lib/config/`
2. העברת `config-manager.ts`, `default-config.ts`, `profile-manager.ts`
3. יצירת `lib/config/index.ts`:
   ```typescript
   export * from './config-manager';
   export { getDefaultConfig } from './default-config';
   export * from './profile-manager';
   ```
4. עדכון imports פנימיים:
   - `booster-service.ts`: `'./config-manager'` → `'./config/config-manager'`
   - `ui/VideoMain.svelte`: `'../lib/config-manager'` → `'../lib/config/config-manager'`
   - `ui/SiteBoosterMain.svelte`: same
   - `ui/components/SettingsForm.svelte`: `'../../lib/config-manager'` → `'../../lib/config/config-manager'` + `'../../lib/profile-manager'` → `'../../lib/config/profile-manager'`
   - `config-manager.ts` פנימי: `'./profile-manager'` → `'./profile-manager'` (ללא שינוי - אותה תיקייה)
   - `config-manager.ts`: `'./default-config'` → `'./default-config'` (ללא שינוי)
   - `config-manager.ts`: `'./video-loader'` → `'../video/video-loader'` (אחרי שלב 10)

### שלב 10: יצירת `lib/video/`
1. יצירת `lib/video/`
2. העברת `video-loader.ts`, `google-drive-video.ts`
3. יצירת `lib/video/index.ts`:
   ```typescript
   export * from './video-loader';
   export * from './google-drive-video';
   ```
4. עדכון imports:
   - `config-manager.ts`: `'./video-loader'` → `'../video/video-loader'`
   - `video-loader.ts` פנימי: `'./google-drive-video'` → `'./google-drive-video'` (ללא שינוי)
   - `video-loader.ts`: `'./utils/shuffle-array'` → `'../utils/shuffle-array'`
   - `video-loader.ts`: `'./fully-kiosk'` → `'../fully-kiosk/fully-kiosk'` (אחרי שלב 11)
   - `video-loader.ts`: `'./logger.svelte'` → `'../logger.svelte'`

### שלב 11: יצירת `lib/fully-kiosk/`
1. יצירת `lib/fully-kiosk/`
2. העברת `fully-kiosk.ts`, `get-app-list.ts`
3. יצירת `lib/fully-kiosk/index.ts`:
   ```typescript
   export { isFullyKiosk, getFileList, getVideoBlob } from './fully-kiosk';
   export { getAppsList } from './get-app-list';
   ```
4. עדכון imports:
   - `video-loader.ts`: `'./fully-kiosk'` → `'../fully-kiosk/fully-kiosk'`
   - `get-app-list.ts` פנימי: `'./fully-kiosk'` → `'./fully-kiosk'` (ללא שינוי)
   - `get-app-list.ts`: `'./utils/encript-decrypt-text'` → `'../utils/encript-decrypt-text'`
   - `get-app-list.ts`: `'./config-manager'` → `'../config/config-manager'`
   - `ui/VideoMain.svelte`: `'../lib/fully-kiosk'` → `'../lib/fully-kiosk/fully-kiosk'`
   - `ui/components/SettingsForm.svelte`: `'../../lib/fully-kiosk'` → `'../../lib/fully-kiosk/fully-kiosk'` + `'../../lib/get-app-list'` → `'../../lib/fully-kiosk/get-app-list'`

### שלב 12: העברת `sleep.ts` ל-`utils/`
1. העברת `lib/sleep.ts` → `lib/utils/sleep.ts`
2. עדכון imports:
   - `booster-service.ts`: `'./sleep'` → `'./utils/sleep'`
   - `ui/VideoMain.svelte`: `'../lib/sleep'` → `'../lib/utils/sleep'`
   - `ui/SiteBoosterMain.svelte`: `'../lib/sleep'` → `'../lib/utils/sleep'`

### שלב 13: עדכון `src/index.ts`
עדכון נתיבי lib ב-barrel file (UI נשאר ללא שינוי):
```typescript
// config (נתיב חדש)
export * from "./lib/config";

// fully-kiosk (נתיב חדש)
export { getAppsList } from "./lib/fully-kiosk";
export { isFullyKiosk } from "./lib/fully-kiosk";
```

### שלב 14: עדכון imports ב-UI (בגלל שינויי lib/)
קבצי UI לא זזים, אבל ה-imports שלהם ל-lib/ צריכים עדכון:
- `ui/VideoMain.svelte`: `'../lib/config-manager'` → `'../lib/config/config-manager'`, `'../lib/fully-kiosk'` → `'../lib/fully-kiosk/fully-kiosk'`, `'../lib/sleep'` → `'../lib/utils/sleep'`
- `ui/SiteBoosterMain.svelte`: `'../lib/config-manager'` → `'../lib/config/config-manager'`, `'../lib/sleep'` → `'../lib/utils/sleep'`
- `ui/components/SettingsForm.svelte`: `'../../lib/config-manager'` → `'../../lib/config/config-manager'`, `'../../lib/profile-manager'` → `'../../lib/config/profile-manager'`, `'../../lib/fully-kiosk'` → `'../../lib/fully-kiosk/fully-kiosk'`, `'../../lib/get-app-list'` → `'../../lib/fully-kiosk/get-app-list'`

---

## סדר ביצוע כולל (פאזה 1 + 2)

```
פאזה 1: הפרדת ג'ינגים
  שלבים 1-8 (כמתוכנן למעלה)
    ↓
פאזה 2: ארגון lib/ מחדש
  שלב 9  (config/)      ← הכי מחובר, לעשות ראשון
    ↓
  שלב 10 (video/)       ← תלוי בנתיב config/ החדש
    ↓
  שלב 11 (fully-kiosk/) ← תלוי בנתיב video/ החדש
    ↓
  שלב 12 (sleep → utils) ← קל, עצמאי
    ↓
  שלב 13 (index.ts)     ← עדכון barrel file
    ↓
  שלב 14 (UI imports)   ← עדכון imports של קבצי UI לנתיבי lib/ החדשים
```

---

## אימות פאזה 2

1. **Build kit:** `cd packages/learn-booster-kit && npm run build`
2. **Build אפליקציות:** build כל אפליקציה צרכנית - imports מ-`'learn-booster-kit'` לא צריכים להשתנות
3. **בדיקת IDE:** וודא שה-IDE מזהה את כל ה-imports החדשים (אין קווים אדומים)
4. **אל תגע ב-`apps/learn-booster`** - יש לה עותק עצמאי

---
---

# טיוטה (לא לביצוע): ארגון UI לפי feature

> הוחלט לא לבצע כרגע - המבנה הנוכחי של UI מספיק טוב עם ~10 קומפוננטות.
> לשקול מחדש אם ה-UI יגדל משמעותית.

```
ui/
  BoosterContainer.svelte     ← נשאר ב-root
  ProgressWidget.svelte       ← נשאר ב-root
  AdminGate.svelte            ← נשאר ב-root
  app.css, component-composer.ts, assets/

  reward/
    video/
      VideoMain.svelte, VideoDialog.svelte, YoutubeDialog.svelte
    site/
      SiteBoosterMain.svelte

  settings/
    Settings.svelte, SettingsForm.svelte, SettingsMain.svelte

  shared/
    Modal.svelte, LoadingSpinner.svelte, LeftButton.svelte
```
