/**
 * יסודות מתמטיים — Point, Segment, random utilities
 */

const mhypot = Math.hypot;
const mrandom = Math.random;
const mfloor = Math.floor;

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = Number(x);
    this.y = Number(y);
  }

  copy(): Point {
    return new Point(this.x, this.y);
  }

  distance(other: Point): number {
    return mhypot(this.x - other.x, this.y - other.y);
  }
}

export class Segment {
  p1: Point;
  p2: Point;

  constructor(p1: Point, p2: Point) {
    this.p1 = new Point(p1.x, p1.y);
    this.p2 = new Point(p2.x, p2.y);
  }

  dx(): number {
    return this.p2.x - this.p1.x;
  }

  dy(): number {
    return this.p2.y - this.p1.y;
  }

  length(): number {
    return mhypot(this.dx(), this.dy());
  }

  pointOnRelative(coeff: number): Point {
    const dx = this.dx();
    const dy = this.dy();
    return new Point(this.p1.x + coeff * dx, this.p1.y + coeff * dy);
  }
}

/** Random float in [min, max) */
export function alea(min: number, max?: number): number {
  if (max === undefined) return min * mrandom();
  return min + (max - min) * mrandom();
}

/** Random integer in [min, max) */
export function intAlea(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return mfloor(min + (max - min) * mrandom());
}

/** Fisher-Yates in-place shuffle */
export function arrayShuffle<T>(arr: T[]): T[] {
  for (let k = arr.length - 1; k >= 1; --k) {
    const k1 = intAlea(0, k + 1);
    const temp = arr[k];
    arr[k] = arr[k1];
    arr[k1] = temp;
  }
  return arr;
}
