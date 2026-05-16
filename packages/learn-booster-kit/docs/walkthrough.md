# Learn Booster Kit — יומן פיתוח

## 2026-05-16 03:50

### `gameSettings` — תמיכה בהגדרות-משחק בפרופיל + תיקון 3 טסטים שבורים

הרחבת מערכת הפרופילים כך שפרופיל ייתפוס גם הגדרות ספציפיות-למשחק (לא רק הגדרות-קיט כמו `booster` ו-`video`). זוהי תשתית לחיבור `SettingsStore` של כל משחק למערכת הפרופילים — תוכנית הצעד הבא בפלטפורמיזציה.

#### מה בוצע?

**1. הרחבת `ConfigSchemaV1` — שדה `gameSettings`**

- הוספת `"gameSettings?": type({ "[string]": "unknown" })` ב-`schemas.ts`
- שדה אופציונאלי (`?`) → תאימות לאחור: פרופילים ישנים שנשמרו לפני התוספת לא יישברו ב-validation
- ערך-ברירת-מחדל ריק (`gameSettings: {}`) ב-`default-config.ts`
- הקיט לא מאמת את התוכן (`unknown`). כל משחק אחראי על schema של עצמו

**2. API חדש ב-`config-manager.ts`**

| פונקציה | חתימה | תיאור |
|---------|--------|--------|
| `getGameSettings<T>` | `(gameId: string) => T \| undefined` | קריאה מ-`appConfig.gameSettings[gameId]` |
| `updateGameSettings<T>` | `(gameId: string, settings: T) => Promise<Config>` | **החלפה מלאה** (לא deep-merge) של הגדרות-משחק. שאר המשחקים נשמרים |
| `subscribeGameSettings<T>` | `(gameId: string, cb) => () => void` | רישום לשינויים. callback ראשון נקרא עם הערך הנוכחי |

**3. תיקון 3 טסטים שבורים**

- `profile-manager.ts:cloneProfile` — לא מציב יותר `tags: undefined` ו-`color: undefined` שהיו נדחים ב-ArkType validation. רק שדות שמוגדרים בפועל נכללים → export/import עם פרופילים partial עובד.
- `get-app-list.spec.ts` — ה-mock objects שולחים את כל 5 השדות של `AppListItemSchema` (`icon/label/package/version/versionCode`), ולא רק `packageName, label` שגוי.

**4. `_resetProfilesStateForTesting`**

- הוספת פונקציה (test-only, `_` prefix) שמאפסת module-level state ב-`profile-manager` (`state`, `isInitialized`, `listeners`)
- בלי זה, test הבא רואה את הפרופיל מה-test הקודם ונכשל (ה-state הוא singleton ב-module)

**5. 17 טסטים חדשים ב-`test/game-settings.spec.ts`**

- `getGameSettings`: `undefined`, set/get, generic type
- `updateGameSettings`: שמירה, אי-דריסה בין משחקים, החלפה מלאה (לא merge), persistence
- `subscribeGameSettings`: initial value, change, no-emit לשינויי משחקים אחרים, unsubscribe
- integration: ההגדרות נשמרות בפרופיל ולא במפתח `localStorage` נפרד

#### החלטות ארכיטקטורה

- **`gameSettings` ב-Config (לא API נפרד)**: שמרנו את ההגדרות-משחק כחלק מ-`Config` כדי שיתסנכרנו אוטומטית עם הפרופיל הפעיל (`saveActiveProfileConfig`). החלפת פרופיל = החלפת **כל** ההגדרות (kit + game) יחד. זה ה-mental model הנכון של "פרופיל = הגדרות מלאות לתלמיד".

- **החלפה מלאה ולא deep-merge**: ה-`updateGameSettings` עוקף את ה-`deepMerge` של `updateConfig`. הסיבה: אם משחק משנה את ה-schema שלו (מסיר שדה ישן), `deepMerge` ישאיר את השדה הישן. החלפה מלאה תפעיל את ה-schema-migration של המשחק כפי שהמשחק עצמו מצפה.

- **`unknown` ולא generic-typed schema**: הקיט לא יודע על שום משחק ספציפי, אז הוא לא יכול לאמת את התוכן. כל משחק מאמת אצלו (ArkType / Zod / וכו'). ה-cost של "אובדן typing" מבוטל ע"י ה-generic `<T>` של ה-helpers.

#### תוצאה

- בדיקות: 148 → 162 passed (16 קבצי spec, 17 חדשים עוברים)
- `bun run --filter learn-booster-kit check`: 0/0
- ה-API מוכן לשלב הבא — חילוץ `BaseSettingsStore` שישתמש ב-`getGameSettings`/`updateGameSettings`/`subscribeGameSettings`

---

## 2026-05-16 02:30

### תיקון type-safety של הקיט — global window + import של schema types

תיקון 12 שגיאות `svelte-check` שצצו כשמשחק (find-letter-game) הריץ check על קבצי הקיט בהקשר tsconfig מחמיר (`strict` + `isolatedModules` + `verbatimModuleSyntax`). הקיט עצמו עבר check כי ה-tsconfig שלו פחות מחמיר, אבל הצרכנים שלו לא.

#### מה בוצע?

**1. `types.ts` — import + export של schema types**

- היה: `export type { Config, VideoItem, ... } from "./schemas"` — מייצא, אבל לא יוצר binding מקומי
- `types.ts` עצמו השתמש ב-`Config` ו-`VideoItem` ב-`VideoDialogProps`, `VideoConfig`, `AppConfig`, `ConfigOverrides`, `VideoList` → 5 שגיאות "Cannot find name"
- תיקון: `import type { ... } from "./schemas"` + `export type { ... }` בנפרד

**2. `types.ts` — `declare global` ל-Window**

- הוספת `declare global { interface Window { ... } }` עם:
  - `config?: unknown` — legacy gingim config שה-`config-manager` קורא לזיהוי `OldConfig`
  - `GingimBoosterTools?` — debug hooks שה-`booster-service` רושם לחלון
- ההצהרה ב-`types.ts` ולא ב-`vite-env.d.ts` כי `types.ts` מיובא ע"י כל צרכן (דרך re-exports מ-`index.ts`), ואילו `vite-env.d.ts` הוא ambient-only שלא בהכרח נכלל ב-tsconfig של הצרכן

**3. `booster-service.ts` — type annotation ל-options**

- היה: `(options) => this.rewardWatchdog.watchStateUntilReturn(options)` — `implicitly any`
- תיקון: `(options?: WatchStateWatchOptions) => ...` + `import type { WatchStateWatchOptions } from './watchdog/reward-watchdog'`

**4. `types.ts` — `getRemainingSeconds: () => number | null`**

- ההצהרה בקיט הייתה `() => number`, אבל המימוש ב-`reward-watchdog.ts` מחזיר `number | null`. תוקן ל-`number | null`.

#### החלטות ארכיטקטורה

- **`declare global` ב-`types.ts` ולא ב-`global.d.ts` נפרד**: צרכני הקיט (8 משחקים) לא תמיד כוללים את ה-`*.d.ts` של הקיט ב-tsconfig שלהם. `types.ts` הוא מודול שמיובא בכל מקום (דרך `index.ts`), ולכן ה-`declare global` שבו חל אוטומטית. שיטה זו מועדפת בקיטים שמשרתים צרכנים עם tsconfig שונים.

- **לא תוקנו שגיאות `FullyKiosk` באותו קומיט**: המשחקים `passcode`, `sort-cards`, `train-addition`, `jigsaw-v2` עדיין מקבלים 5-7 שגיאות מ-`fully-kiosk-js` — methods חסרים (`getBooleanSetting`, `getFileList`, `getStringRawSetting`, `readFile`) ו-`Subsequent property declarations must have the same type`. אלו בעיות בחבילה אחרת ובאקראיים פנימיים, לא קשור לקיט. ייפתר בקומיט נפרד אם נחליט.

#### תוצאה

| משחק | לפני | אחרי |
|------|------|------|
| `learn-booster-kit` (עצמו) | 0/0 | 0/0 |
| `find-letter-game` | 12 errors | 0 errors, 10 warnings |
| `lotto-game` | 0 errors | 0 errors |
| `wordys-game` | 0 errors | 0 errors |
| `kit-test-screen` | 0 errors | 0 errors |
| `passcode/sort-cards/train-addition/jigsaw-v2` | 6-7 errors | 6-7 errors (לא תוקן — `FullyKiosk`) |

---

## 2026-03-18 16:30

### הטמעת ArkType — runtime validation לכל נקודות כניסת הנתונים

הוספת ספריית ArkType 2.x כשכבת validation runtime לכל הנתונים החיצוניים שנכנסים למערכת: localStorage, BroadcastChannel, import.meta.env, Fully Kiosk API, וקלט משתמש מהטופס.

#### מה בוצע?

**1. תשתית schemas מרכזית**

- נוצר `src/schemas.ts` — קובץ schemas מרכזי עם כל הטיפוסים: `ConfigSchemaV1`, `ProfileSchema`, `ProfilesStateSchema`, `ProfilesExportPayloadSchema`, `OldConfigSchema`, `FullyItemSchema`, `AppListItemSchema`, `VideoItemSchema`
- כל הטיפוסים המתאימים ב-`src/types.ts` הוחלפו ב-re-exports מ-schemas (מקור אמת אחד)
- הותקן `arktype@2.2.0` כ-dependency

**2. גרסאות סכמת Config (Schema Versioning)**

- `ConfigSchemaV1` — הגרסה הנוכחית
- `CONFIG_SCHEMA_VERSION`, `CONFIG_SCHEMA_REGISTRY` — מאפשרים migration עתידי בין גרסאות
- `_configSchemaVersion` נשמר ב-localStorage עם כל שמירה
- טעינה מ-localStorage בוחרת schema מה-registry לפי גרסה

**3. Validation בטעינה מ-localStorage**

- `loadConfigFromStorage()` — `ConfigSchema.partial()` עם version-aware loading
- `loadFromStorage()` בprofiles — `ProfilesStateSchema` + fallback ל-`normalizeState()`
- `loadOverlaySettings()` — `OverlayTimerSettingsSchema` עם constraints מספריים
- `importProfiles()` — `ProfilesExportPayloadSchema` + שינוי signature ל-`unknown`

**4. Validation בשמירה (form inputs)**

- `updateConfig()` — `ConfigSchema` מאמת config מלא לפני שמירה, זורק שגיאה אם לא תקין
- `SettingsForm.svelte` כבר עוטף ב-try-catch → מציג שגיאה למשתמש

**5. Validation ל-BroadcastChannel**

- `listenForCommands()` — `TimerCommandSchema` מאמת פקודות נכנסות
- `overlay-settings` — `OverlayTimerSettingsSchema` מחליף `validate()` ידני

**6. ריכוז משתני סביבה**

- נוצר `src/lib/config/env.ts` — ArkType validation לכל `VITE_*` vars
- עודכן `src/vite-env.d.ts` עם `ImportMetaEnv` interface
- כל 5 הקבצים הצורכים עודכנו לייבא מ-`env.ts` במקום `import.meta.env` ישירות
- אזהרות מפורשות למשתנים קריטיים חסרים
- `getFilesFromGDrive()` — early return אם API key חסר (מונע קריאות רשת מיותרות)

**7. OldConfig migration**

- `OldConfigSchema` + `migrateOldConfig()` ב-`config-manager.ts`
- `initializeConfig()` בודק `window.config` ומבצע migration אם מזהה פורמט ישן

**8. Fully Kiosk API validation**

- `getFileList()` — `FullyItemSchema.array()` על JSON.parse result
- `getAppsList()` + `getExampleAppList()` — `AppListItemSchema.array()` על API responses

**9. בדיקות (42 tests)**

- `test/schemas.spec.ts` — בדיקות per-version לכל schema
- כולל: ConfigSchemaV1, CONFIG_SCHEMA_REGISTRY, ProfileSchema, ProfilesStateSchema, ProfilesExportPayloadSchema, OldConfigSchema, OverlayTimerSettingsSchema, TimerCommandSchema, FullyItemSchema, AppListItemSchema

#### החלטות ארכיטקטורה

- **Schema-first לנתונים חיצוניים, interfaces לטיפוסי runtime**: טיפוסים שמכילים פונקציות, Svelte stores, DOM elements (כמו `VideoController`, `TimerController`) נשארו כ-interfaces ב-`types.ts` — ArkType לא מאמת פונקציות
- **קובץ schemas מרכזי vs. ליד כל type**: נבחר קובץ מרכזי `src/schemas.ts` כי הטיפוסים מתייחסים זה לזה (`Profile` מכיל `Config`, `ProfilesState` מכיל `Profile`)
- **Validation ב-`updateConfig()` ולא בטופס**: נקודת חנק אחת שמגנה על כל הצרכנים (טופס, קוד חיצוני, אוטומציה)
- **`normalizeState()` נשמרת**: ArkType הוא שכבה ראשונה; `normalizeState` מטפלת ב-corrupted/partial data כ-best-effort fallback
- **`FullyItem` — schema בלי re-export**: הטיפוס מגיע מ-`fully-kiosk-js`, ה-schema משמש רק ל-runtime validation

#### מעקפים ופתרונות

- **`ConfigSchema.partial()` בטעינה**: localStorage שומר partial overrides (לא config מלא). `partial()` הופך כל שדה ל-optional, ו-`deepMerge` עם `defaultConfig` ממלא חסרים
- **clamp נשמר ב-`saveOverlaySettings()`**: ArkType דוחה ערכים מחוץ לתחום (לא מעגן אותם). ה-clamp הידני נשאר בצד השמירה כדי לוודא שערכים תמיד בתחום
- **`_configSchemaVersion` optional**: נתונים ישנים ב-localStorage אין להם שדה זה — ברירת מחדל 1 לתאימות לאחור
