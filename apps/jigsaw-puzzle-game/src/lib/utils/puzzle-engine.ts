/**
 * Wrapper ל-headbreaker — יצירת פאזל על canvas
 *
 * headbreaker v3 uses CommonJS. Key API:
 * - Canvas(id, options): create canvas on DOM element
 * - canvas.autogenerate({ horizontalPiecesCount, verticalPiecesCount })
 * - canvas.shuffle(farness)
 * - canvas.attachSolvedValidator()
 * - canvas.onConnect((piece, figure, targetPiece, targetFigure) => ...)
 * - canvas.onValid(() => ...)
 * - canvas.puzzle.forceConnectionWhileDragging()
 * - canvas.puzzle.tryDisconnectionWhileDragging()
 * - outline.Rounded / outline.Classic (Squared)
 * - painters.Konva
 */

import headbreaker from "headbreaker";
import type { GridConfig, OutlineStyle, PieceFilter } from "$lib/types";

export interface PuzzleConfig {
  container: HTMLDivElement;
  image: HTMLImageElement;
  grid: GridConfig;
  outlineStyle: OutlineStyle;
  proximity: number;
  allowDisconnect: boolean;
  pieceFilter: PieceFilter;
  onPieceConnected: () => void;
  onPuzzleSolved: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HeadbreakerCanvas = any;

export function createPuzzle(config: PuzzleConfig): HeadbreakerCanvas {
  const {
    container,
    image,
    grid,
    outlineStyle,
    proximity,
    allowDisconnect,
    pieceFilter,
    onPieceConnected,
    onPuzzleSolved,
  } = config;

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // גודל חלק — מותאם לגודל הקונטיינר
  const pieceWidth = Math.floor(containerWidth / (grid.columns + 1));
  const pieceHeight = Math.floor(containerHeight / (grid.rows + 1));
  const pieceSize = Math.min(pieceWidth, pieceHeight, 200);

  // Outline — rounded (קלאסי) או squared (פשוט)
  const outline =
    outlineStyle === "rounded"
      ? new headbreaker.outline.Rounded()
      : headbreaker.outline.Classic;

  const lineSoftness = outlineStyle === "rounded" ? 0.18 : 0;

  const canvas = new headbreaker.Canvas(container.id, {
    width: containerWidth,
    height: containerHeight,
    pieceSize: pieceSize,
    proximity: proximity,
    borderFill: Math.floor(proximity * 0.5),
    strokeWidth: 2,
    strokeColor: "#333",
    lineSoftness,
    image: image,
    outline,
    painter: new headbreaker.painters.Konva(),
  });

  // יצירת חלקי הפאזל
  canvas.autogenerate({
    horizontalPiecesCount: grid.columns,
    verticalPiecesCount: grid.rows,
  });

  // הגדרת פירוק חלקים
  if (allowDisconnect) {
    canvas.puzzle.tryDisconnectionWhileDragging();
  } else {
    canvas.puzzle.forceConnectionWhileDragging();
  }

  // סינון חלקים — הצגת מסגרת בלבד
  if (pieceFilter === "border_only") {
    applyBorderOnlyFilter(canvas, grid);
  }

  // ערבוב החלקים
  canvas.shuffle(0.8);

  // validator לבדיקת פתרון
  canvas.attachSolvedValidator();

  // אירוע חיבור חלק (piece, figure, targetPiece, targetFigure)
  canvas.onConnect(() => {
    onPieceConnected();
  });

  // אירוע פתרון
  canvas.onValid(() => {
    onPuzzleSolved();
  });

  // רינדור ראשוני
  canvas.draw();

  return canvas;
}

/**
 * סינון border_only — חלקי פנים מוצבים במיקום הסופי, חלקי מסגרת מפוזרים
 * border pieces = pieces where at least one insert isNone() (flat edge)
 */
function applyBorderOnlyFilter(canvas: HeadbreakerCanvas, _grid: GridConfig): void {
  const pieces = canvas.puzzle.pieces;
  for (const piece of pieces) {
    // בדיקה אם זה חלק מסגרת — לפחות צד אחד שטוח (None)
    const isBorder =
      piece.up.isNone() ||
      piece.down.isNone() ||
      piece.left.isNone() ||
      piece.right.isNone();

    if (!isBorder) {
      // חלק פנימי — הצב במיקום הנכון (target position)
      const target = piece.metadata.targetPosition;
      if (target) {
        piece.relocateTo(target.x, target.y);
      }
    }
  }
}

/**
 * ניקוי canvas
 */
export function destroyPuzzle(canvas: HeadbreakerCanvas | null): void {
  if (canvas) {
    try {
      canvas.clear();
    } catch {
      // ignore cleanup errors
    }
  }
}
