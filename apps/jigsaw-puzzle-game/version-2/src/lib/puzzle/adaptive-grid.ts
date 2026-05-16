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

/** מינימום חלקים בכל ציר — מאפשר 1×N או N×1 לפאזלים קטנים */
const MIN_AXIS = 1;

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

  // מקרה מיוחד: 2 חלקים תמיד אנכי (2×1) — אחד ליד השני
  if (targetPieceCount === 2) {
    return { columns: 2, rows: 1 };
  }

  let best: AdaptGridResult = { columns: MIN_AXIS, rows: MIN_AXIS };
  let bestScore = Infinity;

  // טווח חיפוש: עד targetPieceCount בכל ציר (אין סיבה ללכת רחוק יותר)
  const maxAxis = Math.max(MIN_AXIS, targetPieceCount);
  // מינימום חלקים כולל — לפחות 2 חלקים (לא 1×1)
  const minTotalPieces = Math.max(2, targetPieceCount);
  // מקסימום חלקים — לא יותר מ-50% מעל המטרה (כדי לא לקפוץ מ-2 ל-4)
  const maxTotalPieces = Math.ceil(targetPieceCount * 1.5);
  
  for (let cols = MIN_AXIS; cols <= maxAxis; cols++) {
    for (let rows = MIN_AXIS; rows <= maxAxis; rows++) {
      const total = cols * rows;
      // דילוג על grids עם מספר חלקים מחוץ לטווח
      if (total < minTotalPieces || total > maxTotalPieces) continue;
      
      const ratioDiff = Math.abs(cols / rows - imageAspectRatio);
      const countDiff = Math.abs(total - targetPieceCount);
      const score = ratioDiff * RATIO_WEIGHT + countDiff;
      if (score < bestScore) {
        bestScore = score;
        best = { columns: cols, rows };
      }
    }
  }

  return best;
}
