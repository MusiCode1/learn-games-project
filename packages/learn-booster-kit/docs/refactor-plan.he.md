# תוכנית ריפקטור: הפרדת Core/Gingim ב-`learn-booster-kit` (תכנון מחדש מלא, ללא שבירת תאימות)

## תקציר
1. מטרה: תכנון מחדש של `packages/learn-booster-kit` למבנה צפוי וברור, עם בידוד כל לוגיקה ספציפית ל-Gingim תחת `packages/learn-booster-kit/src/lib/gingim`.
2. אילוץ מרכזי: לא מערבבים קוד מיגרציה בתוך מודולי הליבה; תאימות ומיגרציה נשארות במודולים נפרדים.
3. מצב התחלתי: `bun run --filter learn-booster-kit check` תקין.

## חלופות שנשקלו והחלטה
1. העברת קבצים בלבד: נפסל, כי לא פותר מורכבות ותלות הדדית.
2. תכנון מחדש לשכבות + שכבת תאימות נפרדת: נבחר, כי יוצר גבולות ברורים ותומך בהוצאה עתידית.
3. פיצול מיידי לחבילה/פלאגין נפרד: נדחה לשלב עתידי בגלל סיכון גבוה כרגע.

## ארכיטקטורת יעד
1. `src/lib/core/**`: מנוע מחזקים כללי, ללא תלות דומיין.
2. `src/lib/gingim/**`: חוקים, ברירות מחדל והתאמות ספציפיות ל-Gingim בלבד.
3. `src/lib/platform/**`: אינטגרציות חיצוניות משותפות (Fully Kiosk, Google Drive).
4. `src/lib/utils/**`: פונקציות עזר כלליות.
5. `src/compat/**`: wrappers ותאימות אחורה, כולל מיגרציית Storage.
6. `src/index.ts`: ממשק ציבורי יציב שמייצא את שכבת התאימות.

## ארגון קבצים מתוכנן
| נתיב נוכחי | נתיב יעד | הערה |
|---|---|---|
| `src/lib/booster-service.ts` | `src/lib/core/booster-service.ts` | orchestrator כללי |
| `src/lib/booster-video.ts` | `src/lib/core/reward/video/booster-video.ts` | וידאו כללי |
| `src/lib/booster-site.ts` | `src/lib/core/reward/site/booster-site.ts` | `site` נשאר פיצ'ר כללי |
| `src/lib/video-loader.ts` | `src/lib/core/reward/video/video-loader.ts` | טעינת וידאו כללית |
| `src/lib/config-manager.ts` | `src/lib/core/config/config-manager.ts` + `src/lib/gingim/env/derive-gingim-env.ts` | פיצול env כללי מול Gingim |
| `src/lib/default-config.ts` | `src/lib/core/config/default-config.ts` + `src/lib/gingim/defaults.ts` | ברירות מחדל ספציפיות מבודדות |
| `src/lib/profile-manager.ts` | `src/lib/core/config/profile-manager.ts` | עם מפתחות ניטרליים |
| `src/lib/get-app-list.ts` | `src/lib/platform/fully/get-app-list.ts` + `src/lib/gingim/demo-app-list.ts` | Fully כללי + מדיניות דמו ספציפית |
| `src/lib/google-drive-video.ts` | `src/lib/platform/google-drive/video-source.ts` | אינטגרציה משותפת |
| `src/lib/fully-kiosk.ts` | `src/lib/platform/fully/fully-kiosk.ts` | אינטגרציה משותפת |
| `src/lib/logger.svelte.ts` | `src/lib/core/observability/logger.ts` | logger ניטרלי |
| `src/lib/game-config.ts` | `src/lib/gingim/legacy/game-config.ts` | קוד legacy מבודד |
| `src/lib/config-store.svelte.ts` | `src/lib/core/config/config-store.svelte.ts` | ללא שינוי התנהגות |
| `src/lib/sleep.ts` | `src/lib/core/sleep.ts` | כללי |
| `src/lib/utils/*` | `src/lib/utils/*` | נשאר במקומו |

## תכנון תאימות ומיגרציה
1. יצירת `src/compat/index.ts` עם אותה צורת API ציבורי שקיימת היום.
2. יצירת `src/compat/config-manager.ts` שעוטף את מנהל הקונפיג ומפעיל preflight מיגרציה.
3. יצירת `src/compat/booster-service.ts` כך ש-`boosterService.init()` תמיד עובר דרך preflight תאימות.
4. `src/index.ts` ייצא דרך `src/compat/index.ts` וימשיך לייצא את רכיבי Svelte הקיימים.
5. מודול מיגרציה נפרד: `src/compat/migrations/migrate-storage-v1-to-v2.ts`.
6. מפתחות חדשים ניטרליים:
`learn-booster-kit:config:v2`, `learn-booster-kit:profiles:v2`, `learn-booster-kit:migration:v2:done`.
7. מפתחות ישנים לקריאה בלבד:
`gingim-booster-config`, `gingim-booster-profiles:v1`.
8. מדיניות מיגרציה:
אם המפתחות החדשים חסרים אבל הישנים קיימים, מעתיקים לחדשים, לא מוחקים ישנים בשלב זה, שומרים סימון migration done, והפעולה אידמפוטנטית.

## API ציבורי, ממשקים וטיפוסים
1. נתיב ייבוא חיצוני נשאר `learn-booster-kit`, ללא צורך בשינויים באפליקציות.
2. שמות הייצוא הקיימים נשמרים:
`boosterService`, `updateConfig`, `getAppsList`, `isFullyKiosk`, `BoosterContainer`, `SettingsForm`, `AdminGate`, `ProgressWidget`, `Config`.
3. `rewardType: "site"` נשאר פיצ'ר כללי.
4. מבנה `Config.envVals` נשמר תואם אחורה בשלב זה (כולל שדות Gingim), בעוד ההפקה שלו מפוצלת פנימית.

## שלבי ביצוע
1. יצירת מבנה תיקיות היעד וביצוע העברות קבצים ללא שינוי התנהגות.
2. הוספת adapters פנימיים ל-env enrichment, defaults injection ומדיניות app-list.
3. העברת כל הלוגיקה הספציפית ל-Gingim לתוך `src/lib/gingim/**`.
4. מימוש wrappers בשכבת `src/compat/**` ומיגרציית storage נפרדת.
5. העברת קוד ישן שאינו בשימוש ל-`src/lib/gingim/legacy/**`.
6. עדכון imports פנימיים בכל החבילה לנתיבים החדשים.
7. עדכון `src/index.ts` למיפוי exports דרך compat.
8. הוספת תיעוד גבולות ארכיטקטורה ב-`packages/learn-booster-kit/docs/architecture-core-vs-gingim.md`.
9. הוספת בדיקת גבולות (script) שנכשלת אם סמני Gingim מופיעים מחוץ ל-`src/lib/gingim` או `src/compat`.

## בדיקות ותסריטי קבלה
1. בדיקות חבילה:
`bun run --filter learn-booster-kit check`, `bun run --filter learn-booster-kit build`.
2. בדיקות תאימות אפליקציות צרכניות:
`kit-test-screen`, `lotto-game`, `train-addition-game`, `wordys-game` עם `check`.
3. תרחיש מיגרציה A:
קיימים רק מפתחות ישנים, לאחר init המפתחות החדשים נוצרים והנתונים נשמרים.
4. תרחיש מיגרציה B:
התקנה נקייה ללא מפתחות, נוצרים רק מפתחות חדשים עם ברירות מחדל.
5. תרחיש תגמול אתר:
`rewardType: "site"` עם URL שאינו Gingim עובד כרגיל.
6. תרחיש Fully:
עם Fully מתקבלת רשימת אפליקציות, בלי Fully מתקבלת התנהגות fallback תואמת.
7. בדיקת גבולות:
`rg "gingim.net|wp-content/uploads/new_games|gingim-booster"` מחזיר תוצאות רק ב-`src/lib/gingim/**` או `src/compat/**`.

## הנחות והחלטות שננעלו
1. נדרש תכנון מחדש מלא בשלב זה.
2. הפרדת Gingim כוללת רק לוגיקה דומיינית לאתר Gingim, לא פיצ'רים כלליים.
3. `site` הוא פיצ'ר כללי לכל אפליקציה.
4. אסור לשבור imports קיימים של האפליקציות.
5. קוד מיגרציה נשאר שכבה נפרדת מהליבה.
6. קוד לא בשימוש מועבר ל-legacy נפרד ולא נמחק בסבב הזה.
