/**
 * בדיקות אינטגרציה ל-Puzzle עם DOM אמיתי (vitest browser mode).
 *
 * דפוס לבדיקות עתידיות:
 * - בודקים דרך public API בלבד (constructor + init + destroy + polyPieces)
 * - שני helpers (`createTestImage`, `createTestContainer`) שניתן להוציא בעתיד ל-`__test-utils__/dom.ts`
 * - cleanup ב-afterEach
 */

import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { Puzzle } from "./puzzle";

async function createTestImage(w: number, h: number): Promise<HTMLImageElement> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "red");
  grad.addColorStop(1, "blue");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL();
  });
}

function createTestContainer(w: number, h: number): HTMLElement {
  const div = document.createElement("div");
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.position = "absolute";
  document.body.appendChild(div);
  return div;
}

describe("Puzzle — pre-merge integration (DOM)", () => {
  let container: HTMLElement;
  let image: HTMLImageElement;

  beforeEach(async () => {
    container = createTestContainer(800, 600);
    image = await createTestImage(400, 400);
  });

  afterEach(() => {
    container.remove();
  });

  test("regression: prePlacedPieces=false leaves all polyPieces as singles", () => {
    const puzzle = new Puzzle({
      container,
      image,
      columns: 2,
      rows: 2,
      shapeStyle: "classic",
      prePlacedPieces: false,
    });
    puzzle.init();

    expect(puzzle.polyPieces).toHaveLength(4);
    expect(puzzle.polyPieces.every((pp) => pp.pieces.length === 1)).toBe(true);

    puzzle.destroy();
  });

  test("prePlacedPieces=true + top-left + count=1: 1 single at (0,0) + merged group of 3", () => {
    const puzzle = new Puzzle({
      container,
      image,
      columns: 2,
      rows: 2,
      shapeStyle: "classic",
      prePlacedPieces: true,
      loosePieceSelection: "top-left",
      loosePiecesCount: 1,
    });
    puzzle.init();

    expect(puzzle.polyPieces).toHaveLength(2);

    const singles = puzzle.polyPieces.filter((pp) => pp.pieces.length === 1);
    const merged = puzzle.polyPieces.filter((pp) => pp.pieces.length > 1);

    expect(singles).toHaveLength(1);
    expect(merged).toHaveLength(1);

    expect(singles[0].pieces[0]).toMatchObject({ kx: 0, ky: 0 });
    expect(merged[0].pieces).toHaveLength(3);

    puzzle.destroy();
  });

  test("prePlacedPieces=true + top-left + count=2: 2 singles at top row + merged group of 2", () => {
    const puzzle = new Puzzle({
      container,
      image,
      columns: 2,
      rows: 2,
      shapeStyle: "classic",
      prePlacedPieces: true,
      loosePieceSelection: "top-left",
      loosePiecesCount: 2,
    });
    puzzle.init();

    expect(puzzle.polyPieces).toHaveLength(3); // 2 singles + 1 merged

    const singles = puzzle.polyPieces.filter((pp) => pp.pieces.length === 1);
    const merged = puzzle.polyPieces.filter((pp) => pp.pieces.length > 1);

    expect(singles).toHaveLength(2);
    expect(merged).toHaveLength(1);
    expect(merged[0].pieces).toHaveLength(2);

    // החלקים החופשיים הם (0,0) ו-(1,0)
    const looseCoords = singles
      .map((s) => `${s.pieces[0].kx},${s.pieces[0].ky}`)
      .sort();
    expect(looseCoords).toEqual(["0,0", "1,0"]);

    puzzle.destroy();
  });
});
