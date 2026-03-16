# Jigsaw Puzzle Game — יומן פיתוח

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
