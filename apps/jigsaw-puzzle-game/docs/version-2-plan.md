# תוכנית version-2 — מנוע פאזל מבוסס codeaashu

## רקע

version-1 השתמש בספריית headbreaker + Konva. נתקלנו בבעיות ויזואליות בצורת החלקים
(ראה smooth-outline-analysis.md). version-2 מחליף את headbreaker במנוע עצמאי
מבוסס קוד codeaashu/Jigsaw-Puzzle-Game — vanilla Canvas עם Bezier curves אמיתיים,
4 סגנונות צורה, ורינדור ישיר ללא תלויות חיצוניות.

## מה נשמר מ-version-1

- אותה מערכת routes: בית, משחק, הגדרות, overlay-timer
- אותה מערכת settings (עם הרחבות)
- אותה state machine (GamePhase)
- אותה אינטגרציה עם learn-booster-kit
- אותם CDN URLs לתמונות וצלילים
- אותן חבילות תמונות
- אותו HeaderBar

## מה משתנה

1. **מנוע פאזל**: headbreaker + Konva → Canvas ישיר (מבוסס codeaashu)
2. **צורת חלקים**: Bezier curves אמיתיים עם 4 סגנונות (classic, triangle, round, straight)
3. **קנבס מלא מסך**: במקום div מוגבל (max-w-3xl, max-h-70vh) → Canvas שתופס את כל השטח מתחת להידר
4. **רינדור**: כל PolyPiece מקבל canvas משלו (DOM elements ממוקמים absolute)
5. **Emboss/shadow**: אפקט תלת-ממדי על קצוות החלקים
6. **פיזור חלקים**: אלגוריתם optimInitial — מפזר חלקים בשוליים סביב מרכז התמונה

---

## מבנה קבצים

```
version-2/src/
├── app.html                          (RTL Hebrew template)
├── app.d.ts                          (SvelteKit + Cloudflare types)
│
├── routes/
│   ├── +layout.svelte                (Root layout — CSS import)
│   ├── layout.css                    (Tailwind + @source learn-booster-kit)
│   │
│   ├── (app)/
│   │   ├── +layout.svelte            (App layout — HeaderBar + BoosterContainer)
│   │   │
│   │   ├── +page.svelte              (Home — בחירת חבילה + גודל + סגנון + התחל)
│   │   │
│   │   ├── game/
│   │   │   ├── +page.ts              (export const ssr = false)
│   │   │   ├── +page.svelte          (Game page — full-screen canvas + overlays)
│   │   │   ├── _components/
│   │   │   │   ├── PuzzleCanvas.svelte    (Canvas container — lifecycle)
│   │   │   │   ├── PuzzleComplete.svelte  (Completion overlay + reward)
│   │   │   │   ├── FeedbackOverlay.svelte (Sparkle on connect)
│   │   │   │   └── ImagePreview.svelte    (Reference image thumbnail)
│   │   │   └── _lib/
│   │   │       └── puzzle-interaction.ts  (Event handling: pick, drag, drop, merge)
│   │   │
│   │   └── settings/
│   │       └── +page.svelte          (Teacher settings)
│   │
│   └── overlay-timer/
│       └── +page.svelte              (Booster overlay timer)
│
├── lib/
│   ├── config.ts                     (CDN URLs — זהה ל-v1)
│   ├── types.ts                      (Types + TeacherSettings + GRID_PRESETS)
│   │
│   ├── components/
│   │   └── HeaderBar.svelte          (Shared header — home, stats, settings)
│   │
│   ├── stores/
│   │   ├── settings.svelte.ts        (TeacherSettings store + localStorage)
│   │   └── game-state.svelte.ts      (GamePhase state machine)
│   │
│   ├── data/
│   │   └── image-packs.ts            (Image pack definitions)
│   │
│   ├── utils/
│   │   ├── sound.ts                  (playSnap, playSuccess)
│   │   └── tts.ts                    (speak, speakComplete)
│   │
│   └── puzzle/                       (★ מנוע הפאזל — מבוסס codeaashu)
│       ├── math.ts                   (Point, Segment, alea, intAlea, arrayShuffle)
│       ├── side.ts                   (Side class — edge representation)
│       ├── twists.ts                 (twist0-twist3 — shape generators)
│       ├── piece.ts                  (Piece class — single grid cell)
│       ├── polypiece.ts              (PolyPiece — merged group, rendering, contour)
│       └── puzzle.ts                 (Puzzle class — grid, shapes, scaling, game state)
```

---

## פירוט מודולי הפאזל ($lib/puzzle/)

### math.ts — יסודות מתמטיים

```typescript
export class Point {
  x: number;
  y: number;
  constructor(x: number, y: number);
  copy(): Point;
  distance(other: Point): number;  // Math.hypot
}

export class Segment {
  p1: Point;
  p2: Point;
  constructor(p1: Point, p2: Point);  // deep copy
  dx(): number;
  dy(): number;
  length(): number;
  pointOnRelative(coeff: number): Point;  // linear interpolation
}

export function alea(min: number, max?: number): number;     // random float
export function intAlea(min: number, max?: number): number;  // random int
export function arrayShuffle<T>(arr: T[]): T[];              // Fisher-Yates in-place
```

### side.ts — צלע של חלק

```typescript
export class Side {
  type: "d" | "z";       // "d" = straight, "z" = bezier
  points: Point[];        // normalized coordinates
  scaledPoints: Point[];  // pixel coordinates

  reversed(): Side;       // reverse for shared edges
  scale(scalex: number, scaley: number): void;
  drawPath(ctx: CanvasRenderingContext2D | Path2D, shiftx: number, shifty: number, withoutMoveTo?: boolean): void;
}
```

### twists.ts — מחוללי צורת קצוות

```typescript
export type ShapeStyle = "classic" | "triangle" | "round" | "straight";

// classic — 6 Bezier curves, mushroom-shaped tab/slot
export function twist0(side: Side, seg0: Segment, seg1: Segment, ca: Point, cb: Point): void;
// triangle — degenerate Beziers forming angular protrusions
export function twist1(side: Side, seg0: Segment, seg1: Segment, ca: Point, cb: Point): void;
// round — single smooth curve bulge
export function twist2(side: Side, seg0: Segment, seg1: Segment, ca: Point, cb: Point): void;
// straight — no modification (grid cuts)
export function twist3(side: Side, seg0: Segment, seg1: Segment, ca: Point, cb: Point): void;

export function getTwistByStyle(style: ShapeStyle): TwistFunction;
```

### piece.ts — חלק בודד ברשת

```typescript
export class Piece {
  kx: number;   // column
  ky: number;   // row
  ts: Side;     // top    (left→right)
  rs: Side;     // right  (top→bottom)
  bs: Side;     // bottom (right→left)
  ls: Side;     // left   (bottom→top)

  scale(scalex: number, scaley: number): void;
}
```

### polypiece.ts — קבוצת חלקים ממוזגת

```typescript
export class PolyPiece {
  pieces: Piece[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  path: Path2D;           // composite outline for hit testing

  // bounding box (grid coords)
  pckxmin: number; pckxmax: number;
  pckymin: number; pckymax: number;

  // position (pixels)
  x: number; y: number;

  constructor(piece: Piece, puzzle: Puzzle);

  // Contour tracing — right-hand rule
  listLoops(): void;

  // Rendering pipeline: shadow → per-piece clip+blit → emboss
  drawImage(): void;

  // Proximity test for snap
  ifNear(other: PolyPiece): boolean;

  // Merge absorbed PolyPiece into this one
  merge(other: PolyPiece): void;

  // Move to position
  moveTo(x: number, y: number): void;
}
```

### puzzle.ts — מנוע הפאזל הראשי

```typescript
export interface PuzzleOptions {
  container: HTMLElement;
  image: HTMLImageElement;
  columns: number;
  rows: number;
  shapeStyle: ShapeStyle;
  snapDistance?: number;        // default: auto (10% of cell size)
  onPieceConnected?: () => void;
  onPuzzleSolved?: () => void;
}

export class Puzzle {
  container: HTMLElement;
  gameCanvas: HTMLCanvasElement;  // hidden source image canvas
  srcImage: HTMLImageElement;

  nx: number;      // columns
  ny: number;      // rows
  scalex: number;  // pixels per grid unit (horizontal)
  scaley: number;  // pixels per grid unit (vertical)

  pieces: Piece[][];         // grid [ky][kx]
  polyPieces: PolyPiece[];   // active groups
  dConnect: number;          // snap threshold

  shapeStyle: ShapeStyle;

  constructor(options: PuzzleOptions);

  // Build grid and shapes
  defineShapes(): void;

  // Compute pixel dimensions, render source image
  scale(): void;

  // Create all PolyPieces and add to DOM
  create(): void;

  // Scatter pieces to margins around the puzzle area
  optimInitial(): void;

  // Z-index management (larger groups → back)
  evaluateZIndex(): void;

  // Cleanup
  destroy(): void;
}
```

---

## puzzle-interaction.ts (route-level — game/_lib/)

לוגיקת אינטראקציה שספציפית לדף המשחק.
מקשר בין Puzzle class ל-Svelte component.

```typescript
export class PuzzleInteraction {
  private puzzle: Puzzle;
  private dragging: { pp: PolyPiece; anchorX: number; anchorY: number } | null;

  constructor(puzzle: Puzzle);

  // Register pointer events on container
  attach(): void;

  // Cleanup
  detach(): void;

  // Pointer handlers (unified mouse+touch)
  private onPointerDown(e: PointerEvent): void;
  private onPointerMove(e: PointerEvent): void;
  private onPointerUp(e: PointerEvent): void;

  // Hit test: isPointInPath on each PolyPiece's Path2D
  private hitTest(x: number, y: number): PolyPiece | null;

  // Cascade merge after drop
  private checkMerge(moved: PolyPiece): void;

  // Win check: polyPieces.length === 1
  private checkWin(): void;
}
```

---

## שינויים ב-types.ts

```typescript
// חדש — סגנון צורה (4 סוגים במקום 2)
export type ShapeStyle = "classic" | "triangle" | "round" | "straight";

// משתנה — TeacherSettings
export interface TeacherSettings {
  imagePackId: string;
  gridPresetIndex: number;
  shapeStyle: ShapeStyle;         // ← במקום outlineStyle
  proximity: number;              // snap distance (1-100, auto-mapped)
  allowDisconnect: boolean;       // (שמור — ייתכן שלא יהיה רלוונטי ב-v2 כרגע)
  showReferenceImage: boolean;
  pieceFilter: PieceFilter;
  shuffleImages: boolean;
  boosterEnabled: boolean;
  voiceEnabled: boolean;
  gameMode: "continuous" | "manual_end";
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  imagePackId: "animals",
  gridPresetIndex: 0,    // 2×2
  shapeStyle: "classic",  // ← default
  proximity: 30,
  allowDisconnect: true,
  showReferenceImage: true,
  pieceFilter: "all",
  shuffleImages: false,
  boosterEnabled: true,
  voiceEnabled: false,
  gameMode: "manual_end",
};

// GRID_PRESETS — ללא שינוי
export const GRID_PRESETS: GridConfig[] = [
  { columns: 2, rows: 2, label: "2×2" },
  { columns: 3, rows: 2, label: "3×2" },
  { columns: 3, rows: 3, label: "3×3" },
  { columns: 4, rows: 3, label: "4×3" },
  { columns: 4, rows: 4, label: "4×4" },
  { columns: 5, rows: 4, label: "5×4" },
  { columns: 6, rows: 6, label: "6×6" },
];
```

---

## PuzzleCanvas.svelte — שינויים עיקריים

### Layout: קנבס מלא מסך

```svelte
<!-- game/+page.svelte -->
<div class="relative flex flex-1 flex-col overflow-hidden">
  <!-- Header overlays (stats, image name) -->
  ...

  <!-- Full-screen puzzle canvas — fills all available space below header -->
  <div class="flex-1 relative min-h-0">
    <PuzzleCanvas />
  </div>
</div>
```

```svelte
<!-- PuzzleCanvas.svelte -->
<div
  bind:this={containerEl}
  class="absolute inset-0 overflow-hidden"
  style="background-color: #fff1e7;"
></div>
```

ה-container תופס 100% מהשטח הזמין. ה-Puzzle class מחשב את מידות הפאזל
ביחס ל-container (95% ממנו), ומפזר חלקים בשוליים.

### Lifecycle

```typescript
// On mount / phase=LOADING:
1. Destroy previous puzzle
2. Create new Image(), load from CDN
3. On image load:
   a. new Puzzle({ container, image, columns, rows, shapeStyle, ... })
   b. new PuzzleInteraction(puzzle) → attach events
   c. gameState.puzzleReady()

// On destroy:
1. interaction.detach()
2. puzzle.destroy()
```

---

## דף הגדרות — שינויים

### סגנון צורה (4 אופציות)

```svelte
<select bind:value={settings.shapeStyle}>
  <option value="classic">קלאסי (פטרייה)</option>
  <option value="triangle">משולש</option>
  <option value="round">עגול</option>
  <option value="straight">ישר (ללא חיבורים)</option>
</select>
```

### proximity — אותו slider

```
min=20, max=80, step=5, default=30
```

ב-Puzzle: `dConnect = max(10, min(scalex, scaley) * (proximity / 300))`
(ממפה 20-80 לטווח סביר ביחס לגודל חלק)

---

## סדר מימוש מומלץ

### שלב 1 — תשתית (מה שכבר קיים + העתקה)
1. העתקת קבצים משותפים מ-v1: config.ts, types.ts (עם שינויים), stores, data, utils
2. העתקת routes skeleton: layouts, home, settings, overlay-timer
3. התקנת dependencies: learn-booster-kit, tailwindcss
4. בדיקה שהאפליקציה עולה

### שלב 2 — מודולי פאזל (הליבה)
1. math.ts — Point, Segment, utilities
2. side.ts — Side class
3. twists.ts — twist0-twist3
4. piece.ts — Piece class
5. polypiece.ts — PolyPiece (rendering, contour, merge)
6. puzzle.ts — Puzzle class

### שלב 3 — אינטגרציה
1. puzzle-interaction.ts — pointer events, drag, merge, win
2. PuzzleCanvas.svelte — lifecycle, image loading
3. Game page + overlays
4. בדיקה ויזואלית

### שלב 4 — settings + polish
1. דף הגדרות עם 4 סגנונות צורה
2. proximity mapping
3. border_only filter
4. Reference image preview
5. Reward flow (booster integration)

---

## נקודות למעקב

- [ ] **allowDisconnect**: בקוד codeaashu אין מנגנון פירוק. ניתן להוסיף בעתיד (ע"י שבירת PolyPiece). כרגע ההגדרה תישמר אבל לא תהיה פעילה.
- [ ] **border_only filter**: צריך מימוש חדש — זיהוי חלקי מסגרת (צד אחד ישר) ומיקום חלקי פנים.
- [ ] **resize handling**: כשהחלון משתנה, צריך לחשב מחדש scale ולמקם מחדש את כל החלקים.
- [ ] **mobile optimization**: Pointer Events במקום mouse/touch נפרדים. preventDefault לגלילה.
- [ ] **performance**: אם יש הרבה חלקים (6×6 = 36), 36 canvas elements. זה בסדר. codeaashu תומך עד 200.
