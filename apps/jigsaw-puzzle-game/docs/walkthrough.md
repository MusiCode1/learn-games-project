# Jigsaw Puzzle Game — יומן פיתוח

## 2026-05-01 10:07

### version-2 — מערכת פרופילים (שלב 3 מתוך 3) — TDD

נוספה מערכת פרופילים להגדרות שמאפשרת לבחור בין "מתחילים", "בינוני", "מתקדם" או "מותאם אישית". הפיצ'ר פותח בגישת TDD.

#### מה בוצע?

**1. טיפוסים (`types.ts`)**

- נוסף `SettingsProfile = "beginner" | "intermediate" | "advanced" | "custom"`
- נוסף שדה `activeProfile: SettingsProfile` ל-`TeacherSettings`
- ברירת מחדל למשתמש חדש: `beginner`

**2. Store (`settings.svelte.ts`)**

- `CURRENT_VERSION` הועלה מ-6 ל-7
- נוסף `PROFILE_PRESETS` — מפה של ערכי הגדרות לכל פרופיל:

| הגדרה | beginner | intermediate | advanced |
|-------|----------|--------------|----------|
| beginnerMode | true | false | false |
| gridPresetIndex | 1 (2×2) | 3 (3×3) | 5 (4×4) |
| shufflePiecePlacement | false | true | true |
| adaptGridToImage | true | true | false |
| studentLockMode | true | false | false |
| proximity | 50 | 35 | 25 |
| shapeStyle | classic | classic | classic |

- נוסף `applyProfile(profile)` — מחיל ערכי preset (או רק מסמן custom)
- נוסף `markAsCustom()` — לסימון ידני של פרופיל מותאם אישית מ-UI
- מיגרציה: משתמש קיים (v6 ומטה) מקבל `activeProfile: "custom"` כדי לא לדרוס הגדרות קיימות

**3. בדיקות TDD (`settings.test.ts`) — 8 בדיקות**

| # | תרחיש | תוצאה |
|---|-------|-------|
| 1 | applyProfile("beginner") | מגדיר ערכים נכונים |
| 2 | applyProfile("intermediate") | מגדיר ערכים נכונים |
| 3 | applyProfile("advanced") | מגדיר ערכים נכונים |
| 4 | applyProfile("custom") | לא משנה הגדרות קיימות |
| 5 | markAsCustom() | מעביר ל-custom |
| 6 | migration מ-v6 | activeProfile=custom |
| 7 | משתמש חדש | activeProfile=beginner |
| 8 | toJSON כולל activeProfile | schemaVersion=7 |

**4. UI בחירת פרופיל (`settings/+page.svelte`)**

- נוסף בוחר פרופיל בראש דף ההגדרות עם 4 כפתורים
- רקע gradient `from-sky-100 to-indigo-100`
- הסבר דינמי לפי פרופיל נבחר

#### החלטות ארכיטקטורה

- **TDD**: בדיקות נכתבו קודם (RED), אומתו שהן נכשלות, ואז נוסף הקוד (GREEN)
- **`markAsCustom()` במקום $effect**: במקום לזהות שינוי ידני דרך $effect (שלא רץ סינכרוני ב-vitest), נוספה מתודה ייעודית שניתן לקרוא מ-UI
- **מיגרציה שומרת על הגדרות קיימות**: משתמש שכבר התאים הגדרות לא יאבד אותן בעדכון

#### בדיקות שבוצעו

- 14 unit tests עברו (6 ב-adaptive-grid, 8 ב-settings)
- `bun run build` עבר בהצלחה
- warnings בלבד ב-check (a11y labels, חבילות חיצוניות)

#### Deploy
- dev: `https://dev.puzzle-game-92p.pages.dev`

---

## 2026-04-30 15:50

### version-2 — סידור הגדרות לקטגוריות (שלב 2 מתוך 3) — UI Refactor

UI refactor בלבד בדף ההגדרות — ללא שינוי behavior, store, או bindings.

#### מה בוצע?

**קובץ:** `src/routes/(app)/settings/+page.svelte`

ארגון מחדש של ההגדרות לארבע קטגוריות עם כותרות ברורות:

1. **רמת קושי והתאמה לתלמיד** — מצב מתחילים, מצב נעילה, גודל פאזל, התאם grid לתמונה, ערבוב חלקים, הצגת חלקים, רגישות חיבור, סגנון חלקים, אפשר פירוק חלקים
2. **תמונות ומהלך משחק** — חבילת תמונות, תמונת עזר, ערבוב תמונות, מצב משחק, כפתור "המשך" לצד פרס, הקראת משוב, כפתור סידור מחדש
3. **חיזוקים (Gingim Booster)** — הבלוק הקיים ללא שינוי
4. **תחזוקה** — איפוס להגדרות ברירת מחדל

עיצוב כותרת קטגוריה: `<h2>` עם `border-b-2 border-slate-200`.

#### Deploy
- dev: `https://dev.puzzle-game-92p.pages.dev`

---

## 2026-04-30 14:36

### version-2 — Grid אדפטיבי (שלב 1 מתוך 3) — TDD

נוסף פיצ'ר חדש שמתאים את ממדי ה-grid (columns × rows) לפרופורציות התמונה. זה הצעד הראשון מתוך תוכנית ה-refactor של הגדרות (Grid אדפטיבי → סידור לקטגוריות → מערכת פרופילים).

הפיצ'ר פותח בגישת **TDD** באמצעות סקיל `mattpocock/skills@tdd` (Vertical Slicing — בדיקה אחת, קוד שעובר אותה, חזרה).

#### מה בוצע?

**1. מודול חדש `adaptive-grid.ts` עם 6 בדיקות יחידה**

נוצרו במקביל לפיתוח (TDD):
- `adaptGridToImage({ targetPieceCount, imageAspectRatio })` — פונקציה טהורה שמחזירה `{ columns, rows }`
- האלגוריתם: חיפוש ממצה של זוגות `(cols, rows)` שמינימייז ציון משוקלל:
  ```
  score = |cols/rows - aspectRatio| * RATIO_WEIGHT + |cols*rows - target|
  ```
- `MIN_AXIS = 2` — אין שורה/עמודה בודדת
- `RATIO_WEIGHT = 10` — היחס חשוב פי 10 ממספר חלקים מדויק

**2. תרחישי הבדיקות (לפי סדר כתיבתן ב-TDD)**

| # | תרחיש | תוצאה צפויה |
|---|-------|-------------|
| 1 | תמונה ריבועית, 4 חלקים | 2×2 |
| 2 | תמונה רחבה (3:2), 6 חלקים | 3×2 |
| 3 | תמונה אנכית (2:3), 6 חלקים | 2×3 |
| 4 | תמונה רחבה מאוד (16:9), 4 חלקים | 3×2 (יחס מועדף על מספר חלקים) |
| 5 | מינימום 2×2 גם עם targetPieceCount=2 | columns ≥ 2, rows ≥ 2 |
| 6 | לא חורג הרבה ממספר החלקים | total בין 4 ל-8 ל-target=6 |

**3. אינטגרציה (`PuzzleCanvas.svelte`)**

- אחרי `img.onload`, מחושב `imageAspectRatio = img.naturalWidth / img.naturalHeight`
- אם `settings.adaptGridToImage` דלוקה, `grid.columns/rows` מוחלפים בתוצאת `adaptGridToImage()`
- אם ההגדרה כבויה, התנהגות זהה לקודם (תאימות לאחור)

**4. הגדרה חדשה (`types.ts`, `settings.svelte.ts`)**

- `adaptGridToImage: boolean` — ברירת מחדל `false` (תאימות לאחור)
- מיגרציה לסכמה `v6`, עם טעינה/שמירה/reset

**5. UI הגדרות (`settings/+page.svelte`)**

- toggle חדש "התאם grid לתמונה" עם תיאור הסבר

#### החלטות ארכיטקטורה

- **TDD בגישת Vertical Slicing**: כל בדיקה נכתבה ראשונה (RED), אומתה שהיא נכשלת, ואז נוסף הקוד המינימלי שעובר אותה (GREEN). זה גרם לאלגוריתם להתפתח אינקרמנטלית מ"return constant" לציון משוקלל מלא
- **פונקציה טהורה במודול נפרד**: `adaptGridToImage` היא פונקציה pure ללא צד-effects. זה מאפשר בדיקות מהירות ב-Node (server tests) בלי DOM/canvas, ואת השילוב עם הקוד הקיים ב-PuzzleCanvas
- **חיפוש ממצה (brute force)**: עבור `targetPieceCount` עד ~36 (6×6), ה-O(n²) זניח. אין צורך באלגוריתם חכם יותר
- **משקל יחס > מספר חלקים**: `RATIO_WEIGHT = 10` מבטיח שתמונה רחבה תקבל grid רחב גם אם המשמעות היא 2 חלקים נוספים. תלמיד לא יבחין במעבר מ-4 ל-6 חלקים, אבל יבחין מאוד בחלקים מעוותים

#### בדיקות שבוצעו

- 6 unit tests ב-`adaptive-grid.test.ts` עברו ✅
- `bun run check` עבר ללא שגיאות בקבצי הפרויקט שלנו
- `bun run build` עבר בהצלחה

#### תוכנית להמשך (שלבים 2-3)

- **שלב 2**: סידור הגדרות לקטגוריות (UI refactor)
- **שלב 3**: מערכת פרופילים (`activeProfile: beginner | intermediate | advanced | custom`)

## 2026-04-30 13:54

### version-2 — כפתור סידור מחדש + תיקון Z-index בלחיצה

נוספו שני שיפורים בחוויית המשחק: כפתור "סידור מחדש" שמחזיר חלקים בודדים למיקום ההתחלתי, ותיקון התנהגות ה-z-index כך שלחיצה על חלק תעלה אותו מעל כל החלקים האחרים.

#### מה בוצע?

**1. תיקון Z-index בלחיצה (`puzzle-interaction.ts`)**

- ב-`onPointerDown` המתבצעת על חלק: `puzzle.zIndexSup += 1` לפני שמיוחס לחלק
- כתוצאה מכך, כל לחיצה על חלק מקפיצה אותו מעל כל לחיצה קודמת
- לפני: `zIndexSup` היה ערך קבוע אחרי `evaluateZIndex()`, וכמה חלקים יכלו לקבל את אותו ה-z-index ולא להישאר זה מעל זה

**2. מתודות סידור מחדש (`puzzle.ts`)**

- `rearrangeUnconnected()` — מסדרת רק PolyPieces בודדים (קבוצה של חלק אחד) ומשאירה קבוצות שכבר חוברו במקומן
- `compactSinglesOnly(singles)` — סידור singles ב-grid (במצב מסודר), משכפל את הלוגיקה של `compactInitial` רק על תת-קבוצה
- `scatterSinglesToMargins(singles)` — פיזור singles לשוליים, מנסה למקם מחוץ לאזור התמונה

**3. כפתור סידור מחדש בממשק (`game/+page.svelte`, `PuzzleCanvas.svelte`)**

- ב-`PuzzleCanvas.svelte`: נוסף `export function rearrange()` שקורא ל-`puzzle.rearrangeUnconnected()`
- ב-`game/+page.svelte`: נוסף כפתור עגול עם אייקון refresh ליד שם הפאזל
- שונה ה-wrapper של הכותרת מ-`pointer-events-none` כללי לכותרת ולמונה החלקים בלבד, והכפתור עצמו `pointer-events-auto`

**4. הגדרה חדשה (`types.ts`, `settings.svelte.ts`)**

- נוסף `showRearrangeButton: boolean` ל-`TeacherSettings` (ברירת מחדל: `true`)
- מיגרציה לסכמה `v5`, עם טעינה/שמירה/reset

**5. UI הגדרות (`settings/+page.svelte`)**

- toggle חדש "כפתור סידור מחדש" עם תיאור: "מציג כפתור ליד שם הפאזל שמסדר מחדש את החלקים שלא חוברו"

**6. תיעוד פיצ'רים עתידיים (`docs/future-features.md`)**

- נוצר קובץ חדש שמרכז 3 רעיונות לעתיד: חלקים מחוברים מראש, תמונה במרכז, חלק עוגן
- כולל הצעת איחוד לכדי `startingDifficulty` אחד וסדר עבודה מומלץ

#### החלטות ארכיטקטורה

- **`zIndexSup` כמונה עולה במקום ערך קבוע**: גישה פשוטה ויעילה — כל לחיצה מעלה את המונה ב-1, כך שאין צורך לחשב מחדש את כל ה-z-indices. אין סכנה גם לאחר אלפי לחיצות (Number.MAX_SAFE_INTEGER גדול מספיק)
- **API דרך `bind:this` במקום store/context**: ב-Svelte 5, חשיפת `export function rearrange()` מקומפוננטה ל-parent דרך `bind:this` היא הדרך הנקייה ביותר. הקומפוננטה שומרת על ה-state שלה, וה-parent מפעיל פקודות דרך API מוגדר
- **`pointer-events-auto` נקודתי על הכפתור**: לא להפוך את כל ה-overlay ל-`pointer-events-auto` כדי לא לחסום אינטראקציה עם הקנבס מתחת

#### בדיקות שבוצעו

- בדיקה ידנית עם Playwright:
  - לחיצה על כפתור הסידור מחדש מזיזה את החלקים למיקומים חדשים
  - z-index של חלקים שלוחצים עליהם עולה ברצף (10→13→15→16)
  - הכותרת ומונה החלקים נשארים `pointer-events-none` והקנבס מתחתם רגיש לאינטראקציה

## 2026-04-27 13:28

### version-2 — מצב נעילה לתלמידים והסתרת כפתור הבית

נוסף מצב נעילה פשוט לתלמידים שמסתיר את כפתור הבית בזמן משחק, כדי למנוע יציאה לא מכוונת מהפאזל.

#### מה בוצע?

**1. הגדרה חדשה (`types.ts`, `settings.svelte.ts`)**

- נוסף `studentLockMode: boolean` ל-`TeacherSettings`
- ברירת המחדל הוגדרה ל-`false`
- ה-store עודכן עם טעינה, שמירה, `reset()` ומיגרציה לסכמה `v4`

**2. ממשק הגדרות (`settings/+page.svelte`)**

- נוסף toggle חדש: `מצב נעילה לתלמידים`
- התיאור שנוסף: `מסתיר את כפתור הבית העליון בזמן המשחק`
- ה-toggle מוקם ליד מצב מתחילים כי שניהם נוגעים להתאמת הממשק לתלמידים

**3. בר עליון (`HeaderBar.svelte`)**

- נוסף שימוש ב-`settings.studentLockMode`
- כפתור הבית מוסתר בזמן משחק כשהנעילה פעילה
- במסך הבית הכפתור נשאר רגיל
- נוסף spacer קבוע במקום הכפתור כדי לשמור על היישור של האינדיקציה במרכז

#### החלטות ארכיטקטורה

- **הסתרה במקום `disabled`**: נבחר להסתיר את כפתור הבית במקום להשאיר אותו מנוטרל, כדי לא להזמין לחיצות מיותרות מתלמידים שלוחצים על כל כפתור זמין
- **שם כללי `studentLockMode`**: נבחר שם כללי ולא `disableHomeButton`, כדי לאפשר בעתיד להרחיב את מצב הנעילה גם לעוד רכיבי ממשק בלי לשנות שוב את מודל ההגדרות

#### מעקפים ופתרונות

- **Spacer במקום כפתור**: במקום להסיר את האלמנט בלי תחליף, נוסף placeholder בגודל הכפתור כדי למנוע תזוזה של מונה החלקים והפאזלים במרכז ה-header

## 2026-04-27 10:39

### version-2 — מצב מתחילים + הגדרת ערבוב חלקים

הוספת מצב מתחילים (ללא zoom/pan, הגבלת grid עד 3x3) והגדרה נפרדת לסידור חלקים במיקום קבוע על המסך.

#### מה בוצע?

**1. הגדרות חדשות (`types.ts`, `settings.svelte.ts`)**

- `beginnerMode: boolean` — מצב מתחילים: חוסם zoom/pan/pinch, מגביל grid עד 3x3
- `shufflePiecePlacement: boolean` — ערבוב מיקום חלקים (true=מפוזרים, false=מסודרים בשורה)
- `BEGINNER_MAX_GRID_INDEX = 3` — הגבלת grid במצב מתחילים
- `setBeginnerMode()` — מפעיל מצב מתחילים וגם מכבה ערבוב אוטומטית
- מיגרציה לסכמה v3

**2. לייאאוט חלקים מסודר (`puzzle.ts`)**

- `computeBeginnerDimensions()` — binary search לגודל חלק מקסימלי שמכניס תמונה + tray למסך
- `compactInitial()` — סידור חלקים ב-grid קומפקטי לפי מיקומם המקורי בתמונה
- לייאאוט אוטומטי: פורטרייט (שורות למטה) / לנדסקייפ (עמודות משמאל)
- `handleResize()` — שימור סידור קומפקטי אחרי שינוי גודל חלון
- `organizedStart` מחליף את `beginnerMode` ב-Puzzle — הפרדת לוגיקת layout מ-zoom

**3. חסימת zoom/pan (`puzzle-interaction.ts`)**

- `beginnerMode` flag חוסם: wheel zoom, pinch zoom, pan, double-tap reset
- גרירת חלקים + merge נשארים פעילים

**4. UI הגדרות (`settings/+page.svelte`, `+page.svelte`)**

- toggle "מצב מתחילים" (מובלט בצהוב) בראש דף ההגדרות
- toggle "ערבוב חלקים" — נפרד ועצמאי
- כפתורי grid מעל 3x3 מושבתים במצב מתחילים (בהגדרות ובדף הבית)

**5. תיקון SSR (`settings.svelte.ts`)**

- תוקנה בדיקת localStorage: `typeof globalThis?.localStorage?.getItem === "function"` במקום `typeof globalThis?.localStorage !== "undefined"` — פותר crash ב-Node.js SSR עם `--localstorage-file` שבור

**6. Cloudflare Pages deploy**

- נוצר פרויקט Pages חדש `puzzle-game` עם branch deploy ל-`dev`
- URL: `https://dev.puzzle-game-92p.pages.dev`

#### החלטות ארכיטקטורה

- **הפרדת `organizedStart` מ-`beginnerMode`**: `Puzzle` משתמש ב-`organizedStart` (לייאאוט) ו-`PuzzleInteraction` משתמש ב-`beginnerMode` (zoom/pan). שתי הגדרות נפרדות: מורה יכול לכבות ערבוב בלי לחסום zoom
- **Binary search ל-sizing**: חיפוש בינארי על גובה חלק (30 איטרציות) מוצא את הגודל המקסימלי שמכניס תמונה + tray למסך. מטפל נכון בכל aspect ratio ובכל גודל מסך
- **Gap דינמי (60% מגודל חלק)**: מונע חפיפה ויזואלית של בליטות בין חלקים סמוכים

#### מעקפים ופתרונות

- **מיון column-major בלנדסקייפ**: בלנדסקייפ החלקים מסודרים בעמודות (column-major) אבל המיון המקורי היה row-major, מה שגרם לטרנספוזיציה — חלקים התחלפו. התיקון: מיון לפי `kx` ראשון בלנדסקייפ, `ky` ראשון בפורטרייט
- **handleResize דורס compactInitial**: אירוע resize אחרי init (נפוץ במובייל) הריץ מיקום פרופורציונלי שהרס את הסידור. התיקון: `handleResize` מזהה `organizedStart` ומריץ `compactInitial()` מחדש

## 2026-03-17 10:00

### version-2 — שיפור גרירת תמונת עזר: snap לצלע + תיקון חפיפה עם header

עדכון מנגנון הגרירה ב-`ImagePreview.svelte`: הוחלפה גרירה ל-4 פינות בגרירה חופשית לאורך כל אחת מ-4 הצלעות של המסך (snap לצלע הקרובה). תוקן גם מיקום הצלע העליונה.

#### מה בוצע?

**1. מעבר מ-4 פינות לגרירה לאורך כל הצלעות (`ImagePreview.svelte`)**

- הוחלף HTML5 Drag API ב-Pointer Events API (`pointerdown/move/up/cancel`) עם `setPointerCapture`
- המצב השתנה מ-`Corner` (4 פינות) ל-`EdgePosition { edge, offset }` — שומר צלע + היסט לאורכה
- ב-`pointerup`: חישוב הצלע הקרובה לפי `min(dTop, dBottom, dLeft, dRight)`, clamping ב-`[MARGIN, max-ELEM-MARGIN]`
- `positionStyle()` ממפה EdgePosition לסגנון CSS `fixed`
- localStorage: המפתח שונה מ-`"jigsaw-preview-corner"` ל-`"jigsaw-preview-edge-position"`

**2. תיקון חפיפה עם ה-header בצלע העליונה**

- `HEADER_H` הועלה מ-52 ל-72 (header `py-3` + button `p-2` + icon `h-6` + `shadow-md` ≈ 72px)
- `clampV` משתמש ב-`HEADER_H + MARGIN` כמינימום לצלעות שמאל/ימין כדי לשמור גם עליהן מחוץ לאזור ה-header

#### החלטות ארכיטקטורה

- **Pointer Events במקום HTML5 Drag**: HTML5 Drag API לא מאפשר מעקב מיקום חי בזמן הגרירה, ולא עובד טוב ב-touch. Pointer Events + `setPointerCapture` פותר את שניהם — מאפשר ghost מיקום (`isDragging`) ועובד על מובייל
- **`isPointerDown` flag**: `pointermove` מופעל גם על hover ללא לחיצה — הוספת flag מונעת הפעלת drag בטעות בריחוף בלבד

#### מעקפים ופתרונות

- **`HEADER_H` קבוע (72) ולא דינמי**: ניתן היה למדוד את ה-header ב-`onMount`, אך ה-header בגודל קבוע ידוע — קבוע פשוט מספיק ומונע תלות ב-DOM

## 2026-03-16 23:55

### version-2 — תיקונים ושיפורי UX: גרירת תמונת עזר, overlay, פרס, גריד 2×1

5 שיפורים: גרירת תמונת עזר ל-4 פינות, הסתרת "פאזל הבא" כשמגיע פרס, הסרת חסימת כפתורי ניווט על ידי overlays, הגדרה חדשה לכפתור "המשך לפאזל הבא", וגריד 2×1 (2 חלקים).

#### מה בוצע?

**1. גרירת תמונת עזר ל-4 פינות (`ImagePreview.svelte`)**

- הוספת drag & drop (HTML5 Drag API) לתמונת העזר הקטנה
- ב-`dragend`: חישוב פינה קרובה לפי `clientX/Y` ביחס למרכז המסך
- 4 פינות אפשריות: `top-left`, `top-right`, `bottom-left` (ברירת מחדל), `bottom-right`
- שמירת הפינה הנבחרת ב-localStorage תחת `"jigsaw-preview-corner"` — נזכר לאחר רענון
- הוספת cursor styles: `cursor-grab` / `cursor-grabbing`

**2. הסתרת "פאזל הבא" כשמגיע פרס (`game-state.svelte.ts`, `PuzzleComplete.svelte`)**

- נוסף getter `isRewardDue` ל-`GameStateStore` — בודק אם `winsSinceLastReward >= turnsPerReward`
- ב-`PuzzleComplete.svelte`: אחרי 5 שניות showcase, אם `isRewardDue` — מעבר אוטומטי ל-REWARD_TIME (ללא הצגת כפתור "פאזל הבא")
- כפתור "פאזל הבא" מוצג רק כשלא מגיע פרס: `!gameState.isRewardDue`

**3. הסרת חסימת כפתורי בית/הגדרות (`PuzzleComplete.svelte`)**

- כל div-י overlay שונו ל-`pointer-events-none`
- רק הכפתורים עצמם (`pointer-events-auto`) — HeaderBar נגיש בכל עת גם כשה-overlay פתוח

**4. הגדרה חדשה: כפתור "המשך לפאזל הבא" (`types.ts`, `settings.svelte.ts`, `settings/+page.svelte`, `PuzzleComplete.svelte`)**

- נוסף שדה `showContinueButton: boolean` להגדרות המורה (ברירת מחדל: `false`)
- כשמופעל: כפתור "🧩 המשך לפאזל הבא" מופיע ב-REWARD_TIME לצד "🎁 קבל פרס"
- הכפתור קורא ל-`gameState.skipReward()` — מאפס `winsSinceLastReward` ועובר לפאזל הבא

**5. גריד 2×1 (2 חלקים) (`types.ts`, `settings.svelte.ts`)**

- נוסף `{ columns: 2, rows: 1, label: "2×1" }` בתחילת `GRID_PRESETS`
- `DEFAULT_SETTINGS.gridPresetIndex` עודכן מ-0 ל-1 (שומר 2×2 כברירת מחדל)
- `CURRENT_VERSION` הועלה מ-1 ל-2 עם מיגרציה: טעינת הגדרות שמורות מ-v1 מגדיל `gridPresetIndex` ב-+1

**6. תיקון CSS import שבור (`layout.css`)**

- הוחזר `@import 'learn-booster-kit/styles'` (בלי `.css`) שתואם את exports map של החבילה
- הרצת `bun install` מהשורש לחיבור workspace package

#### החלטות ארכיטקטורה

- **HTML5 Drag API לגרירת פינות**: במקום Pointer Events מלאים, נבחר HTML5 drag כי המטרה היא snap לפינה — לא מעקב מיקום מדויק. `dragend` מספיק לחישוב פינה יעד
- **`isRewardDue` כ-getter ולא כ-Svelte store**: הערך מחושב מ-`winsSinceLastReward` (שהוא `$state`) ומ-booster config — getter מספיק, ה-reactivity של Svelte 5 מטפל בעדכון אוטומטי
- **`pointer-events-none` על overlays**: במקום העלאת z-index של ה-header, כל ה-overlays הפכו ל-`none` עם `pointer-events-auto` רק על כפתורי הפעולה — לא נדרשת שינוי ב-HeaderBar

#### מעקפים ופתרונות

- **מיגרציה של `gridPresetIndex`**: הוספת גריד 2×1 בתחילת המערך הזיזה את כל האינדקסים. מנגנון מיגרציה ב-`settings.svelte.ts` מגדיל ב-+1 בטעינה מגרסה 1 כדי לשמר הגדרות קיימות

## 2026-03-05 00:00

### version-2 — הוספת Zoom & Pan לפאזל

הוספת יכולת zoom ו-pan לפאזל: גלגלת עכבר בדסקטופ, צביטה (pinch) בטאצ', גרירת הלוח על אזור ריק, ודאבל-טאפ לאיפוס. הזום מאפשר התמקדות באזור מסוים בלוח ואף התרחקות לתצוגת-על.

#### מה בוצע?

**1. הוספת `piecesLayer` wrapper ב-`puzzle.ts`**

- property חדש `piecesLayer: HTMLDivElement` — div פנימי בתוך הקונטיינר
- נוצר ב-constructor עם `position: absolute; inset: 0; transform-origin: 0 0`
- כל canvas של חלק מצורף ל-`piecesLayer` (במקום ל-`container`)
- ה-`gameCanvas` הנסתר נשאר מחוץ ל-wrapper (ב-`container` ישירות)
- `destroy()` מנקה גם את ה-wrapper
- `handleResize()` מאפס את ה-transform של ה-wrapper

**2. עדכון `polypiece.ts`**

- `puzzle.container.appendChild` → `puzzle.piecesLayer.appendChild`
- `puzzle.container.removeChild` → `puzzle.piecesLayer.removeChild` (ב-merge)

**3. שכתוב `puzzle-interaction.ts` — zoom/pan מלא**

- **Wheel zoom (דסקטופ)**: גלגלת עכבר, זום ×1.1 לכל גלגול לכיוון מיקום הסמן
- **Pinch zoom (טאצ')**: מעקב אחרי 2 פוינטרים, זום יחסי לפי שינוי מרחק, מרכז הצביטה נשאר קבוע
- **Pan**: גרירה על אזור ריק מזיזה את כל הלוח
- **Double-tap reset**: דאבל-טאפ/קליק על אזור ריק (בתוך 300ms) → איפוס ל-scale=1, pan=0
- **תרגום קואורדינטות**: `toPuzzleCoords` מחלק ב-scale ומחסיר pan לפני hit-testing ו-drag
- **Clamp**: הלוח לא יכול לצאת לחלוטין מהמסך — שומר לפחות 20% גלוי

**4. עדכון `PuzzleCanvas.svelte`**

- `handleResize` קורא `interaction?.resetZoom()` לפני `puzzle?.handleResize()`

#### גבולות זום

- **התרחקות**: עד `MIN_SCALE = 0.3` (30% — תצוגת-על)
- **התקרבות**: עד `MAX_SCALE = 3` (300%)

#### החלטות ארכיטקטורה

- **CSS Transform על wrapper במקום שינוי ה-engine**: הגישה הכי נקייה — לא משנה את לוגיקת הציור, המיזוג, ה-snap, וה-hit-testing (שנשאר ביחידות פאזל). שכבת הזום נפרדת לחלוטין מה-engine
- **`transform-origin: 0 0`**: מפשט את חישובי ה-pan — `panX/panY` מייצגים היסט מוחלט מהפינה שמאל-עליונה

#### מעקפים ופתרונות

- **Hit-testing בזום**: `isPointInPath` עובד בקואורדינטות הפאזל הפנימיות — `toPuzzleCoords` מחשב `(screenX - panX) / scale` לפני העברה ל-hitTest. הגרירה עובדת זהה כי גם anchor וגם מיקום נוכחי מתורגמים באותו אופן, כך שהדלתא שמרה
- **Pinch vs drag**: אצבע שנייה שיורדת מבטלת מיידית drag/pan קיים ועוברת ל-pinch mode. כשאצבע אחת עולה מ-pinch, `pinchStartDist` מאופס ולא מתחיל drag חדש מהאצבע הנשארת

## 2026-03-04 19:00

### version-2 — תיקון באגים מ-PR review (#6)

תיקון באגים שזוהו כמוצדקים מתוך הערות בוטים (cursor, chatgpt-codex) על PR #6. חלק מההערות נפסלו לאחר בחינה ביקורתית מול הקוד.

#### מה בוצע?

**1. תיקון image error תוקע ב-LOADING**

- בעיה: `img.onerror` ב-PuzzleCanvas רק הדפיס log ולא שינה phase — המשתמש נתקע
- תיקון: `onerror` קורא `gameState.advanceToNextImage()` כדי לדלג לתמונה הבאה
- `advanceToNextImage` הפך ל-public ב-game-state

**2. תיקון piece counter קוסמטי**

- בעיה: N חלקים דורשים N-1 merges, אז ה-counter הציג 8/9 במקום מלא. בנוסף, cascade merge (drop שמחבר כמה קבוצות) ספר רק +1
- תיקון: `totalPieces` = N-1, `checkMerge` סופר merges ומעביר count ל-`notifyPieceConnected(count)`
- שינוי signature ב-4 קבצים: puzzle-interaction.ts, puzzle.ts, game-state.svelte.ts, PuzzleCanvas.svelte
- הערה: ה-win check מבוסס על `polyPieces.length === 1` ולא על ה-counter, אז המשחק עצמו עבד גם לפני

**3. Guard נגד רקורסיה אינסופית ב-loadPuzzle**

- בעיה: אם `imageQueue` ריק, `loadPuzzle` קרא לעצמו אינסופית → stack overflow
- תיקון: guard בתחילת הפונקציה שבודק `imageQueue.length === 0` ומחזיר ל-INIT

**4. תיקון scatter offset**

- בעיה: `optimInitial` חישב scatter rects בלי `offsx`/`offsy`, מה שגרם לחפיפה קלה עם אזור התמונה הממורכזת
- תיקון: הוספת offset לכל ה-rects שמתייחסים ל-`gameWidth`/`gameHeight` כקואורדינטה

#### הערות שנפסלו מה-PR

- **snap distance override לא עובד** — לא נכון, ה-override כבר קורה אחרי `init()` מתיקון קודם
- **double init ב-mount** — לא נכון, `onMount` רק רושם resize listener, כבר תוקן קודם
- **shuffle כפולה** — הגרסה ב-game-state מחזירה copy (immutable), בעוד `arrayShuffle` עובד in-place — ההפרדה מוצדקת
- **`.vscode/settings.json` מסוכן ב-repo** — הקובץ מכיל רק `files.associations` ל-Tailwind, לגיטימי לגמרי

## 2026-03-04 17:30

### version-2 — מנוע פאזל חדש מבוסס Canvas + תיקוני UI ומגנטיות

מנוע פאזל חדש לחלוטין (version-2) שמחליף את headbreaker בפתרון מבוסס Canvas טהור, בהשראת פרויקט codeaashu. כולל יצירת צורות Bezier דינמיות, drag & drop ישיר על Canvas, מערכת snap/connect, ו-emboss styling. לאחר הבנייה תוקנו באגים: חלקים כפולים, גודל חלקים, רקע, layout, ומגנטיות.

#### מה בוצע?

**1. מנוע פאזל חדש (`src/lib/puzzle/`)**

- `puzzle.ts` — מחלקה ראשית: יצירת grid, חישוב scaling דינמי, פיזור חלקים ל-margins (optimInitial), ניהול z-index
- `piece.ts` — חלק בודד ברשת: שמירת מיקום grid, edges עם Bezier curves, twist functions
- `polypiece.ts` — קבוצת חלקים מחוברים: drag, snap detection (ifNear), contour tracing (wall-following), ציור על canvas נפרד
- `math.ts` — Point class, alea PRNG, shuffle, Bezier utilities
- `twists.ts` — 3 סגנונות צורה: classic, wave, diamond — כל אחד עם twist function שמגדירה את עקומות ה-Bezier של קצוות החלקים
- `interaction.ts` — ניהול אירועי mouse/touch: mousedown על חלק, drag, snap check ב-mouseup

**2. תיקון באג כפל חלקים**

- `loadCurrentPuzzle()` נקרא פעמיים: ב-`onMount` וגם ב-`$effect` שעוקב אחרי `gameState.phase === "LOADING"`
- תוקן: הוסר הקריאה מ-`onMount`, נשאר רק ה-`$effect`
- תוצאה: מספר canvas elements ירד מ-10 ל-5 (עבור 2×2)

**3. תיקון גודל חלקים דינמי**

- בעיה: `maxWidth = 0.95 * contWidth` — כל חלק ~50% מהמסך ב-2×2, לא נשאר מקום לפיזור
- פתרון: `maxPieceFraction = 0.20` — כל חלק עד 20% מה-container
- נוסחה: `maxFactor = min(0.95, max(0.30, min(0.20*nx, 0.20*ny)))`
- תוצאות: 2×2→0.40, 3×3→0.60, 4×4→0.80, 6×6→0.95

**4. תיקוני UI**

- הסרת `background-color: #fff1e7` מ-PuzzleCanvas — הרקע יורש gradient מהלייאוט (`bg-linear-to-b from-sky-100 via-blue-50 to-indigo-100`)
- הכותרת (שם התמונה) הפכה ל-`absolute` עם `pointer-events-none` — צפה מעל ה-canvas בלי לתפוס מקום בלייאוט
- Canvas wrapper שונה ל-`absolute inset-0` לכיסוי מלא
- ImagePreview הוגדל: collapsed 64→80px, expanded 192×144→224×176px

**5. תיקון מגנטיות (snap distance)**

- בעיה: הגדרת proximity בסליידר לא השפיעה — ה-override של `dConnect` בוצע **לפני** `puzzle.init()`, ו-`scale()` דרס אותו
- תיקון: הזזת `puzzle.dConnect = ...` ל**אחרי** `puzzle.init()`
- הסרת `snapDistance` מהאופציות (לא נקרא ב-constructor)

#### החלטות ארכיטקטורה

- **מנוע Canvas עצמאי במקום headbreaker**: headbreaker v3 הגביל שליטה ב-outline, API לא מתועד, וחלקים נראו גסים. המנוע החדש מבוסס על codeaashu עם שליטה מלאה ב-Bezier curves, canvas-per-piece, ו-emboss effects
- **Canvas per piece (PolyPiece)**: כל קבוצת חלקים מצוירת על canvas נפרד — מאפשר drag חלק בלי לצייר מחדש את כל הפאזל, וביצועים טובים
- **Dynamic maxFactor**: במקום ערך קבוע (0.95), הנוסחה מתאימה את גודל החלקים לגודל הגריד — גרידים קטנים מקבלים חלקים קטנים עם הרבה מרווח לפיזור

#### מעקפים ופתרונות

- **dConnect override timing**: ב-Svelte 5, `$effect` רץ אחרי mount, כך שה-puzzle נוצר ב-effect. ה-override חייב להיות אחרי `init()` כי `scale()` מאפס את `dConnect`. סדר: `new Puzzle()` → `init()` → override `dConnect`
- **Chromium system dependencies**: הרצת Playwright ב-container Linux דרשה התקנה ידנית של ~12 ספריות מערכת (libnss3, libgbm1, libxfixes3 וכו')

## 2026-03-02 00:00

### ארגון מחדש ל-version-1, ביטול זמני smooth-outline, תיקון outline.draw

ארגון קבצי האפליקציה לתיקיית `version-1`, ביטול זמני של `SmoothOutline` לצרכי יציבות מיידית, ותיקון שגיאת `outline.draw is not a function`.

#### מה בוצע?

**1. ארגון קבצים**

- כל קבצי האפליקציה הועברו מ-`apps/jigsaw-puzzle-game/src/` לתוך `apps/jigsaw-puzzle-game/version-1/`
- מאפשר מקום לגרסאות עתידיות תחת אותה תיקיית אפליקציה

**2. ביטול זמני של SmoothOutline**

- `SmoothOutline` (מ-`smooth-outline.ts`) לא הצליח לרוץ — גרם לכשלון יצירת הפאזל
- ה-import הוסתר בהערה, הוחלף ב-`new headbreaker.outline.Rounded()`

**3. תיקון `outline.draw is not a function`**

- לאחר ההחלפה, התגלה שגיאה נוספת: `headbreaker.outline.Rounded` (ללא `new`) מחזיר class constructor ולא instance
- headbreaker מצפה לאובייקט עם method `draw` — תוקן ל-`new headbreaker.outline.Rounded()`

#### מעקפים ופתרונות

- **SmoothOutline מנותק זמנית**: ה-import מוסתר בהערה ב-`puzzle-engine.ts`. לחיבור מחדש — להסיר את ה-comment משורה 19 ולשחזר את שורה 60 ל-`new SmoothOutline()`
- **`headbreaker.outline.Classic` לא דורש `new`** (כנראה instance סטטי), אבל `Rounded` כן דורש — ייתכן אי-עקביות בתוך ה-API של headbreaker

## 2026-02-26 23:45

### CDN, תיקון חיבורים, showcase סיום פאזל, ו-outline מותאם

שילוב R2 bucket עם CDN לניהול מדיה, תיקון לוגיקת חיבור חלקים שגויים, הצגת פאזל מושלם 5 שניות לפני מעבר, ושיפור outline חלקים.

#### מה בוצע?

**1. תשתית CDN — Cloudflare R2**

- יצירת bucket `tzlev-static` עם דומיין מותאם `static.tzlev.ovh`
- מבנה היררכי: `shared/sounds/` (משותף לכל המשחקים), `apps/learn-games/jigsaw-puzzle-game/images/` (ספציפי)
- תיקיית `assets/` בשורש המונורפו — mirror של ה-bucket
- סקריפט `scripts/sync-assets.js` — סנכרון חכם עם hash-based change detection (MD5)
- הגדרת CORS על ה-bucket + cache-bust עם `?v1` parameter
- `config.ts` חדש — STATIC_BASE_URL, SHARED_URL, APP_ASSETS_URL, asset()
- עדכון `image-packs.ts` ו-`sound.ts` לשימוש ב-CDN URLs

**2. תמונות פאזל**

- הורדת 3 תמונות חיות מ-Pexels (רישיון חופשי): חתול, כלב, דג
- העלאה ל-R2 + צלילי snap.mp3 ו-success.mp3 לתיקייה משותפת

**3. תיקון חיבור חלקים שגויים**

- `attachConnectionRequirement` — בדיקה שחלקים שמנסים להתחבר הם שכנים אמיתיים ברשת
- השוואת `targetPosition` של שני חלקים: הפרש של בדיוק `pieceSize` בציר אחד ו-~0 בשני
- tolerance של 15% מגודל החלק

**4. Showcase סיום פאזל**

- הפאזל המושלם מוצג 5 שניות עם באנר חגיגה שקוף (לא מסתיר את הפאזל)
- ה-canvas נשאר גלוי במצב PUZZLE_COMPLETE
- במצב `continuous` — מעבר אוטומטי אחרי 5 שניות
- במצב `manual_end` — כפתור "פאזל הבא" מופיע אחרי 5 שניות

**5. Outline — ניסיונות שיפור (WIP)**

- הפעלת פרמטרים של `outline.Rounded`: `bezelize: true`, `bezelDepth: 0.3`, `insertDepth: 0.7`, `borderLength: 0.25`
- התוצאה עדיין לא מספקת — החלקים נראים גסים/זוויתיים
- זוהתה הבעיה: headbreaker מייצר פוליגון עם מעט נקודות, ו-`lineSoftness` מתעלם במצב bezier
- מתוכנן: Outline class מותאם עם עקומות חלקות וגיוון צורות בין חלקים

#### החלטות ארכיטקטורה

- **R2 bucket משותף (`tzlev-static`)**: במקום bucket לכל משחק — bucket אחד עם היררכיה. מאפשר שימוש חוזר בצלילים/תמונות בין משחקים
- **Cache-bust עם query parameter**: במקום purge API (OAuth token לא תומך) — גרסה `?v1` בכל URL דרך `asset()` function
- **Grid-neighbor validation**: headbreaker מחבר כל חלק עם Tab-Slot תואם שקרוב, גם אם לא שכנים. הפתרון — `attachConnectionRequirement` שבודק targetPosition

#### מעקפים ופתרונות

- **CORS על R2**: פורמט JSON ספציפי נדרש: `{"rules":[{"allowed":{"origins":["*"],"methods":["GET","HEAD"],"headers":["content-type"]}}]}` — לא `allowedOrigins` אלא `allowed.origins`
- **Cache ללא CORS headers**: Cloudflare שמר responses ישנים בלי CORS. לא ניתן לנקות cache עם wrangler OAuth. פתרון: cache-bust עם `?v1`
- **headbreaker Rounded + bezier מתעלם מ-tension**: כש-`isBezier()` מחזיר true, konva-painter מגדיר `tension: null`. הנקודות גם לא בפורמט bezier תקין של Konva. צריך outline מותאם או post-processing

## 2026-02-26 21:10

### גרסה ראשונית — משחק פאזל (jigsaw) עם headbreaker

אפליקציית SvelteKit חדשה למשחק פאזל עם ספריית headbreaker v3, כולל אינטגרציה מלאה עם learn-booster-kit.

#### מה בוצע?

**1. תשתית**

- שלד פרויקט SvelteKit חדש: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `wrangler.jsonc`
- Tailwind CSS v4 עם `@tailwindcss/vite`
- adapter-cloudflare לפריסה
- SSR כבוי בדף משחק (`export const ssr = false`) — headbreaker דורש DOM

**2. טיפוסים ומודל נתונים**

- `types.ts` — GamePhase (INIT→LOADING→PLAYING→PIECE_FEEDBACK→PUZZLE_COMPLETE→REWARD_TIME), OutlineStyle, PieceFilter, GridConfig, TeacherSettings
- 7 presets לגודל רשת: 2×2 עד 6×6
- `image-packs.ts` — חבילת "חיות" עם 3 תמונות (placeholder URLs)

**3. Stores**

- `settings.svelte.ts` — singleton store עם localStorage, דפוס זהה ל-sort-cards-game
- `game-state.svelte.ts` — מכונת מצבים מלאה עם תמיכה ב-reward flow

**4. מנוע פאזל (puzzle-engine.ts)**

- wrapper ל-headbreaker v3 — createPuzzle / destroyPuzzle
- תמיכה בשני סגנונות outline: rounded (קלאסי) ו-squared (מרובע פשוט)
- הגדרת proximity (רגישות snap) דינמית
- אפשרות allowDisconnect — חסימה/שחרור פירוק חלקים מחוברים
- סינון pieceFilter: "border_only" — חלקי פנים במקומם, רק מסגרת לגרירה

**5. ממשק משתמש**

- `HeaderBar` — סרגל עליון עם מונה חלקים ופאזלים, AdminGate להגדרות
- דף בית — בחירת חבילת תמונות + גודל רשת + כפתור "התחל"
- `PuzzleCanvas` — wrapper ל-headbreaker canvas עם טעינת תמונה דינמית
- `FeedbackOverlay` — אנימציית הבהוב + צליל snap בחיבור חלק
- `PuzzleComplete` — מסך סיום + reward (ידני/אוטומטי)
- `ImagePreview` — תמונת עזר ניתנת להרחבה
- דף הגדרות מלא כולל booster section

**6. אינטגרציה עם learn-booster-kit**

- boosterService, ProgressWidget, AdminGate, BoosterContainer, OverlayTimerPage
- OverlayTimerSettings בדף הגדרות
- reward flow מלא: ספירת פאזלים → triggerReward → completeReward

#### החלטות ארכיטקטורה

- **headbreaker v3 (לא v0.7)**: גרסה 0.7 לא קיימת ב-npm, v3 היא המקורית והיחידה הזמינה. CommonJS עם painters.Konva
- **declare module נפרד**: `headbreaker.d.ts` נפרד מ-`app.d.ts` — כי app.d.ts הוא module file (מכיל `export {}`) ו-`declare module` בתוכו מתפרש כ-augmentation ולא כ-ambient declaration
- **ReturnType<typeof createPuzzle>**: במקום import type של headbreaker — כי ה-module מוגדר כ-any
- **מבנה (app) route group**: HeaderBar + BoosterContainer ב-layout, overlay-timer מחוץ ל-group — זהה ל-sort-cards-game

#### מעקפים ופתרונות

- **headbreaker v3 API**: אין תיעוד רשמי עדכני. קראנו את קוד המקור (canvas.js, outline.js, puzzle.js, drag-mode.js) כדי להבין את ה-API: callback של onConnect מקבל (piece, figure, targetPiece, targetFigure), outline.Classic הוא instance ולא constructor, זיהוי חלקי מסגרת דרך piece.up.isNone() וכו'
- **OverlayTimer files missing in worktree**: ה-worktree נוצר מ-commit ישן (2b78f9a). בוצע merge של main לקבלת קבצי OverlayTimerPage/Settings שנוספו ב-commit 81c57b4
