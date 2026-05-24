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

  it("שומר על מספר חלקים מינימלי — תמונה רחבה מאוד (16:9) עם 4 חלקים", () => {
    const result = adaptGridToImage({
      targetPieceCount: 4,
      imageAspectRatio: 16 / 9,
    });

    // עם targetPieceCount=4, מינימום 4 חלקים
    // 2x2 (יחס 1.0) יש לו 4 חלקים — מתאים
    // 4x1 (יחס 4.0) יש לו 4 חלקים — יחס רחוק
    expect(result.columns * result.rows).toBeGreaterThanOrEqual(4);
  });

  it("מחזיר 2x1 עבור 2 חלקים — תמיד אנכי (אחד ליד השני)", () => {
    // תמונה רחבה
    expect(adaptGridToImage({ targetPieceCount: 2, imageAspectRatio: 2.0 }))
      .toEqual({ columns: 2, rows: 1 });
    
    // תמונה ריבועית
    expect(adaptGridToImage({ targetPieceCount: 2, imageAspectRatio: 1.0 }))
      .toEqual({ columns: 2, rows: 1 });
    
    // תמונה אנכית — עדיין 2×1
    expect(adaptGridToImage({ targetPieceCount: 2, imageAspectRatio: 0.5 }))
      .toEqual({ columns: 2, rows: 1 });
  });

  it("שומר על מינימום חלקים — 6 חלקים בתמונה ריבועית", () => {
    const result = adaptGridToImage({
      targetPieceCount: 6,
      imageAspectRatio: 1.0,
    });

    const total = result.columns * result.rows;
    // מינימום 6 חלקים, אבל יכול להיות יותר אם היחס מצדיק
    expect(total).toBeGreaterThanOrEqual(6);
  });
});
