/**
 * Pre-merge helpers — בחירת חלק חופשי, חישוב סדר מיזוג
 * עבור מצב "חלקים מחוברים מראש".
 *
 * כל הפונקציות כאן טהורות (pure) — ללא תלות ב-DOM או ב-Puzzle class.
 */

import type { LoosePieceSelection } from "$lib/types";

export interface PickLooseIndicesArgs {
  nx: number;
  ny: number;
  mode: LoosePieceSelection;
  /** כמה חלקים יישארו חופשיים. clamp ל-`[1, nx*ny - 1]`. ברירת מחדל: 1 */
  count?: number;
  /** מחולל מספרים אקראיים (0-1). ברירת מחדל: `Math.random` */
  rng?: () => number;
}

/**
 * בחירת אינדקסים של החלקים שיישארו לא-מחוברים.
 * אינדקס ב-row-major: `idx = ky * nx + kx`.
 *
 * - `mode="top-left"` → `count` הראשונים ב-row-major (אזור שמאל-עליון)
 * - `mode="random"` → `count` אינדקסים מובחנים אקראיים
 */
export function pickLooseIndices(args: PickLooseIndicesArgs): number[] {
  const total = args.nx * args.ny;
  // clamp: לפחות 1, לכל היותר total-1 (חייב להישאר חלק אחד למיזוג)
  const count = Math.max(1, Math.min(args.count ?? 1, total - 1));

  if (args.mode === "top-left") {
    return Array.from({ length: count }, (_, i) => i);
  }

  // random — דגימה ללא חזרה
  const rng = args.rng ?? Math.random;
  const pool = Array.from({ length: total }, (_, i) => i);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(rng() * pool.length);
    result.push(pool[pick]);
    pool.splice(pick, 1);
  }
  return result;
}

/**
 * המרת אינדקס row-major לקואורדינטות (kx, ky).
 * row-major: `idx = ky * nx + kx`.
 */
export function gridIndexToCoords(idx: number, nx: number): { kx: number; ky: number } {
  return { kx: idx % nx, ky: Math.floor(idx / nx) };
}

export interface PieceCoords {
  kx: number;
  ky: number;
}

export interface MergePlan {
  /** החלקים שיישארו לא-מחוברים */
  loose: PieceCoords[];
  /** שאר החלקים בסדר מיזוג (הראשון = anchor, השאר ממוזגים אליו) */
  mergeOrder: PieceCoords[];
}

export interface ComputeMergePlanArgs {
  nx: number;
  ny: number;
  mode: LoosePieceSelection;
  /** כמה חלקים יישארו חופשיים. ברירת מחדל: 1 */
  count?: number;
  rng?: () => number;
}

/**
 * חישוב תוכנית מיזוג: אילו חלקים נשארים חופשיים, ובאיזה סדר למזג את השאר.
 * סדר המיזוג row-major: ה-anchor הוא הראשון בסדר הזה שאינו ב-loose.
 */
export function computeMergePlan(args: ComputeMergePlanArgs): MergePlan {
  const looseIndices = pickLooseIndices(args);
  const looseSet = new Set(looseIndices);
  const loose = looseIndices.map((idx) => gridIndexToCoords(idx, args.nx));
  const mergeOrder: PieceCoords[] = [];
  for (let idx = 0; idx < args.nx * args.ny; idx++) {
    if (looseSet.has(idx)) continue;
    mergeOrder.push(gridIndexToCoords(idx, args.nx));
  }
  return { loose, mergeOrder };
}
