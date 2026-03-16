/**
 * PuzzleInteraction — לוגיקת אינטראקציה (drag & drop, merge, win)
 * מקשר בין Puzzle class ל-Svelte component.
 * משתמש ב-Pointer Events (מאוחד mouse + touch).
 */

import type { Puzzle } from "$lib/puzzle/puzzle";
import type { PolyPiece } from "$lib/puzzle/polypiece";

interface DragState {
  pp: PolyPiece;
  anchorX: number;
  anchorY: number;
  ppXInit: number;
  ppYInit: number;
}

export class PuzzleInteraction {
  private puzzle: Puzzle;
  private dragging: DragState | null = null;
  private container: HTMLElement;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(puzzle: Puzzle) {
    this.puzzle = puzzle;
    this.container = puzzle.container;

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
  }

  /** Register pointer events on container */
  attach(): void {
    this.container.addEventListener("pointerdown", this.boundPointerDown);
    this.container.addEventListener("pointermove", this.boundPointerMove);
    this.container.addEventListener("pointerup", this.boundPointerUp);
    this.container.addEventListener("pointercancel", this.boundPointerUp);

    // Prevent touch scrolling
    this.container.style.touchAction = "none";
  }

  /** Cleanup event listeners */
  detach(): void {
    this.container.removeEventListener("pointerdown", this.boundPointerDown);
    this.container.removeEventListener("pointermove", this.boundPointerMove);
    this.container.removeEventListener("pointerup", this.boundPointerUp);
    this.container.removeEventListener("pointercancel", this.boundPointerUp);
  }

  private relativeCoords(e: PointerEvent): { x: number; y: number } {
    const br = this.container.getBoundingClientRect();
    return {
      x: e.clientX - br.x,
      y: e.clientY - br.y,
    };
  }

  /** Hit test — isPointInPath on each PolyPiece's Path2D (back to front) */
  private hitTest(x: number, y: number): PolyPiece | null {
    const polyPieces = this.puzzle.polyPieces;
    for (let k = polyPieces.length - 1; k >= 0; --k) {
      const pp = polyPieces[k];
      if (pp.ctx.isPointInPath(pp.path, x - pp.x, y - pp.y)) {
        return pp;
      }
    }
    return null;
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    const pos = this.relativeCoords(e);
    const pp = this.hitTest(pos.x, pos.y);
    if (!pp) return;

    // Capture pointer for this element
    this.container.setPointerCapture(e.pointerId);

    // Bring to front
    const k = this.puzzle.polyPieces.indexOf(pp);
    this.puzzle.polyPieces.splice(k, 1);
    this.puzzle.polyPieces.push(pp);
    pp.canvas.style.zIndex = String(this.puzzle.zIndexSup);

    this.dragging = {
      pp,
      anchorX: pos.x,
      anchorY: pos.y,
      ppXInit: pp.x,
      ppYInit: pp.y,
    };
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return;
    e.preventDefault();

    const pos = this.relativeCoords(e);
    this.dragging.pp.moveTo(
      pos.x - this.dragging.anchorX + this.dragging.ppXInit,
      pos.y - this.dragging.anchorY + this.dragging.ppYInit,
    );
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.dragging) return;
    e.preventDefault();

    this.container.releasePointerCapture(e.pointerId);
    this.checkMerge(this.dragging.pp);
    this.dragging = null;
  }

  /** Cascade merge — keep checking for additional nearby merges after drop */
  private checkMerge(moved: PolyPiece): void {
    let doneSomething: boolean;
    let mergeCount = 0;

    do {
      doneSomething = false;
      for (let k = this.puzzle.polyPieces.length - 1; k >= 0; --k) {
        const pp = this.puzzle.polyPieces[k];
        if (pp === moved) continue;
        if (moved.ifNear(pp)) {
          // Merge smaller into larger
          if (pp.pieces.length > moved.pieces.length) {
            pp.merge(moved);
            moved = pp;
          } else {
            moved.merge(pp);
          }
          doneSomething = true;
          mergeCount++;
          break;
        }
      }
    } while (doneSomething);

    if (mergeCount > 0) {
      this.puzzle.evaluateZIndex();
      this.puzzle.notifyPieceConnected(mergeCount);
    }

    // Win check
    if (this.puzzle.polyPieces.length === 1) {
      this.puzzle.notifyPuzzleSolved();
    }
  }
}
