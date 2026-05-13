/**
 * PuzzleInteraction — לוגיקת אינטראקציה (drag & drop, merge, win, zoom & pan)
 * מקשר בין Puzzle class ל-Svelte component.
 * משתמש ב-Pointer Events (מאוחד mouse + touch).
 *
 * Zoom/Pan:
 * - גלגלת עכבר → zoom לכיוון מיקום העכבר
 * - צביטה (pinch) → zoom לכיוון מרכז שתי האצבעות
 * - גרירה על אזור ריק → pan (כשזום > 1)
 * - דאבל-טאפ/דאבל-קליק על אזור ריק → איפוס zoom
 */

import type { Puzzle } from "$lib/puzzle/puzzle";
import type { PolyPiece } from "$lib/puzzle/polypiece";

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;

interface DragState {
  pp: PolyPiece;
  anchorX: number;
  anchorY: number;
  ppXInit: number;
  ppYInit: number;
}

interface PanState {
  anchorX: number;
  anchorY: number;
  panXInit: number;
  panYInit: number;
}

interface ActivePointer {
  id: number;
  x: number;
  y: number;
}

export class PuzzleInteraction {
  private puzzle: Puzzle;
  private dragging: DragState | null = null;
  private panning: PanState | null = null;
  private container: HTMLElement;
  private piecesLayer: HTMLDivElement;

  /** מצב מתחילים — חוסם zoom, pan, pinch */
  private beginnerMode: boolean;

  // Zoom/pan state
  private scale = 1;
  private panX = 0;
  private panY = 0;

  // Multi-touch tracking
  private activePointers: ActivePointer[] = [];
  private pinchStartDist = 0;
  private pinchStartScale = 1;

  // Double-tap detection
  private lastTapTime = 0;

  // Debounced hi-res redraw after zoom settles
  private redrawTimer: ReturnType<typeof setTimeout> | null = null;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundWheel: (e: WheelEvent) => void;

  constructor(puzzle: Puzzle, beginnerMode = false) {
    this.puzzle = puzzle;
    this.container = puzzle.container;
    this.piecesLayer = puzzle.piecesLayer;
    this.beginnerMode = beginnerMode;

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundWheel = this.onWheel.bind(this);
  }

  /** Register pointer events on container */
  attach(): void {
    this.container.addEventListener("pointerdown", this.boundPointerDown);
    this.container.addEventListener("pointermove", this.boundPointerMove);
    this.container.addEventListener("pointerup", this.boundPointerUp);
    this.container.addEventListener("pointercancel", this.boundPointerUp);
    this.container.addEventListener("wheel", this.boundWheel, { passive: false });

    // Prevent all native touch gestures — zoom/pan handled in JS
    this.container.style.touchAction = "none";
  }

  /** Cleanup event listeners */
  detach(): void {
    this.container.removeEventListener("pointerdown", this.boundPointerDown);
    this.container.removeEventListener("pointermove", this.boundPointerMove);
    this.container.removeEventListener("pointerup", this.boundPointerUp);
    this.container.removeEventListener("pointercancel", this.boundPointerUp);
    this.container.removeEventListener("wheel", this.boundWheel);
    if (this.redrawTimer) clearTimeout(this.redrawTimer);
  }

  /** Reset zoom and pan to defaults */
  resetZoom(): void {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
    this.scheduleHiResRedraw();
  }

  /** Schedule a hi-res redraw after zoom interaction settles (debounced 150ms) */
  private scheduleHiResRedraw(): void {
    if (this.redrawTimer) clearTimeout(this.redrawTimer);
    this.redrawTimer = setTimeout(() => {
      this.redrawTimer = null;
      this.puzzle.redrawPieces(this.scale);
    }, 150);
  }

  /** Convert screen coordinates to puzzle-space coordinates (accounting for zoom/pan) */
  private toPuzzleCoords(e: PointerEvent): { x: number; y: number } {
    const br = this.container.getBoundingClientRect();
    return {
      x: (e.clientX - br.x - this.panX) / this.scale,
      y: (e.clientY - br.y - this.panY) / this.scale,
    };
  }

  /** Get container-relative screen coordinates (without zoom transform) */
  private toScreenCoords(e: PointerEvent): { x: number; y: number } {
    const br = this.container.getBoundingClientRect();
    return {
      x: e.clientX - br.x,
      y: e.clientY - br.y,
    };
  }

  /** Apply current zoom/pan transform to the pieces layer */
  private applyTransform(): void {
    this.piecesLayer.style.transform =
      `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  /** Clamp pan so the puzzle doesn't go completely off-screen */
  private clampPan(): void {
    const cw = this.container.clientWidth;
    const ch = this.container.clientHeight;
    const sw = cw * this.scale;
    const sh = ch * this.scale;

    // Keep at least 20% of the scaled content visible on each axis.
    // When zoomed out (sw < cw), allow centering freely within the container.
    const marginPx = Math.min(cw, sw) * 0.2;
    const minPanX = Math.min(0, cw - sw + marginPx);
    const maxPanX = Math.max(0, cw - sw - marginPx) + (sw > cw ? 0 : (cw - sw) / 2);
    const minPanY = Math.min(0, ch - sh + marginPx);
    const maxPanY = Math.max(0, ch - sh - marginPx) + (sh > ch ? 0 : (ch - sh) / 2);

    this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
    this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));
  }

  /** Zoom toward a specific screen point */
  private zoomAt(screenX: number, screenY: number, newScale: number): void {
    newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    if (newScale === this.scale) return;

    // The point under the cursor in puzzle-space should stay fixed.
    // Before: puzzleX = (screenX - panX) / scale
    // After:  puzzleX = (screenX - newPanX) / newScale
    // So: newPanX = screenX - puzzleX * newScale
    const puzzleX = (screenX - this.panX) / this.scale;
    const puzzleY = (screenY - this.panY) / this.scale;

    this.scale = newScale;
    this.panX = screenX - puzzleX * newScale;
    this.panY = screenY - puzzleY * newScale;

    this.clampPan();
    this.applyTransform();
  }

  /** Hit test — isPointInPath on each PolyPiece's Path2D (back to front) */
  private hitTest(puzzleX: number, puzzleY: number): PolyPiece | null {
    const polyPieces = this.puzzle.polyPieces;
    for (let k = polyPieces.length - 1; k >= 0; --k) {
      const pp = polyPieces[k];
      if (pp.ctx.isPointInPath(pp.path, puzzleX - pp.x, puzzleY - pp.y)) {
        return pp;
      }
    }
    return null;
  }

  // --- Pointer tracking helpers ---

  private updatePointer(e: PointerEvent): void {
    const screen = this.toScreenCoords(e);
    for (const ap of this.activePointers) {
      if (ap.id === e.pointerId) {
        ap.x = screen.x;
        ap.y = screen.y;
        return;
      }
    }
  }

  private addPointer(e: PointerEvent): void {
    const screen = this.toScreenCoords(e);
    this.activePointers.push({ id: e.pointerId, x: screen.x, y: screen.y });
  }

  private removePointer(id: number): void {
    this.activePointers = this.activePointers.filter((p) => p.id !== id);
  }

  private pinchDistance(): number {
    if (this.activePointers.length < 2) return 0;
    const [a, b] = this.activePointers;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  private pinchCenter(): { x: number; y: number } {
    const [a, b] = this.activePointers;
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  // --- Event handlers ---

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    if (this.beginnerMode) return;
    if (this.dragging) return;

    const br = this.container.getBoundingClientRect();
    const screenX = e.clientX - br.x;
    const screenY = e.clientY - br.y;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.zoomAt(screenX, screenY, this.scale * zoomFactor);
    this.scheduleHiResRedraw();
  }

  private onPointerDown(e: PointerEvent): void {
    e.preventDefault();
    this.addPointer(e);
    this.container.setPointerCapture(e.pointerId);

    // Second finger → switch to pinch mode, cancel any drag/pan
    if (this.activePointers.length === 2) {
      this.dragging = null;
      this.panning = null;
      if (!this.beginnerMode) {
        this.pinchStartDist = this.pinchDistance();
        this.pinchStartScale = this.scale;
      }
      return;
    }

    // More than 2 fingers → ignore
    if (this.activePointers.length > 2) return;

    // Single finger/click
    const pos = this.toPuzzleCoords(e);
    const pp = this.hitTest(pos.x, pos.y);

    if (pp) {
      // Start dragging a piece — bring it to the very top
      const k = this.puzzle.polyPieces.indexOf(pp);
      this.puzzle.polyPieces.splice(k, 1);
      this.puzzle.polyPieces.push(pp);
      // העלאה לשכבה הגבוהה ביותר — מגדיל את zIndexSup כדי שכל לחיצה תקפיץ את החלק מעל לקודם
      this.puzzle.zIndexSup += 1;
      pp.canvas.style.zIndex = String(this.puzzle.zIndexSup);

      this.dragging = {
        pp,
        anchorX: pos.x,
        anchorY: pos.y,
        ppXInit: pp.x,
        ppYInit: pp.y,
      };
    } else if (!this.beginnerMode) {
      // Start panning on empty space (לא במצב מתחילים)
      const screen = this.toScreenCoords(e);
      this.panning = {
        anchorX: screen.x,
        anchorY: screen.y,
        panXInit: this.panX,
        panYInit: this.panY,
      };
    }

    // Double-tap detection (לא במצב מתחילים)
    if (!this.beginnerMode) {
      const now = Date.now();
      if (now - this.lastTapTime < 300 && !pp) {
        this.resetZoom();
        this.lastTapTime = 0;
      } else {
        this.lastTapTime = now;
      }
    }
  }

  private onPointerMove(e: PointerEvent): void {
    this.updatePointer(e);
    e.preventDefault();

    // Pinch zoom (2 fingers) — לא במצב מתחילים
    if (this.activePointers.length === 2 && !this.beginnerMode) {
      const dist = this.pinchDistance();
      if (this.pinchStartDist > 0) {
        const newScale = this.pinchStartScale * (dist / this.pinchStartDist);
        const center = this.pinchCenter();
        this.zoomAt(center.x, center.y, newScale);
      }
      return;
    }

    // Piece dragging
    if (this.dragging) {
      const pos = this.toPuzzleCoords(e);
      this.dragging.pp.moveTo(
        pos.x - this.dragging.anchorX + this.dragging.ppXInit,
        pos.y - this.dragging.anchorY + this.dragging.ppYInit,
      );
      return;
    }

    // Panning — לא במצב מתחילים
    if (this.panning && !this.beginnerMode) {
      const screen = this.toScreenCoords(e);
      this.panX = this.panning.panXInit + (screen.x - this.panning.anchorX);
      this.panY = this.panning.panYInit + (screen.y - this.panning.anchorY);
      this.clampPan();
      this.applyTransform();
    }
  }

  private onPointerUp(e: PointerEvent): void {
    e.preventDefault();
    this.container.releasePointerCapture(e.pointerId);
    this.removePointer(e.pointerId);

    // If we were pinching and one finger lifts, reset pinch state
    if (this.activePointers.length === 1) {
      this.pinchStartDist = 0;
      this.scheduleHiResRedraw();
      // Don't start a new drag/pan from the remaining finger
      return;
    }

    if (this.dragging) {
      this.checkMerge(this.dragging.pp);
      this.dragging = null;
    }

    if (this.panning) {
      this.panning = null;
    }
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
