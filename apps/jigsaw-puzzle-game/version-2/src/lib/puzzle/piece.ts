/**
 * Piece — חלק בודד ברשת הפאזל
 * מכיל 4 צלעות (top, right, bottom, left)
 */

import { Side } from "./side";

export class Piece {
  /** Column index in grid */
  kx: number;
  /** Row index in grid */
  ky: number;
  /** Top side (left→right) */
  ts: Side;
  /** Right side (top→bottom) */
  rs: Side;
  /** Bottom side (right→left) */
  bs: Side;
  /** Left side (bottom→top) */
  ls: Side;

  constructor(kx: number, ky: number) {
    this.kx = kx;
    this.ky = ky;
    this.ts = new Side();
    this.rs = new Side();
    this.bs = new Side();
    this.ls = new Side();
  }

  /** Scale all sides from grid units to pixel coordinates */
  scale(scalex: number, scaley: number): void {
    this.ts.scale(scalex, scaley);
    this.rs.scale(scalex, scaley);
    this.bs.scale(scalex, scaley);
    this.ls.scale(scalex, scaley);
  }
}
