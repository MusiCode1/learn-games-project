/**
 * Twist functions — מחוללי צורת קצוות פאזל
 *
 * כל twist function מקבלת Side עם 2 נקודות (קצוות הצלע)
 * ומחליפה אותן ברצף Bezier curves שיוצר tab/slot.
 *
 * ca, cb — נקודות הפינה הנגדית (משמשות לחישוב כיוון הבליטה)
 */

import { Point, Segment, alea } from "./math";
import type { Side } from "./side";
import type { ShapeStyle } from "$lib/types";

export type TwistFunction = (side: Side, ca: Point, cb: Point) => void;

/**
 * twist0 — classic mushroom tab/slot (6 Bezier curves)
 * The signature jigsaw shape — asymmetric mushroom head
 */
export function twist0(side: Side, ca: Point, cb: Point): void {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx();
  const dyh = seg0.dy();

  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5);
  const mid1 = seg1.pointOnRelative(0.5);

  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx();
  const dyv = segMid.dy();

  const scalex = alea(0.8, 1);
  const scaley = alea(0.9, 1);
  const mid = alea(0.45, 0.55);

  function pointAt(coeffh: number, coeffv: number): Point {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv,
    );
  }

  const pa = pointAt(mid - (1 / 12) * scalex, (1 / 12) * scaley);
  const pb = pointAt(mid - (2 / 12) * scalex, (3 / 12) * scaley);
  const pc = pointAt(mid, (4 / 12) * scaley);
  const pd = pointAt(mid + (2 / 12) * scalex, (3 / 12) * scaley);
  const pe = pointAt(mid + (1 / 12) * scalex, (1 / 12) * scaley);

  side.points = [
    seg0.p1,
    new Point(seg0.p1.x + (5 / 12) * dxh * 0.52, seg0.p1.y + (5 / 12) * dyh * 0.52),
    new Point(pa.x - (1 / 12) * dxv * 0.72, pa.y - (1 / 12) * dyv * 0.72),
    pa,
    new Point(pa.x + (1 / 12) * dxv * 0.72, pa.y + (1 / 12) * dyv * 0.72),
    new Point(pb.x - (1 / 12) * dxv * 0.92, pb.y - (1 / 12) * dyv * 0.92),
    pb,
    new Point(pb.x + (1 / 12) * dxv * 0.52, pb.y + (1 / 12) * dyv * 0.52),
    new Point(pc.x - (2 / 12) * dxh * 0.4, pc.y - (2 / 12) * dyh * 0.4),
    pc,
    new Point(pc.x + (2 / 12) * dxh * 0.4, pc.y + (2 / 12) * dyh * 0.4),
    new Point(pd.x + (1 / 12) * dxv * 0.52, pd.y + (1 / 12) * dyv * 0.52),
    pd,
    new Point(pd.x - (1 / 12) * dxv * 0.92, pd.y - (1 / 12) * dyv * 0.92),
    new Point(pe.x + (1 / 12) * dxv * 0.72, pe.y + (1 / 12) * dyv * 0.72),
    pe,
    new Point(pe.x - (1 / 12) * dxv * 0.72, pe.y - (1 / 12) * dyv * 0.72),
    new Point(seg0.p2.x - (5 / 12) * dxh * 0.52, seg0.p2.y - (5 / 12) * dyh * 0.52),
    seg0.p2,
  ];
  side.type = "z";
}

/**
 * twist1 — triangle protrusion (degenerate Beziers)
 */
export function twist1(side: Side, ca: Point, cb: Point): void {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx();
  const dyh = seg0.dy();

  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5);
  const mid1 = seg1.pointOnRelative(0.5);

  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx();
  const dyv = segMid.dy();

  function pointAt(coeffh: number, coeffv: number): Point {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv,
    );
  }

  const pa = pointAt(alea(0.3, 0.35), alea(-0.05, 0.05));
  const pb = pointAt(alea(0.45, 0.55), alea(0.2, 0.3));
  const pc = pointAt(alea(0.65, 0.78), alea(-0.05, 0.05));

  side.points = [
    seg0.p1,
    seg0.p1,
    pa,
    pa,
    pa,
    pb,
    pb,
    pb,
    pc,
    pc,
    pc,
    seg0.p2,
    seg0.p2,
  ];
  side.type = "z";
}

/**
 * twist2 — round single smooth curve bulge
 */
export function twist2(side: Side, ca: Point, cb: Point): void {
  const seg0 = new Segment(side.points[0], side.points[1]);
  const dxh = seg0.dx();
  const dyh = seg0.dy();

  const seg1 = new Segment(ca, cb);
  const mid0 = seg0.pointOnRelative(0.5);
  const mid1 = seg1.pointOnRelative(0.5);

  const segMid = new Segment(mid0, mid1);
  const dxv = segMid.dx();
  const dyv = segMid.dy();

  function pointAt(coeffh: number, coeffv: number): Point {
    return new Point(
      seg0.p1.x + coeffh * dxh + coeffv * dxv,
      seg0.p1.y + coeffh * dyh + coeffv * dyv,
    );
  }

  const hmid = alea(0.45, 0.55);
  const vmid = alea(0.4, 0.5);
  const pc = pointAt(hmid, vmid);
  let sega = new Segment(seg0.p1, pc);
  const pb = sega.pointOnRelative(2 / 3);
  sega = new Segment(seg0.p2, pc);
  const pd = sega.pointOnRelative(2 / 3);

  side.points = [seg0.p1, pb, pd, seg0.p2];
  side.type = "z";
}

/**
 * twist3 — straight (no modification, grid cuts)
 */
export function twist3(side: Side): void {
  side.points = [side.points[0], side.points[1]];
}

/** Get the twist function for a given shape style */
export function getTwistByStyle(style: ShapeStyle): TwistFunction {
  switch (style) {
    case "classic":
      return twist0;
    case "triangle":
      return twist1;
    case "round":
      return twist2;
    case "straight":
      return twist3;
  }
}
