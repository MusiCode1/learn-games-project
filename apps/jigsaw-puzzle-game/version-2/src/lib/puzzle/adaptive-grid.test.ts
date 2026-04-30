/**
 * בדיקות ל-adaptGridToImage —
 * מתאים את ממדי ה-grid לפרופורציות התמונה.
 */

import { describe, it, expect } from "vitest";
import { adaptGridToImage } from "./adaptive-grid";

describe("adaptGridToImage", () => {
  it("מחזיר 2x2 עבור תמונה ריבועית עם 4 חלקים מטרה", () => {
    const result = adaptGridToImage({
      targetPieceCount: 4,
      imageAspectRatio: 1.0,
    });

    expect(result).toEqual({ columns: 2, rows: 2 });
  });

  it("מחזיר 3x2 עבור תמונה רחבה (3:2) עם 6 חלקים מטרה", () => {
    const result = adaptGridToImage({
      targetPieceCount: 6,
      imageAspectRatio: 1.5,
    });

    expect(result).toEqual({ columns: 3, rows: 2 });
  });

  it("מחזיר 2x3 עבור תמונה אנכית (2:3) עם 6 חלקים מטרה", () => {
    const result = adaptGridToImage({
      targetPieceCount: 6,
      imageAspectRatio: 2 / 3,
    });

    expect(result).toEqual({ columns: 2, rows: 3 });
  });

  it("מעדיף יחס נכון על פני מספר חלקים מדויק — תמונה רחבה מאוד (16:9) עם 4 חלקים", () => {
    const result = adaptGridToImage({
      targetPieceCount: 4,
      imageAspectRatio: 16 / 9,
    });

    // 2x2 (יחס 1.0) רחוק מאוד מ-1.78
    // 3x2 (יחס 1.5) קרוב יותר ל-1.78
    expect(result).toEqual({ columns: 3, rows: 2 });
  });

  it("מחזיר לפחות 2 חלקים בכל ציר — אין שורה/עמודה בודדת", () => {
    const result = adaptGridToImage({
      targetPieceCount: 2,
      imageAspectRatio: 1.0,
    });

    expect(result.columns).toBeGreaterThanOrEqual(2);
    expect(result.rows).toBeGreaterThanOrEqual(2);
  });

  it("לא חורג בהרבה ממספר החלקים המבוקש — 6 חלקים בתמונה ריבועית מחזיר 6 ולא 9 או 16", () => {
    const result = adaptGridToImage({
      targetPieceCount: 6,
      imageAspectRatio: 1.0,
    });

    const total = result.columns * result.rows;
    expect(total).toBeLessThanOrEqual(8);
    expect(total).toBeGreaterThanOrEqual(4);
  });
});
