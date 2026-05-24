/**
 * בדיקות TDD למערכת פרופילים
 * שלב 3 מתוך תוכנית Settings Refactor
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushSync } from "svelte";

// מוקים ל-localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

// החלפת localStorage לפני ייבוא ה-store
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ייבוא הטיפוסים
import type { SettingsProfile } from "$lib/types";

describe("Settings Profiles", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  // 1. applyProfile("beginner") מגדיר ערכים נכונים
  it("applyProfile beginner sets correct values", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("beginner");

    expect(settings.activeProfile).toBe("beginner");
    expect(settings.beginnerMode).toBe(true);
    expect(settings.gridPresetIndex).toBe(1); // 2×2
    expect(settings.shufflePiecePlacement).toBe(false);
    expect(settings.adaptGridToImage).toBe(true);
    expect(settings.studentLockMode).toBe(true);
    expect(settings.proximity).toBe(70);
    expect(settings.shapeStyle).toBe("classic");
  });

  // 2. applyProfile("intermediate") מגדיר ערכים נכונים
  it("applyProfile intermediate sets correct values", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("intermediate");

    expect(settings.activeProfile).toBe("intermediate");
    expect(settings.beginnerMode).toBe(false);
    expect(settings.gridPresetIndex).toBe(3); // 3×3
    expect(settings.shufflePiecePlacement).toBe(true);
    expect(settings.adaptGridToImage).toBe(true);
    expect(settings.studentLockMode).toBe(false);
    expect(settings.proximity).toBe(50);
    expect(settings.shapeStyle).toBe("classic");
  });

  // 3. applyProfile("advanced") מגדיר ערכים נכונים
  it("applyProfile advanced sets correct values", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("advanced");

    expect(settings.activeProfile).toBe("advanced");
    expect(settings.beginnerMode).toBe(false);
    expect(settings.gridPresetIndex).toBe(5); // 4×4
    expect(settings.shufflePiecePlacement).toBe(true);
    expect(settings.adaptGridToImage).toBe(false);
    expect(settings.studentLockMode).toBe(false);
    expect(settings.proximity).toBe(25);
    expect(settings.shapeStyle).toBe("classic");
  });

  // 4. applyProfile("custom") לא משנה הגדרות
  it("applyProfile custom does not change other settings", async () => {
    const { settings } = await import("./settings.svelte.ts");

    // הגדר ערכים ספציפיים
    settings.beginnerMode = true;
    settings.gridPresetIndex = 2;
    settings.proximity = 40;

    settings.applyProfile("custom");

    expect(settings.activeProfile).toBe("custom");
    // הערכים לא השתנו
    expect(settings.beginnerMode).toBe(true);
    expect(settings.gridPresetIndex).toBe(2);
    expect(settings.proximity).toBe(40);
  });

  // 5. שינוי הגדרה ידנית → activeProfile="custom" — דרך מתודה ייעודית
  it("markAsCustom method sets activeProfile to custom", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("beginner");
    expect(settings.activeProfile).toBe("beginner");

    // שינוי ידני של הגדרה + סימון כ-custom
    settings.gridPresetIndex = 5;
    settings.markAsCustom();

    expect(settings.activeProfile).toBe("custom");
  });

  // 6. migration: משתמש קיים (v6) מקבל custom
  it("migration from v6 sets activeProfile to custom", async () => {
    // שמירת הגדרות v6 ב-localStorage (ללא activeProfile)
    localStorageMock.setItem(
      "jigsaw-puzzle-v2-settings",
      JSON.stringify({
        schemaVersion: 6,
        imagePackId: "animals",
        gridPresetIndex: 3,
        beginnerMode: false,
        shufflePiecePlacement: true,
        proximity: 30,
        // אין activeProfile
      })
    );

    const { settings } = await import("./settings.svelte.ts");

    expect(settings.activeProfile).toBe("custom");
  });

  // 7. משתמש חדש מקבל beginner
  it("new user gets beginner profile", async () => {
    // localStorage ריק
    const { settings } = await import("./settings.svelte.ts");

    expect(settings.activeProfile).toBe("beginner");
  });

  // 8. activeProfile נשמר בתוך toJSON
  it("activeProfile is included in toJSON", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("intermediate");

    const json = settings.toJSON();
    expect(json.activeProfile).toBe("intermediate");
    expect(json.schemaVersion).toBe(9);
  });
});

describe("Settings — prePlacedPieces", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  it("new user defaults: prePlacedPieces=false, loosePieceSelection=top-left", async () => {
    const { settings } = await import("./settings.svelte.ts");

    // עקבי עם דפוס קיים: DEFAULT_SETTINGS שמרני (false), פרופיל beginner מדליק
    expect(settings.prePlacedPieces).toBe(false);
    expect(settings.loosePieceSelection).toBe("top-left");
  });

  it("applyProfile(beginner) enables prePlacedPieces with top-left selection", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("beginner");

    expect(settings.prePlacedPieces).toBe(true);
    expect(settings.loosePieceSelection).toBe("top-left");
  });

  it("applyProfile(intermediate) keeps prePlacedPieces=false", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("intermediate");

    expect(settings.prePlacedPieces).toBe(false);
  });

  it("applyProfile(advanced) keeps prePlacedPieces=false", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("advanced");

    expect(settings.prePlacedPieces).toBe(false);
  });

  it("migration from v7: prePlacedPieces defaults to false, other fields preserved", async () => {
    localStorageMock.setItem(
      "jigsaw-puzzle-v2-settings",
      JSON.stringify({
        schemaVersion: 7,
        imagePackId: "animals",
        gridPresetIndex: 3,
        shufflePiecePlacement: false,
        organizedGap: 35,
        activeProfile: "intermediate",
      }),
    );

    const { settings } = await import("./settings.svelte.ts");

    // ערכים קיימים נשמרים
    expect(settings.gridPresetIndex).toBe(3);
    expect(settings.shufflePiecePlacement).toBe(false);
    expect(settings.organizedGap).toBe(35);
    expect(settings.activeProfile).toBe("intermediate");
    // שדות חדשים נופלים על ברירת מחדל
    expect(settings.prePlacedPieces).toBe(false);
    expect(settings.loosePieceSelection).toBe("top-left");
  });

  it("prePlacedPieces is in PROFILE_AFFECTING_KEYS: markAsCustom switches profile", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("intermediate");
    expect(settings.activeProfile).toBe("intermediate");

    // markAsCustom הוא ה-API שמופעל ע"י ה-UI כשמשתמש משנה הגדרה ידנית
    settings.prePlacedPieces = true;
    settings.markAsCustom();

    expect(settings.activeProfile).toBe("custom");
  });
});

describe("Settings — loosePiecesCount", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.resetModules();
  });

  it("new user defaults: loosePiecesCount=1", async () => {
    const { settings } = await import("./settings.svelte.ts");
    expect(settings.loosePiecesCount).toBe(1);
  });

  it("applyProfile(beginner) sets loosePiecesCount=1", async () => {
    const { settings } = await import("./settings.svelte.ts");
    settings.applyProfile("beginner");
    expect(settings.loosePiecesCount).toBe(1);
  });

  it("migration from v8: loosePiecesCount defaults to 1, other fields preserved", async () => {
    localStorageMock.setItem(
      "jigsaw-puzzle-v2-settings",
      JSON.stringify({
        schemaVersion: 8,
        prePlacedPieces: true,
        loosePieceSelection: "random",
        activeProfile: "custom",
      }),
    );

    const { settings } = await import("./settings.svelte.ts");

    expect(settings.loosePiecesCount).toBe(1);
    expect(settings.prePlacedPieces).toBe(true);
    expect(settings.loosePieceSelection).toBe("random");
  });

  it("manually changing loosePiecesCount switches profile to custom (via markAsCustom)", async () => {
    const { settings } = await import("./settings.svelte.ts");

    settings.applyProfile("beginner");
    expect(settings.activeProfile).toBe("beginner");

    settings.loosePiecesCount = 2;
    settings.markAsCustom();

    expect(settings.activeProfile).toBe("custom");
  });

  it("loosePiecesCount is included in toJSON", async () => {
    const { settings } = await import("./settings.svelte.ts");
    settings.loosePiecesCount = 3;

    const json = settings.toJSON();
    expect(json.loosePiecesCount).toBe(3);
  });
});
