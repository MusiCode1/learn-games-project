/**
 * adaptGridToImage —
 * מחשב ממדי grid (columns × rows) שמתאימים לפרופורציות התמונה,
 * תוך שמירה על מספר חלקים קרוב למטרה.
 */

export interface AdaptGridInput {
  /** מספר חלקים מטרה (לפי בחירת המורה) */
  targetPieceCount: number;
  /** יחס תמונה: רוחב חלקי גובה */
  imageAspectRatio: number;
}

export interface AdaptGridResult {
  columns: number;
  rows: number;
}

/** מינימום חלקים בכל ציר — לא לאפשר 1×N או N×1 */
const MIN_AXIS = 2;

/**
 * משקל ההפרש ביחס cols/rows מול יחס התמונה.
 * ערך גבוה יותר = מעדיף יותר התאמה ליחס התמונה על פני מספר חלקים מדויק.
 */
const RATIO_WEIGHT = 10;

/**
 * מחפש את ה-grid הטוב ביותר על ידי מינימיזציה של ציון משוקלל:
 *   score = |cols/rows - imageAspectRatio| * RATIO_WEIGHT + |cols*rows - targetPieceCount|
 *
 * הציון מאזן בין שתי דרישות:
 *   - יחס cols/rows קרוב ליחס התמונה (חשוב — חלקים נראים טוב)
 *   - מספר חלקים קרוב למטרת המורה (פחות קריטי)
 */
export function adaptGridToImage(input: AdaptGridInput): AdaptGridResult {
  const { targetPieceCount, imageAspectRatio } = input;

  let best: AdaptGridResult = { columns: MIN_AXIS, rows: MIN_AXIS };
  let bestScore = Infinity;

  // טווח חיפוש: עד targetPieceCount בכל ציר (אין סיבה ללכת רחוק יותר)
  const maxAxis = Math.max(MIN_AXIS, targetPieceCount);
  for (let cols = MIN_AXIS; cols <= maxAxis; cols++) {
    for (let rows = MIN_AXIS; rows <= maxAxis; rows++) {
      const ratioDiff = Math.abs(cols / rows - imageAspectRatio);
      const countDiff = Math.abs(cols * rows - targetPieceCount);
      const score = ratioDiff * RATIO_WEIGHT + countDiff;
      if (score < bestScore) {
        bestScore = score;
        best = { columns: cols, rows };
      }
    }
  }

  return best;
}
