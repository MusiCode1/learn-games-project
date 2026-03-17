/**
 * PolyPiece — קבוצת חלקים ממוזגת
 *
 * כל PolyPiece מקבל canvas element משלו, ממוקם absolute בתוך container.
 * כשחלקים מתמזגים, ה-PolyPiece הקטן נספג לגדול, ה-canvas שלו מוסר,
 * ומתבצע ציור מחדש של ה-contour המשולב.
 */

import type { Piece } from "./piece";
import type { Puzzle } from "./puzzle";
import type { Side } from "./side";

const mhypot = Math.hypot;
const mabs = Math.abs;
const mmin = Math.min;

interface LoopEdge {
  kx: number;
  ky: number;
  edge: number; // 0=top, 1=right, 2=bottom, 3=left
  kp: number; // index into this.pieces
}

export class PolyPiece {
  pieces: Piece[];
  puzzle: Puzzle;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  path!: Path2D;

  // Bounding box in grid coordinates
  pckxmin: number;
  pckxmax: number;
  pckymin: number;
  pckymax: number;

  // Position in pixels (top-left of canvas element)
  x = 0;
  y = 0;

  // Canvas dimensions in grid units (including 0.5 margin on each side)
  private nx = 0;
  private ny = 0;
  private offsx = 0;
  private offsy = 0;

  // Contour loops (external edges only)
  private tbLoops: Side[][] = [];

  constructor(initialPiece: Piece, puzzle: Puzzle) {
    this.pckxmin = initialPiece.kx;
    this.pckxmax = initialPiece.kx + 1;
    this.pckymin = initialPiece.ky;
    this.pckymax = initialPiece.ky + 1;
    this.pieces = [initialPiece];
    this.puzzle = puzzle;

    this.listLoops();

    this.canvas = document.createElement("canvas");
    puzzle.piecesLayer.appendChild(this.canvas);
    this.canvas.style.position = "absolute";
    this.canvas.style.pointerEvents = "none";
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Merge another PolyPiece into this one.
   * Removes the other from the puzzle and redraws.
   */
  merge(otherPoly: PolyPiece): void {
    const orgpckxmin = this.pckxmin;
    const orgpckymin = this.pckymin;

    // Remove other from puzzle's list
    const kOther = this.puzzle.polyPieces.indexOf(otherPoly);
    this.puzzle.polyPieces.splice(kOther, 1);

    // Remove other's canvas from DOM
    this.puzzle.piecesLayer.removeChild(otherPoly.canvas);

    // Absorb pieces and update bounding box
    for (const piece of otherPoly.pieces) {
      this.pieces.push(piece);
      if (piece.kx < this.pckxmin) this.pckxmin = piece.kx;
      if (piece.kx + 1 > this.pckxmax) this.pckxmax = piece.kx + 1;
      if (piece.ky < this.pckymin) this.pckymin = piece.ky;
      if (piece.ky + 1 > this.pckymax) this.pckymax = piece.ky + 1;
    }

    // Sort pieces by row then column
    this.pieces.sort((p1, p2) => {
      if (p1.ky !== p2.ky) return p1.ky - p2.ky;
      return p1.kx - p2.kx;
    });

    this.listLoops();
    this.drawImage();
    this.moveTo(
      this.x + this.puzzle.scalex * (this.pckxmin - orgpckxmin),
      this.y + this.puzzle.scaley * (this.pckymin - orgpckymin),
    );

    this.puzzle.evaluateZIndex();
  }

  /**
   * Check if another PolyPiece is close enough to snap.
   * Must be within dConnect distance AND share a grid adjacency.
   */
  ifNear(otherPoly: PolyPiece): boolean {
    const puzzle = this.puzzle;

    // Compute "origin" — where grid (0,0) would be for each PolyPiece
    const x = this.x - puzzle.scalex * this.pckxmin;
    const y = this.y - puzzle.scaley * this.pckymin;
    const ppx = otherPoly.x - puzzle.scalex * otherPoly.pckxmin;
    const ppy = otherPoly.y - puzzle.scaley * otherPoly.pckymin;

    if (mhypot(x - ppx, y - ppy) >= puzzle.dConnect) return false;

    // Check grid adjacency
    for (let k = this.pieces.length - 1; k >= 0; --k) {
      const p1 = this.pieces[k];
      for (let ko = otherPoly.pieces.length - 1; ko >= 0; --ko) {
        const p2 = otherPoly.pieces[ko];
        if (p1.kx === p2.kx && mabs(p1.ky - p2.ky) === 1) return true;
        if (p1.ky === p2.ky && mabs(p1.kx - p2.kx) === 1) return true;
      }
    }

    return false;
  }

  /**
   * Contour tracing — right-hand wall following algorithm.
   * Identifies only external edges (eliminating internal shared edges).
   * Produces one or more closed loops of Side objects.
   */
  listLoops(): void {
    const that = this;

    function edgeIsCommon(kx: number, ky: number, edge: number): boolean {
      switch (edge) {
        case 0:
          ky--;
          break;
        case 1:
          kx++;
          break;
        case 2:
          ky++;
          break;
        case 3:
          kx--;
          break;
      }
      for (let k = 0; k < that.pieces.length; k++) {
        if (kx === that.pieces[k].kx && ky === that.pieces[k].ky) return true;
      }
      return false;
    }

    function edgeIsInTbEdges(
      kx: number,
      ky: number,
      edge: number,
    ): number | false {
      for (let k = 0; k < tbEdges.length; k++) {
        if (kx === tbEdges[k].kx && ky === tbEdges[k].ky && edge === tbEdges[k].edge)
          return k;
      }
      return false;
    }

    const tbEdges: LoopEdge[] = [];

    // Right-hand rule transition table
    const tbTries = [
      [
        { dkx: 0, dky: 0, edge: 1 },
        { dkx: 1, dky: 0, edge: 0 },
        { dkx: 1, dky: -1, edge: 3 },
      ],
      [
        { dkx: 0, dky: 0, edge: 2 },
        { dkx: 0, dky: 1, edge: 1 },
        { dkx: 1, dky: 1, edge: 0 },
      ],
      [
        { dkx: 0, dky: 0, edge: 3 },
        { dkx: -1, dky: 0, edge: 2 },
        { dkx: -1, dky: 1, edge: 1 },
      ],
      [
        { dkx: 0, dky: 0, edge: 0 },
        { dkx: 0, dky: -1, edge: 3 },
        { dkx: -1, dky: -1, edge: 2 },
      ],
    ];

    // Collect all external edges
    for (let k = 0; k < this.pieces.length; k++) {
      for (let kEdge = 0; kEdge < 4; kEdge++) {
        if (!edgeIsCommon(this.pieces[k].kx, this.pieces[k].ky, kEdge)) {
          tbEdges.push({
            kx: this.pieces[k].kx,
            ky: this.pieces[k].ky,
            edge: kEdge,
            kp: k,
          });
        }
      }
    }

    // Trace loops
    const tbLoops: LoopEdge[][] = [];

    while (tbEdges.length > 0) {
      const lp: LoopEdge[] = [];
      let currEdge = tbEdges[0];
      lp.push(currEdge);
      tbEdges.splice(0, 1);

      let foundNext: boolean;
      do {
        foundNext = false;
        for (let tries = 0; tries < 3; tries++) {
          const potNext = tbTries[currEdge.edge][tries];
          const edgeNumber = edgeIsInTbEdges(
            currEdge.kx + potNext.dkx,
            currEdge.ky + potNext.dky,
            potNext.edge,
          );
          if (edgeNumber === false) continue;
          currEdge = tbEdges[edgeNumber];
          lp.push(currEdge);
          tbEdges.splice(edgeNumber, 1);
          foundNext = true;
          break;
        }
      } while (foundNext);

      tbLoops.push(lp);
    }

    // Convert edge indices to Side references
    this.tbLoops = tbLoops.map((loop) =>
      loop.map((edge) => {
        const cell = this.pieces[edge.kp];
        if (edge.edge === 0) return cell.ts;
        if (edge.edge === 1) return cell.rs;
        if (edge.edge === 2) return cell.bs;
        return cell.ls;
      }),
    );
  }

  /** Draw composite contour path onto a context */
  drawPath(ctx: CanvasRenderingContext2D | Path2D, shiftx: number, shifty: number): void {
    this.tbLoops.forEach((loop) => {
      let without = false;
      loop.forEach((side) => {
        side.drawPath(ctx, shiftx, shifty, without);
        without = true;
      });
      ctx.closePath();
    });
  }

  /**
   * Render the piece image: shadow → per-piece clip+blit → emboss
   */
  drawImage(): void {
    const puzzle = this.puzzle;
    this.nx = this.pckxmax - this.pckxmin + 1;
    this.ny = this.pckymax - this.pckymin + 1;
    this.canvas.width = this.nx * puzzle.scalex;
    this.canvas.height = this.ny * puzzle.scaley;

    this.offsx = (this.pckxmin - 0.5) * puzzle.scalex;
    this.offsy = (this.pckymin - 0.5) * puzzle.scaley;

    // Build composite path for hit testing
    this.path = new Path2D();
    this.drawPath(this.path, -this.offsx, -this.offsy);

    // Draw shadow
    this.ctx.fillStyle = "none";
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 4;
    this.ctx.fill(this.path);
    this.ctx.shadowColor = "rgba(0, 0, 0, 0)";

    // Draw each piece with clipping and emboss
    this.pieces.forEach((pp) => {
      this.ctx.save();

      // Build per-piece path
      const path = new Path2D();
      const shiftx = -this.offsx;
      const shifty = -this.offsy;
      pp.ts.drawPath(path, shiftx, shifty, false);
      pp.rs.drawPath(path, shiftx, shifty, true);
      pp.bs.drawPath(path, shiftx, shifty, true);
      pp.ls.drawPath(path, shiftx, shifty, true);
      path.closePath();

      this.ctx.clip(path);

      // Blit image region
      const srcx = pp.kx ? (pp.kx - 0.5) * puzzle.scalex : 0;
      const srcy = pp.ky ? (pp.ky - 0.5) * puzzle.scaley : 0;
      const destx =
        (pp.kx ? 0 : puzzle.scalex / 2) + (pp.kx - this.pckxmin) * puzzle.scalex;
      const desty =
        (pp.ky ? 0 : puzzle.scaley / 2) + (pp.ky - this.pckymin) * puzzle.scaley;

      let w = 2 * puzzle.scalex;
      let h = 2 * puzzle.scaley;
      if (srcx + w > puzzle.gameCanvas.width) w = puzzle.gameCanvas.width - srcx;
      if (srcy + h > puzzle.gameCanvas.height) h = puzzle.gameCanvas.height - srcy;

      this.ctx.drawImage(puzzle.gameCanvas, srcx, srcy, w, h, destx, desty, w, h);

      // Emboss — dark shadow stroke
      this.ctx.translate(puzzle.embossThickness / 2, -puzzle.embossThickness / 2);
      this.ctx.lineWidth = puzzle.embossThickness;
      this.ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
      this.ctx.stroke(path);

      // Emboss — white highlight stroke
      this.ctx.translate(-puzzle.embossThickness, puzzle.embossThickness);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      this.ctx.stroke(path);

      this.ctx.restore();
    });
  }

  /** Move canvas element to position */
  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.canvas.style.left = x + "px";
    this.canvas.style.top = y + "px";
  }

  /** Move to the solved position */
  moveToInitialPlace(): void {
    const puzzle = this.puzzle;
    this.moveTo(
      puzzle.offsx + (this.pckxmin - 0.5) * puzzle.scalex,
      puzzle.offsy + (this.pckymin - 0.5) * puzzle.scaley,
    );
  }
}
