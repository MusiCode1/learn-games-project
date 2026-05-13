/**
 * בדיקות לפונקציות העזר של pre-merge —
 * בחירת חלק חופשי, חישוב סדר מיזוג, וחישוב לייאאוט.
 */

import { describe, it, expect } from "vitest";
import {
  pickLooseIndices,
  gridIndexToCoords,
  computeMergePlan,
} from "./pre-merge";

describe("pickLooseIndices — count=1 (default)", () => {
  it("top-left mode returns [0] regardless of rng", () => {
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "top-left", rng: () => 0.99 }),
    ).toEqual([0]);
  });

  it("random mode uses rng to pick within grid bounds", () => {
    // rng=0.5 ב-grid 3x3 → floor(0.5 * 9) = 4
    expect(
      pickLooseIndices({ nx: 3, ny: 3, mode: "random", rng: () => 0.5 }),
    ).toEqual([4]);
  });

  it("random with rng=0 returns [0]", () => {
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "random", rng: () => 0 }),
    ).toEqual([0]);
  });

  it("random with rng just below 1 returns last index", () => {
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "random", rng: () => 0.9999 }),
    ).toEqual([3]);
  });
});

describe("pickLooseIndices — count > 1", () => {
  it("top-left + count=2 in 2x2: returns first two row-major indices [0, 1]", () => {
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "top-left", count: 2 }),
    ).toEqual([0, 1]);
  });

  it("top-left + count=3 in 3x3: returns [0, 1, 2] (top row)", () => {
    expect(
      pickLooseIndices({ nx: 3, ny: 3, mode: "top-left", count: 3 }),
    ).toEqual([0, 1, 2]);
  });

  it("random + count=2 returns 2 distinct indices within bounds", () => {
    const result = pickLooseIndices({ nx: 3, ny: 3, mode: "random", count: 2 });
    expect(result).toHaveLength(2);
    expect(new Set(result).size).toBe(2);
    result.forEach((idx) => {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(9);
    });
  });

  it("random + count + deterministic rng: distinct values without replacement", () => {
    // rng מחזיר 0, 0, 0 ברצף — בלי דגימה ללא חזרה היינו מקבלים [0,0,0]
    let calls = 0;
    const rng = () => {
      calls++;
      return 0; // תמיד בוחר את האינדקס הראשון בבריכה שנותרה
    };
    const result = pickLooseIndices({ nx: 3, ny: 3, mode: "random", count: 3, rng });
    expect(result).toEqual([0, 1, 2]); // pool: [0,1,...8] → pick 0 → [1,2...] → pick 1 → [2,...] → pick 2
    expect(new Set(result).size).toBe(3);
  });

  it("count clamped to nx*ny - 1 (can't leave everything loose)", () => {
    // 2x2 + count=10 → clamp ל-3
    const result = pickLooseIndices({ nx: 2, ny: 2, mode: "top-left", count: 10 });
    expect(result).toHaveLength(3);
  });

  it("count<=0 clamped to 1", () => {
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "top-left", count: 0 }),
    ).toEqual([0]);
    expect(
      pickLooseIndices({ nx: 2, ny: 2, mode: "top-left", count: -5 }),
    ).toEqual([0]);
  });
});

describe("computeMergePlan — count > 1", () => {
  it("top-left + count=2: 2 loose pieces, N-2 in mergeOrder", () => {
    const plan = computeMergePlan({ nx: 2, ny: 2, mode: "top-left", count: 2 });
    expect(plan.loose).toEqual([
      { kx: 0, ky: 0 },
      { kx: 1, ky: 0 },
    ]);
    expect(plan.mergeOrder).toHaveLength(2);
  });

  it("mergeOrder contains no loose pieces (count=2 in 3x3)", () => {
    const plan = computeMergePlan({ nx: 3, ny: 3, mode: "top-left", count: 2 });
    const looseSet = new Set(plan.loose.map((p) => `${p.kx},${p.ky}`));
    for (const m of plan.mergeOrder) {
      expect(looseSet.has(`${m.kx},${m.ky}`)).toBe(false);
    }
    expect(plan.mergeOrder).toHaveLength(7);
  });

  it("count=N-1: mergeOrder has only the anchor", () => {
    // 2x2 + count=3 → 3 loose, 1 anchor
    const plan = computeMergePlan({ nx: 2, ny: 2, mode: "top-left", count: 3 });
    expect(plan.loose).toHaveLength(3);
    expect(plan.mergeOrder).toHaveLength(1);
  });
});

describe("gridIndexToCoords", () => {
  it("index 0 maps to top-left (0,0)", () => {
    expect(gridIndexToCoords(0, 3)).toEqual({ kx: 0, ky: 0 });
  });

  it("index 4 in 3-col grid maps to (1,1)", () => {
    expect(gridIndexToCoords(4, 3)).toEqual({ kx: 1, ky: 1 });
  });

  it("index 5 in 3-col grid maps to (2,1) — last column of second row", () => {
    expect(gridIndexToCoords(5, 3)).toEqual({ kx: 2, ky: 1 });
  });
});

describe("computeMergePlan — count=1 (default)", () => {
  it("top-left mode: loose is a single-piece array with (0,0)", () => {
    const plan = computeMergePlan({ nx: 2, ny: 2, mode: "top-left", rng: () => 0 });
    expect(plan.loose).toEqual([{ kx: 0, ky: 0 }]);
  });

  it("mergeOrder contains all pieces except the loose one (2x2 → 3 pieces)", () => {
    const plan = computeMergePlan({ nx: 2, ny: 2, mode: "top-left", rng: () => 0 });
    expect(plan.mergeOrder).toHaveLength(3);
    expect(plan.mergeOrder).not.toContainEqual({ kx: 0, ky: 0 });
  });

  it("mergeOrder is row-major (anchor first = leftmost-topmost non-loose piece)", () => {
    const plan = computeMergePlan({ nx: 2, ny: 2, mode: "top-left", rng: () => 0 });
    expect(plan.mergeOrder).toEqual([
      { kx: 1, ky: 0 }, // anchor — first non-loose in row-major
      { kx: 0, ky: 1 },
      { kx: 1, ky: 1 },
    ]);
  });

  it("random mode with middle piece loose (3x3, rng=0.5 → idx 4 = (1,1))", () => {
    const plan = computeMergePlan({ nx: 3, ny: 3, mode: "random", rng: () => 0.5 });
    expect(plan.loose).toEqual([{ kx: 1, ky: 1 }]);
    expect(plan.mergeOrder).toHaveLength(8);
    expect(plan.mergeOrder[0]).toEqual({ kx: 0, ky: 0 }); // anchor = top-left
  });
});
