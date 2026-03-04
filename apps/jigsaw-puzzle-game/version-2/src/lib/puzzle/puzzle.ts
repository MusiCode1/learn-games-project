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
  onPieceConnected?: () => void;
  onPuzzleSolved?: () => void;
}

export class Puzzle {
  container: HTMLElement;
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

  shapeStyle: ShapeStyle;
  private onPieceConnected?: () => void;
  private onPuzzleSolved?: () => void;

  constructor(options: PuzzleOptions) {
    this.container = options.container;
    this.srcImage = options.image;
    this.nx = options.columns;
    this.ny = options.rows;
    this.shapeStyle = options.shapeStyle;
    this.onPieceConnected = options.onPieceConnected;
    this.onPuzzleSolved = options.onPuzzleSolved;

    // Create hidden canvas for source image
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

    // Scatter pieces to margins
    this.optimInitial();
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

    this.gameCanvas.width = this.gameWidth;
    this.gameCanvas.height = this.gameHeight;
    this.gameCtx = this.gameCanvas.getContext("2d")!;
    this.gameCtx.drawImage(this.srcImage, 0, 0, this.gameWidth, this.gameHeight);

    this.scalex = this.gameWidth / this.nx;
    this.scaley = this.gameHeight / this.ny;

    // Scale all pieces
    this.pieces.forEach((row) => {
      row.forEach((piece) => piece.scale(this.scalex, this.scaley));
    });

    // Center offset
    this.offsx = (this.contWidth - this.gameWidth) / 2;
    this.offsy = (this.contHeight - this.gameHeight) / 2;

    // Snap threshold
    this.dConnect = mmax(10, mmin(this.scalex, this.scaley) / 10);

    // Emboss thickness
    this.embossThickness = mmin(2 + (this.scalex / 200) * (5 - 2), 5);
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
        x0: this.gameWidth - 0.5 * this.scalex,
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
        y0: this.gameHeight - 0.5 * this.scaley,
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
          x0: this.gameWidth - this.scalex / 2,
          x1: maxx,
          y0: miny,
          y1: maxy,
        });
      } else if (freey - freex > 0.2 * this.scalex || where[2]) {
        this.spreadInRectangle({
          x0: minx,
          x1: maxx,
          y0: this.gameHeight - this.scaley / 2,
          y1: maxy,
        });
      } else {
        if (this.gameWidth > this.gameHeight) {
          this.spreadInRectangle({
            x0: minx,
            x1: maxx,
            y0: this.gameHeight - this.scaley / 2,
            y1: maxy,
          });
        } else {
          this.spreadInRectangle({
            x0: this.gameWidth - this.scalex / 2,
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
    this.optimInitial();
    this.polyPieces.forEach((pp) => pp.drawImage());
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
  notifyPieceConnected(): void {
    this.onPieceConnected?.();
  }

  notifyPuzzleSolved(): void {
    this.onPuzzleSolved?.();
  }

  /** Handle window resize */
  handleResize(): void {
    const prevWidth = this.contWidth;
    const prevHeight = this.contHeight;
    this.getContainerSize();

    this.scale();
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

  /** Cleanup — remove all canvas elements */
  destroy(): void {
    this.polyPieces.forEach((pp) => {
      if (pp.canvas.parentNode) {
        pp.canvas.parentNode.removeChild(pp.canvas);
      }
    });
    this.polyPieces = [];
    if (this.gameCanvas.parentNode) {
      this.gameCanvas.parentNode.removeChild(this.gameCanvas);
    }
  }
}
