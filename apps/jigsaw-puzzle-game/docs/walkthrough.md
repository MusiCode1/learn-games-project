# Jigsaw Puzzle Game — יומן פיתוח

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
