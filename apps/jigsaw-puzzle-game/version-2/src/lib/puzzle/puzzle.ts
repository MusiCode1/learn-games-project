/**
 * Puzzle — מנוע הפאזל הראשי
 *
 * אחראי על: יצירת הרשת, חישוב צורות, scaling, פיזור חלקים,
 * ניהול z-index, וניקוי.
 */

import { Point, alea, intAlea, arrayShuffle } from "./math";
import { Piece } from "./piece";
import { PolyPiece } from "./polypiece";
import type { TwistFunction } from "./twists";
import { getTwistByStyle } from "./twists";
import type { ShapeStyle } from "$lib/types";

const mmax = Math.max;
const mmin = Math.min;
const mround = Math.round;
const msqrt = Math.sqrt;
const mabs = Math.abs;

export interface PuzzleOptions {
  container: HTMLElement;
  image: HTMLImageElement;
  columns: number;
  rows: number;
  shapeStyle: ShapeStyle;
  snapDistance?: number;
  /** חלקים מסודרים בשורה קומפקטית (לא מפוזרים) */
  organizedStart?: boolean;
  onPieceConnected?: (count: number) => void;
  onPuzzleSolved?: () => void;
}

export class Puzzle {
  container: HTMLElement;
  /** Wrapper div for all piece canvases — zoom/pan transform is applied here */
  piecesLayer: HTMLDivElement;
  /** Hidden canvas with the scaled source image */
  gameCanvas: HTMLCanvasElement;
  gameCtx!: CanvasRenderingContext2D;
  srcImage: HTMLImageElement;

  /** Grid dimensions */
  nx: number;
  ny: number;
  /** Pixels per grid unit */
  scalex = 0;
  scaley = 0;

  /** Scaled image dimensions */
  gameWidth = 0;
  gameHeight = 0;

  /** Offset to center image in container */
  offsx = 0;
  offsy = 0;

  /** Container dimensions */
  contWidth = 0;
  contHeight = 0;

  /** Grid of pieces [ky][kx] */
  pieces: Piece[][] = [];
  /** Active PolyPiece groups */
  polyPieces: PolyPiece[] = [];

  /** Snap threshold in pixels */
  dConnect = 0;
  /** Emboss line thickness */
  embossThickness = 0;

  /** Z-index counter */
  zIndexSup = 0;

  /** Base device pixel ratio (window.devicePixelRatio) */
  baseDpr: number;
  /** gameCanvas source resolution — fixed high value for zoom headroom */
  gameDpr: number = 1;
  /** Piece canvas resolution — dynamic, changes with zoom level */
  dpr: number;

  private static readonly MAX_RENDER_DPR = 4;

  shapeStyle: ShapeStyle;
  /** חלקים מסודרים בשורה קומפקטית (לא מפוזרים) */
  organizedStart: boolean;
  private onPieceConnected?: (count: number) => void;
  private onPuzzleSolved?: () => void;
  private solved = false;

  // קבועי לייאאוט למצב מתחילים
  private static readonly TRAY_INNER_GAP = 12;
  private static readonly TRAY_PAD = 8;
  /** gap יחסי בין חלקים ב-tray (60% מגודל חלק — מספיק להפרדה ויזואלית של בליטות) */
  private static trayGap(pieceSize: number): number {
    return mmax(4, pieceSize * 0.6);
  }

  constructor(options: PuzzleOptions) {
    this.container = options.container;
    this.srcImage = options.image;
    this.nx = options.columns;
    this.ny = options.rows;
    this.shapeStyle = options.shapeStyle;
    this.organizedStart = options.organizedStart ?? false;
    this.onPieceConnected = options.onPieceConnected;
    this.onPuzzleSolved = options.onPuzzleSolved;
    this.baseDpr = window.devicePixelRatio || 1;
    this.dpr = this.baseDpr;

    // Create pieces layer wrapper for zoom/pan
    this.piecesLayer = document.createElement("div");
    this.piecesLayer.style.position = "absolute";
    this.piecesLayer.style.inset = "0";
    this.piecesLayer.style.transformOrigin = "0 0";
    this.container.appendChild(this.piecesLayer);

    // Create hidden canvas for source image (outside piecesLayer)
    this.gameCanvas = document.createElement("canvas");
    this.gameCanvas.style.display = "none";
    this.container.appendChild(this.gameCanvas);
  }

  /** Initialize and render the puzzle */
  init(): void {
    this.getContainerSize();
    this.defineShapes();
    this.scale();

    // Create PolyPieces
    this.polyPieces = [];
    this.pieces.forEach((row) =>
      row.forEach((piece) => {
        this.polyPieces.push(new PolyPiece(piece, this));
      }),
    );

    arrayShuffle(this.polyPieces);

    // Draw all pieces and place at solved positions initially
    this.polyPieces.forEach((pp) => {
      pp.drawImage();
      pp.moveToInitialPlace();
    });

    this.evaluateZIndex();

    // פיזור חלקים — קומפקטי כשלא מעורבב, פיזור לשוליים כשמעורבב
    if (this.organizedStart) {
      this.compactInitial();
    } else {
      this.optimInitial();
    }
  }

  /** Read container dimensions */
  getContainerSize(): void {
    const styl = window.getComputedStyle(this.container);
    this.contWidth = parseFloat(styl.width);
    this.contHeight = parseFloat(styl.height);
  }

  /** Generate piece shapes (edges with Bezier curves) */
  defineShapes(): void {
    const twistf: TwistFunction = getTwistByStyle(this.shapeStyle);
    const coeffDecentr = 0.12;
    const nx = this.nx;
    const ny = this.ny;

    // Create slightly randomized corners
    const corners: Point[][] = [];
    for (let ky = 0; ky <= ny; ++ky) {
      corners[ky] = [];
      for (let kx = 0; kx <= nx; ++kx) {
        corners[ky][kx] = new Point(
          kx + alea(-coeffDecentr, coeffDecentr),
          ky + alea(-coeffDecentr, coeffDecentr),
        );
        // Clamp border corners
        if (kx === 0) corners[ky][kx].x = 0;
        if (kx === nx) corners[ky][kx].x = nx;
        if (ky === 0) corners[ky][kx].y = 0;
        if (ky === ny) corners[ky][kx].y = ny;
      }
    }

    // Build pieces
    this.pieces = [];
    for (let ky = 0; ky < ny; ++ky) {
      this.pieces[ky] = [];
      for (let kx = 0; kx < nx; ++kx) {
        const np = new Piece(kx, ky);
        this.pieces[ky][kx] = np;

        // Top side
        if (ky === 0) {
          np.ts.points = [corners[ky][kx], corners[ky][kx + 1]];
          np.ts.type = "d";
        } else {
          np.ts = this.pieces[ky - 1][kx].bs.reversed();
        }

        // Right side
        np.rs.points = [corners[ky][kx + 1], corners[ky + 1][kx + 1]];
        np.rs.type = "d";
        if (kx < nx - 1) {
          if (intAlea(2)) {
            twistf(np.rs, corners[ky][kx], corners[ky + 1][kx]);
          } else {
            twistf(np.rs, corners[ky][kx + 2], corners[ky + 1][kx + 2]);
          }
        }

        // Left side
        if (kx === 0) {
          np.ls.points = [corners[ky + 1][kx], corners[ky][kx]];
          np.ls.type = "d";
        } else {
          np.ls = this.pieces[ky][kx - 1].rs.reversed();
        }

        // Bottom side
        np.bs.points = [corners[ky + 1][kx + 1], corners[ky + 1][kx]];
        np.bs.type = "d";
        if (ky < ny - 1) {
          if (intAlea(2)) {
            twistf(np.bs, corners[ky][kx + 1], corners[ky][kx]);
          } else {
            twistf(np.bs, corners[ky + 2][kx + 1], corners[ky + 2][kx]);
          }
        }
      }
    }
  }

  /** Compute pixel dimensions, render source image to hidden canvas */
  scale(): void {
    if (this.organizedStart) {
      this.computeBeginnerDimensions();
    } else {
      // Cap piece size: each piece ≤ ~20% of container. Small grids get more margin for scattering.
      const maxPieceFraction = 0.20;
      const maxFactor = mmin(
        0.95,
        mmax(0.30, mmin(maxPieceFraction * this.nx, maxPieceFraction * this.ny)),
      );
      const maxWidth = maxFactor * this.contWidth;
      const maxHeight = maxFactor * this.contHeight;

      this.gameHeight = maxHeight;
      this.gameWidth =
        this.gameHeight * (this.srcImage.naturalWidth / this.srcImage.naturalHeight);

      if (this.gameWidth > maxWidth) {
        this.gameWidth = maxWidth;
        this.gameHeight =
          this.gameWidth * (this.srcImage.naturalHeight / this.srcImage.naturalWidth);
      }
    }

    // gameCanvas at high resolution for zoom headroom
    this.gameDpr = mmin(
      Puzzle.MAX_RENDER_DPR,
      mmax(this.baseDpr, this.srcImage.naturalWidth / this.gameWidth),
    );
    this.gameCanvas.width = this.gameWidth * this.gameDpr;
    this.gameCanvas.height = this.gameHeight * this.gameDpr;
    this.gameCtx = this.gameCanvas.getContext("2d")!;
    this.gameCtx.scale(this.gameDpr, this.gameDpr);
    this.gameCtx.drawImage(this.srcImage, 0, 0, this.gameWidth, this.gameHeight);
    this.dpr = this.baseDpr;

    this.scalex = this.gameWidth / this.nx;
    this.scaley = this.gameHeight / this.ny;

    // Scale all pieces
    this.pieces.forEach((row) => {
      row.forEach((piece) => piece.scale(this.scalex, this.scaley));
    });

    // במצב רגיל — מרכוז. במצב מתחילים offsx/offsy כבר הוגדרו ב-computeBeginnerDimensions
    if (!this.organizedStart) {
      this.offsx = (this.contWidth - this.gameWidth) / 2;
      this.offsy = (this.contHeight - this.gameHeight) / 2;
    }

    // Snap threshold
    this.dConnect = mmax(10, mmin(this.scalex, this.scaley) / 10);

    // Emboss thickness
    this.embossThickness = mmin(2 + (this.scalex / 200) * (5 - 2), 5);
  }

  /**
   * חישוב מימדי תמונה ומיקום עבור מצב מתחילים.
   * מבצע binary search לגודל חלק מקסימלי שמכניס גם את התמונה
   * וגם את שורת/עמודת החלקים למסך.
   */
  private computeBeginnerDimensions(): void {
    const imgAR = this.srcImage.naturalWidth / this.srcImage.naturalHeight;
    const P = this.nx * this.ny;
    const innerGap = Puzzle.TRAY_INNER_GAP;
    const pad = Puzzle.TRAY_PAD;
    const isLandscape = this.contWidth > this.contHeight;

    // חיפוש בינארי על גובה חלק (pieceH) — המקסימום שנכנס למסך
    let lo = 30;
    let hi = mmin(this.contHeight / this.ny, this.contWidth / (this.ny * imgAR));
    let bestPieceH = lo;

    for (let i = 0; i < 30; i++) {
      const pieceH = (lo + hi) / 2;
      const gameH = pieceH * this.ny;
      const gameW = gameH * imgAR;
      const pieceW = gameW / this.nx;
      // gap דינמי — 30% מגודל חלק, מינימום 4px
      const gapX = Puzzle.trayGap(pieceW);
      const gapY = Puzzle.trayGap(pieceH);

      let fits: boolean;
      if (isLandscape) {
        // תמונה במרכז, חלקים בעמודות מימין
        const ppcol = mmax(1, Math.floor((this.contHeight - 2 * pad) / (pieceH + gapY)));
        const ncols = Math.ceil(P / ppcol);
        const trayW = ncols * (pieceW + gapX) - gapX;
        fits =
          gameW + innerGap + trayW + 2 * pad <= this.contWidth &&
          gameH + 2 * pad <= this.contHeight;
      } else {
        // תמונה במרכז, חלקים בשורות למטה
        const pprow = mmax(1, Math.floor((this.contWidth - 2 * pad) / (pieceW + gapX)));
        const nrows = Math.ceil(P / pprow);
        const trayH = nrows * (pieceH + gapY) - gapY;
        fits =
          gameH + innerGap + trayH + 2 * pad <= this.contHeight &&
          gameW + 2 * pad <= this.contWidth;
      }

      if (fits) {
        bestPieceH = pieceH;
        lo = pieceH;
      } else {
        hi = pieceH;
      }
    }

    // הגדרת מימדי תמונה
    this.gameHeight = bestPieceH * this.ny;
    this.gameWidth = this.gameHeight * imgAR;
    const pieceW = this.gameWidth / this.nx;
    const gapX = Puzzle.trayGap(pieceW);
    const gapY = Puzzle.trayGap(bestPieceH);

    // חישוב offsets — תמונה במרכז המסך
    this.offsx = (this.contWidth - this.gameWidth) / 2;
    this.offsy = (this.contHeight - this.gameHeight) / 2;
  }

  /**
   * מצב מתחילים — סידור חלקים בשורה/עמודה קומפקטית ומסודרת.
   * החלקים מסודרים לפי מיקומם המקורי בתמונה (שמאל→ימין, למעלה→למטה).
   * מיקום קבוע ודטרמיניסטי (ללא רנדומיזציה).
   */
  compactInitial(): void {
    const P = this.nx * this.ny;
    const gapX = Puzzle.trayGap(this.scalex);
    const gapY = Puzzle.trayGap(this.scaley);
    const innerGap = Puzzle.TRAY_INNER_GAP;
    const pad = Puzzle.TRAY_PAD;
    const isLandscape = this.contWidth > this.contHeight;

    // מיון לפי מיקום ברשת — מותאם לכיוון הסידור
    const sorted = [...this.polyPieces].sort((a, b) => {
      const pa = a.pieces[0];
      const pb = b.pieces[0];
      if (isLandscape) {
        // column-major: עמודה-עמודה (kx ראשון, אחרי כן ky)
        if (pa.kx !== pb.kx) return pa.kx - pb.kx;
        return pa.ky - pb.ky;
      }
      // row-major: שורה-שורה (ky ראשון, אחרי כן kx)
      if (pa.ky !== pb.ky) return pa.ky - pb.ky;
      return pa.kx - pb.kx;
    });

    if (isLandscape) {
      // חלקים בעמודות מימין לתמונה הממורכזת
      const piecesPerCol = mmax(
        1,
        Math.floor((this.contHeight - 2 * pad) / (this.scaley + gapY)),
      );
      // התחלת ה-tray מימין לתמונה
      const trayOriginX = this.offsx + this.gameWidth + innerGap;

      sorted.forEach((pp, i) => {
        const col = Math.floor(i / piecesPerCol);
        const row = i % piecesPerCol;
        // מרכוז אנכי של כל עמודה
        const colPieceCount = mmin(piecesPerCol, P - col * piecesPerCol);
        const colHeight = colPieceCount * (this.scaley + gapY) - gapY;
        const startY = (this.contHeight - colHeight) / 2;

        const cellX = trayOriginX + col * (this.scalex + gapX);
        const cellY = startY + row * (this.scaley + gapY);
        // moveTo מקבל את פינת ה-canvas (כולל שוליים של 0.5 grid unit)
        pp.moveTo(cellX - this.scalex * 0.5, cellY - this.scaley * 0.5);
      });
    } else {
      // חלקים בשורות למטה מהתמונה הממורכזת
      const piecesPerRow = mmax(
        1,
        Math.floor((this.contWidth - 2 * pad) / (this.scalex + gapX)),
      );
      const trayOriginY = this.offsy + this.gameHeight + innerGap;

      sorted.forEach((pp, i) => {
        const row = Math.floor(i / piecesPerRow);
        const col = i % piecesPerRow;
        // מרכוז אופקי של כל שורה
        const rowPieceCount = mmin(piecesPerRow, P - row * piecesPerRow);
        const rowWidth = rowPieceCount * (this.scalex + gapX) - gapX;
        const startX = (this.contWidth - rowWidth) / 2;

        const cellX = startX + col * (this.scalex + gapX);
        const cellY = trayOriginY + row * (this.scaley + gapY);
        pp.moveTo(cellX - this.scalex * 0.5, cellY - this.scaley * 0.5);
      });
    }
  }

  /**
   * Scatter pieces to margins around the puzzle area.
   * Distributes pieces evenly across available margin rectangles.
   */
  optimInitial(): void {
    const minx = -this.scalex / 2;
    const miny = -this.scaley / 2;
    const maxx = this.contWidth - 1.5 * this.scalex;
    const maxy = this.contHeight - 1.5 * this.scaley;

    const freex = this.contWidth - this.gameWidth;
    const freey = this.contHeight - this.gameHeight;

    const where = [0, 0, 0, 0];
    const rects: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];

    if (freex > 1.5 * this.scalex) {
      where[1] = 1;
      rects[1] = {
        x0: this.offsx + this.gameWidth - 0.5 * this.scalex,
        x1: maxx,
        y0: miny,
        y1: maxy,
      };
    }
    if (freex > 3 * this.scalex) {
      where[3] = 1;
      rects[3] = {
        x0: minx,
        x1: freex / 2 - 1.5 * this.scalex,
        y0: miny,
        y1: maxy,
      };
      rects[1].x0 = this.contWidth - freex / 2 - 0.5 * this.scalex;
    }
    if (freey > 1.5 * this.scaley) {
      where[2] = 1;
      rects[2] = {
        x0: minx,
        x1: maxx,
        y0: this.offsy + this.gameHeight - 0.5 * this.scaley,
        y1: this.contHeight - 1.5 * this.scaley,
      };
    }
    if (freey > 3 * this.scaley) {
      where[0] = 1;
      rects[0] = {
        x0: minx,
        x1: maxx,
        y0: miny,
        y1: freey / 2 - 1.5 * this.scaley,
      };
      rects[2].y0 = this.contHeight - freey / 2 - 0.5 * this.scaley;
    }

    if (where.reduce((sum, a) => sum + a) < 2) {
      // Not enough margin space — spread in best available margin
      if (freex - freey > 0.2 * this.scalex || where[1]) {
        this.spreadInRectangle({
          x0: this.offsx + this.gameWidth - this.scalex / 2,
          x1: maxx,
          y0: miny,
          y1: maxy,
        });
      } else if (freey - freex > 0.2 * this.scalex || where[2]) {
        this.spreadInRectangle({
          x0: minx,
          x1: maxx,
          y0: this.offsy + this.gameHeight - this.scaley / 2,
          y1: maxy,
        });
      } else {
        if (this.gameWidth > this.gameHeight) {
          this.spreadInRectangle({
            x0: minx,
            x1: maxx,
            y0: this.offsy + this.gameHeight - this.scaley / 2,
            y1: maxy,
          });
        } else {
          this.spreadInRectangle({
            x0: this.offsx + this.gameWidth - this.scalex / 2,
            x1: maxx,
            y0: miny,
            y1: maxy,
          });
        }
      }
      return;
    }

    // Distribute pieces across available rectangles
    const nrects: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];
    rects.forEach((rect) => {
      if (rect) nrects.push(rect);
    });

    let k0 = 0;
    const npTot = this.nx * this.ny;
    for (let k = 0; k < nrects.length; ++k) {
      const k1 = mround((k + 1) / nrects.length * npTot);
      this.spreadSetInRectangle(this.polyPieces.slice(k0, k1), nrects[k]);
      k0 = k1;
    }
    arrayShuffle(this.polyPieces);
    this.evaluateZIndex();
  }

  /** Arrange all unconnected pieces around the board edges */
  arrangePieces(): void {
    if (this.organizedStart) {
      this.compactInitial();
    } else {
      this.optimInitial();
    }
    this.polyPieces.forEach((pp) => pp.drawImage());
  }

  /**
   * סידור מחדש של חלקים בודדים בלבד — קבוצות שכבר חוברו נשארות במקומן.
   * משמש לכפתור "סידור מחדש" שתלמיד יכול להפעיל אם החלקים מתערבבים מדי.
   */
  rearrangeUnconnected(): void {
    // PolyPieces בודדים = קבוצה של חלק אחד; קבוצות מחוברות מכילות 2+ חלקים
    const singles = this.polyPieces.filter((pp) => pp.pieces.length === 1);
    if (singles.length === 0) return;

    if (this.organizedStart) {
      // סידור קומפקטי — אותו אלגוריתם של compactInitial אבל רק על singles
      this.compactSinglesOnly(singles);
    } else {
      // פיזור לשוליים — שימוש באלגוריתם הקיים, רק על singles
      this.scatterSinglesToMargins(singles);
    }

    singles.forEach((pp) => pp.drawImage());
  }

  /** סידור singles בלבד ב-grid קומפקטי, משמר את האלגוריתם של compactInitial */
  private compactSinglesOnly(singles: PolyPiece[]): void {
    const total = singles.length;
    const gapX = Puzzle.trayGap(this.scalex);
    const gapY = Puzzle.trayGap(this.scaley);
    const innerGap = Puzzle.TRAY_INNER_GAP;
    const pad = Puzzle.TRAY_PAD;
    const isLandscape = this.contWidth > this.contHeight;

    // מיון לפי מיקום ברשת — מותאם לכיוון הסידור
    const sorted = [...singles].sort((a, b) => {
      const pa = a.pieces[0];
      const pb = b.pieces[0];
      if (isLandscape) {
        if (pa.kx !== pb.kx) return pa.kx - pb.kx;
        return pa.ky - pb.ky;
      }
      if (pa.ky !== pb.ky) return pa.ky - pb.ky;
      return pa.kx - pb.kx;
    });

    if (isLandscape) {
      const piecesPerCol = mmax(
        1,
        Math.floor((this.contHeight - 2 * pad) / (this.scaley + gapY)),
      );

      sorted.forEach((pp, i) => {
        const col = Math.floor(i / piecesPerCol);
        const row = i % piecesPerCol;
        const colPieceCount = mmin(piecesPerCol, total - col * piecesPerCol);
        const colHeight = colPieceCount * (this.scaley + gapY) - gapY;
        const startY = (this.contHeight - colHeight) / 2;

        const cellX = pad + col * (this.scalex + gapX);
        const cellY = startY + row * (this.scaley + gapY);
        pp.moveTo(cellX - this.scalex * 0.5, cellY - this.scaley * 0.5);
      });
    } else {
      const piecesPerRow = mmax(
        1,
        Math.floor((this.contWidth - 2 * pad) / (this.scalex + gapX)),
      );
      const trayOriginY = this.offsy + this.gameHeight + innerGap;

      sorted.forEach((pp, i) => {
        const row = Math.floor(i / piecesPerRow);
        const col = i % piecesPerRow;
        const rowPieceCount = mmin(piecesPerRow, total - row * piecesPerRow);
        const rowWidth = rowPieceCount * (this.scalex + gapX) - gapX;
        const startX = (this.contWidth - rowWidth) / 2;

        const cellX = startX + col * (this.scalex + gapX);
        const cellY = trayOriginY + row * (this.scaley + gapY);
        pp.moveTo(cellX - this.scalex * 0.5, cellY - this.scaley * 0.5);
      });
    }
  }

  /** פיזור singles לשוליים — מיקום אקראי באזורים פנויים מסביב לתמונה */
  private scatterSinglesToMargins(singles: PolyPiece[]): void {
    // שימוש פשוט: פיזור אקראי בכל השוליים של המסך, מסביב לאזור התמונה
    const minx = -this.scalex / 2;
    const miny = -this.scaley / 2;
    const maxx = this.contWidth - 1.5 * this.scalex;
    const maxy = this.contHeight - 1.5 * this.scaley;

    singles.forEach((pp) => {
      // בחירה אקראית של מיקום שלא חופף לאזור התמונה
      let x: number;
      let y: number;
      let attempts = 0;
      do {
        x = alea(minx, maxx);
        y = alea(miny, maxy);
        attempts++;
      } while (
        attempts < 20 &&
        x + this.scalex > this.offsx &&
        x < this.offsx + this.gameWidth &&
        y + this.scaley > this.offsy &&
        y < this.offsy + this.gameHeight
      );
      pp.moveTo(x, y);
    });
  }

  private limitRectangle(rect: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  }): void {
    rect.x0 = mmin(mmax(rect.x0, -this.scalex / 2), this.contWidth - 1.5 * this.scalex);
    rect.x1 = mmin(mmax(rect.x1, -this.scalex / 2), this.contWidth - 1.5 * this.scalex);
    rect.y0 = mmin(mmax(rect.y0, -this.scaley / 2), this.contHeight - 1.5 * this.scaley);
    rect.y1 = mmin(mmax(rect.y1, -this.scaley / 2), this.contHeight - 1.5 * this.scaley);
  }

  private spreadInRectangle(rect: {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  }): void {
    this.limitRectangle(rect);
    this.polyPieces.forEach((pp) =>
      pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1)),
    );
  }

  private spreadSetInRectangle(
    set: PolyPiece[],
    rect: { x0: number; x1: number; y0: number; y1: number },
  ): void {
    this.limitRectangle(rect);
    set.forEach((pp) => pp.moveTo(alea(rect.x0, rect.x1), alea(rect.y0, rect.y1)));
  }

  /** Sort PolyPieces by size — larger groups go to back */
  evaluateZIndex(): void {
    for (let k = this.polyPieces.length - 1; k > 0; --k) {
      if (this.polyPieces[k].pieces.length > this.polyPieces[k - 1].pieces.length) {
        [this.polyPieces[k], this.polyPieces[k - 1]] = [
          this.polyPieces[k - 1],
          this.polyPieces[k],
        ];
      }
    }

    this.polyPieces.forEach((pp, k) => {
      pp.canvas.style.zIndex = String(k + 10);
    });
    this.zIndexSup = this.polyPieces.length + 10;
  }

  /** Notify callbacks */
  notifyPieceConnected(count: number): void {
    this.onPieceConnected?.(count);
  }

  notifyPuzzleSolved(): void {
    if (this.solved) return;
    this.solved = true;
    this.onPuzzleSolved?.();
  }

  /** Redraw pieces at resolution matching the current zoom level */
  redrawPieces(zoomScale: number): void {
    const newDpr = mmin(Puzzle.MAX_RENDER_DPR, this.baseDpr * zoomScale);
    if (mabs(newDpr - this.dpr) / this.dpr < 0.05) return;
    this.dpr = newDpr;
    this.polyPieces.forEach((pp) => pp.drawImage());
  }

  /** Handle window resize — also resets zoom/pan */
  handleResize(): void {
    const prevWidth = this.contWidth;
    const prevHeight = this.contHeight;
    this.getContainerSize();

    this.scale();

    if (this.organizedStart) {
      // חלקים מסודרים — חישוב לייאאוט מחדש ושמירה על סידור קומפקטי
      this.polyPieces.forEach((pp) => pp.drawImage());
      this.compactInitial();
    } else {
      const reScale = this.contWidth / prevWidth;

      this.polyPieces.forEach((pp) => {
        let nx = this.contWidth / 2 - (prevWidth / 2 - pp.x) * reScale;
        let ny = this.contHeight / 2 - (prevHeight / 2 - pp.y) * reScale;

        nx = mmin(mmax(nx, -this.scalex / 2), this.contWidth - 1.5 * this.scalex);
        ny = mmin(mmax(ny, -this.scaley / 2), this.contHeight - 1.5 * this.scaley);

        pp.moveTo(nx, ny);
        pp.drawImage();
      });
    }

    // Reset zoom/pan transform on resize
    this.piecesLayer.style.transform = "";
  }

  /** Cleanup — remove all canvas elements */
  destroy(): void {
    this.polyPieces.forEach((pp) => {
      if (pp.canvas.parentNode) {
        pp.canvas.parentNode.removeChild(pp.canvas);
      }
    });
    this.polyPieces = [];
    if (this.piecesLayer.parentNode) {
      this.piecesLayer.parentNode.removeChild(this.piecesLayer);
    }
    if (this.gameCanvas.parentNode) {
      this.gameCanvas.parentNode.removeChild(this.gameCanvas);
    }
  }
}
