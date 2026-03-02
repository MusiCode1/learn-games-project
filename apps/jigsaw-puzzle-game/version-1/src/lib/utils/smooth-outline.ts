/**
 * SmoothOutline — Outline מותאם ל-headbreaker עם עקומות חלקות וגיוון בין חלקים.
 *
 * headbreaker outline interface:
 * - draw(piece, size, borderFill) → number[]  (flat: [x1,y1, x2,y2, ...])
 * - isBezier() → boolean
 *
 * isBezier() מחזיר false כדי ש-Konva painter ישתמש ב-tension (lineSoftness)
 * להחלקה נוספת מעבר לדגימה הצפופה.
 */

// === Seeded PRNG (mulberry32) — deterministic per piece/side ===

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(x: number, y: number, side: number): number {
  return ((x * 73856093) ^ (y * 19349663) ^ (side * 83492791)) | 0;
}

// === Cubic Bezier ===

interface Point {
  x: number;
  y: number;
}

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
    y: u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y,
  };
}

function sampleBezier(p0: Point, p1: Point, p2: Point, p3: Point, samples: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= samples; i++) {
    pts.push(cubicBezier(p0, p1, p2, p3, i / samples));
  }
  return pts;
}

// === Tab/Slot shape generation ===

interface InsertParams {
  /** כיוון: 1 = tab (חוצה), -1 = slot (פנימה) */
  direction: 1 | -1;
  /** רוחב הבסיס של ה-insert */
  baseWidth: number;
  /** עומק ה-insert */
  depth: number;
  /** הסטה מהמרכז */
  offset: number;
  /** יחס רוחב הצוואר לרוחב הבסיס (0-1) */
  neckRatio: number;
  /** כמות דגימות per bezier curve */
  samples: number;
}

/**
 * מייצר נקודות של tab/slot לאורך ציר.
 * הנקודות מיוצרות במערכת מקומית:
 * - ציר x: לאורך קצה החלק (מ-0 ל-baseWidth)
 * - ציר y: לעומק (0 = קצה, חיובי = החוצה)
 * direction=1 → tab (חוצה), direction=-1 → slot (פנימה)
 */
function generateInsertPoints(params: InsertParams): Point[] {
  const { direction, baseWidth, depth, offset, neckRatio, samples } = params;
  const hw = baseWidth / 2; // חצי רוחב
  const d = depth * direction;
  const nw = hw * neckRatio; // חצי רוחב צוואר

  // מרכז ה-insert (עם offset)
  const cx = hw + offset;

  // Control points — 3 עקומות bezier שמרכיבות את צורת הפטרייה:
  // 1. עלייה מהבסיס שמאל לראש שמאל
  // 2. קשת הראש (למעלה)
  // 3. ירידה מהראש ימין לבסיס ימין

  // נקודות בסיס
  const baseLeft: Point = { x: cx - hw, y: 0 };
  const baseRight: Point = { x: cx + hw, y: 0 };

  // נקודות צוואר
  const neckLeft: Point = { x: cx - nw, y: d * 0.4 };
  const neckRight: Point = { x: cx + nw, y: d * 0.4 };

  // נקודות ראש — רחבות יותר מהצוואר
  const headLeft: Point = { x: cx - hw * 0.95, y: d * 0.75 };
  const headRight: Point = { x: cx + hw * 0.95, y: d * 0.75 };

  // קודקוד
  const top: Point = { x: cx, y: d };

  // Curve 1: base-left → neck-left (עלייה מונוטונית)
  const c1 = sampleBezier(
    baseLeft,
    { x: baseLeft.x, y: d * 0.15 },
    { x: neckLeft.x, y: d * 0.2 },
    neckLeft,
    samples,
  );

  // Curve 2: neck-left → head-left → top (התרחבות + קשת שמאל)
  const c2 = sampleBezier(
    neckLeft,
    { x: neckLeft.x - hw * 0.1, y: d * 0.65 },
    { x: headLeft.x - hw * 0.15, y: d * 0.9 },
    top,
    samples,
  );

  // Curve 3: top → head-right → neck-right (קשת ימין + התכווצות)
  const c3 = sampleBezier(
    top,
    { x: headRight.x + hw * 0.15, y: d * 0.9 },
    { x: neckRight.x + hw * 0.1, y: d * 0.65 },
    neckRight,
    samples,
  );

  // Curve 4: neck-right → base-right (ירידה מונוטונית)
  const c4 = sampleBezier(
    neckRight,
    { x: neckRight.x, y: d * 0.2 },
    { x: baseRight.x, y: d * 0.15 },
    baseRight,
    samples,
  );

  // חיבור כל העקומות (ללא כפילות בנקודות חיבור)
  return [...c1, ...c2.slice(1), ...c3.slice(1), ...c4.slice(1)];
}

// === Variation parameters per piece/side ===

interface SideVariation {
  widthScale: number; // 0.85-1.15
  depthScale: number; // 0.85-1.15
  offset: number; // -0.08..+0.08 (fraction of edge)
  neckRatio: number; // 0.55-0.75
}

function getVariation(rng: () => number): SideVariation {
  return {
    widthScale: 0.85 + rng() * 0.3,
    depthScale: 0.85 + rng() * 0.3,
    offset: (rng() - 0.5) * 0.16,
    neckRatio: 0.55 + rng() * 0.2,
  };
}

// === SmoothOutline class ===

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Piece = any;

export class SmoothOutline {
  private samplesPerCurve: number;

  constructor(options?: { samplesPerCurve?: number }) {
    this.samplesPerCurve = options?.samplesPerCurve ?? 8;
  }

  isBezier(): boolean {
    return false; // Konva ישתמש ב-tension (lineSoftness) להחלקה
  }

  draw(piece: Piece, size: number | { x: number; y: number } = 150, _borderFill: number | { x: number; y: number } = 0): number[] {
    const sz = typeof size === "number" ? { x: size, y: size } : size;

    // FIX: w/h = diameter בלבד. headbreaker Rounded עובד כך.
    // טאבים יוצאים מחוץ ל-(0,0)-(w,h), סלוטים נכנסים פנימה.
    const w = sz.x;
    const h = sz.y;

    // פרמטרים בסיסיים
    const insertFraction = 0.35; // חלק מהקצה שתפוס ה-insert
    const depthFraction = 0.22; // עומק ה-insert ביחס לגודל

    // Edge-based seeds — שכנים חולקים אותו seed על קצה משותף
    const tp = piece.metadata?.targetPosition;
    const col = tp ? Math.round(tp.x / sz.x) : 0;
    const row = tp ? Math.round(tp.y / sz.y) : 0;

    const points: number[] = [];

    // FIX 1: אין offset — ה-Konva painter של headbreaker כבר מזיז ב-(-radius)
    // הנקודות צריכות להיות מ-(0,0) ל-(w,h)
    const addPoint = (x: number, y: number) => {
      points.push(x, y);
    };

    // FIX 3: ללא נקודות margin נפרדות — ה-insert מתחיל ומסתיים ב-y=0,
    // אז הנתיב הוא: corner → insertBase → curve → insertBase → nextCorner.
    // Konva tension יעגל קלות את המעברים — נראה טבעי.

    // === Top edge (left → right), insert = piece.up ===
    {
      const insert = piece.up;
      const edgeLen = w;
      const insertW = edgeLen * insertFraction;
      // top edge of (col,row) = bottom edge of (col,row-1) → hash(col, row, 0)
      const rng = mulberry32(hashSeed(col, row, 0));
      const v = getVariation(rng);

      addPoint(0, 0);

      if (!insert.isNone()) {
        const dir = insert.isTab() ? -1 : 1;
        const iw = insertW * v.widthScale;
        const id = h * depthFraction * v.depthScale;
        const off = insertW * v.offset;

        const insertPts = generateInsertPoints({
          direction: dir as 1 | -1,
          baseWidth: iw,
          depth: id,
          offset: off,
          neckRatio: v.neckRatio,
          samples: this.samplesPerCurve,
        });

        const startX = (edgeLen - iw) / 2 - off;
        for (const p of insertPts) {
          addPoint(startX + p.x, p.y);
        }
      }
    }

    // === Right edge (top → bottom), insert = piece.right ===
    {
      const insert = piece.right;
      const edgeLen = h;
      const insertW = edgeLen * insertFraction;
      // right edge of (col,row) = left edge of (col+1,row) → hash(col+1, row, 1)
      const rng = mulberry32(hashSeed(col + 1, row, 1));
      const v = getVariation(rng);

      addPoint(w, 0);

      if (!insert.isNone()) {
        const dir = insert.isTab() ? 1 : -1;
        const iw = insertW * v.widthScale;
        const id = w * depthFraction * v.depthScale;
        const off = insertW * v.offset;

        const insertPts = generateInsertPoints({
          direction: dir as 1 | -1,
          baseWidth: iw,
          depth: id,
          offset: off,
          neckRatio: v.neckRatio,
          samples: this.samplesPerCurve,
        });

        // Transform: rotate 90° CW — local x→global y, local y→global x
        const startY = (edgeLen - iw) / 2 - off;
        for (const p of insertPts) {
          addPoint(w + p.y, startY + p.x);
        }
      }
    }

    // === Bottom edge (right → left), insert = piece.down ===
    {
      const insert = piece.down;
      const edgeLen = w;
      const insertW = edgeLen * insertFraction;
      // bottom edge of (col,row) = top edge of (col,row+1) → hash(col, row+1, 0)
      const rng = mulberry32(hashSeed(col, row + 1, 0));
      const v = getVariation(rng);

      addPoint(w, h);

      if (!insert.isNone()) {
        const dir = insert.isTab() ? 1 : -1;
        const iw = insertW * v.widthScale;
        const id = h * depthFraction * v.depthScale;
        const off = insertW * v.offset;

        const insertPts = generateInsertPoints({
          direction: dir as 1 | -1,
          baseWidth: iw,
          depth: id,
          offset: off,
          neckRatio: v.neckRatio,
          samples: this.samplesPerCurve,
        });

        // bottom edge goes right→left: mirror x + reverse iteration
        const startX = (edgeLen - iw) / 2 + off;
        for (let i = insertPts.length - 1; i >= 0; i--) {
          const p = insertPts[i];
          addPoint(startX + (iw - p.x), h + p.y);
        }
      }
    }

    // === Left edge (bottom → top), insert = piece.left ===
    {
      const insert = piece.left;
      const edgeLen = h;
      const insertW = edgeLen * insertFraction;
      // left edge of (col,row) = right edge of (col-1,row) → hash(col, row, 1)
      const rng = mulberry32(hashSeed(col, row, 1));
      const v = getVariation(rng);

      addPoint(0, h);

      if (!insert.isNone()) {
        const dir = insert.isTab() ? -1 : 1;
        const iw = insertW * v.widthScale;
        const id = w * depthFraction * v.depthScale;
        const off = insertW * v.offset;

        const insertPts = generateInsertPoints({
          direction: dir as 1 | -1,
          baseWidth: iw,
          depth: id,
          offset: off,
          neckRatio: v.neckRatio,
          samples: this.samplesPerCurve,
        });

        // left edge goes bottom→top: rotate 90° CCW + reverse
        const startY = (edgeLen - iw) / 2 + off;
        for (let i = insertPts.length - 1; i >= 0; i--) {
          const p = insertPts[i];
          addPoint(p.y, startY + (iw - p.x));
        }
      }
    }

    return points;
  }
}
