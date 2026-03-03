/**
 * Side — צלע של חלק פאזל
 * מייצגת רצף נקודות (straight line או bezier curves)
 */

import { Point } from "./math";

export class Side {
  /** "d" = straight line, "z" = bezier curves */
  type: "d" | "z" | "" = "";
  /** Normalized coordinates (grid units) */
  points: Point[] = [];
  /** Pixel coordinates (after scaling) */
  scaledPoints: Point[] = [];

  /** Create a reversed copy (for shared edges between adjacent pieces) */
  reversed(): Side {
    const ns = new Side();
    ns.type = this.type;
    ns.points = this.points.slice().reverse();
    return ns;
  }

  /** Scale normalized points to pixel coordinates */
  scale(scalex: number, scaley: number): void {
    this.scaledPoints = this.points.map((p) => new Point(p.x * scalex, p.y * scaley));
  }

  /** Draw this side's path onto a canvas context or Path2D */
  drawPath(
    ctx: CanvasRenderingContext2D | Path2D,
    shiftx: number,
    shifty: number,
    withoutMoveTo?: boolean,
  ): void {
    if (!withoutMoveTo) {
      ctx.moveTo(this.scaledPoints[0].x + shiftx, this.scaledPoints[0].y + shifty);
    }
    if (this.type === "d") {
      ctx.lineTo(this.scaledPoints[1].x + shiftx, this.scaledPoints[1].y + shifty);
    } else {
      for (let k = 1; k < this.scaledPoints.length - 1; k += 3) {
        ctx.bezierCurveTo(
          this.scaledPoints[k].x + shiftx,
          this.scaledPoints[k].y + shifty,
          this.scaledPoints[k + 1].x + shiftx,
          this.scaledPoints[k + 1].y + shifty,
          this.scaledPoints[k + 2].x + shiftx,
          this.scaledPoints[k + 2].y + shifty,
        );
      }
    }
  }
}
