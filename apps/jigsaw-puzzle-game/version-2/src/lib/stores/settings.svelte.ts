/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

import type { TeacherSettings, ShapeStyle, PieceFilter } from "$lib/types";
import { DEFAULT_SETTINGS, BEGINNER_MAX_GRID_INDEX } from "$lib/types";

const STORAGE_KEY = "jigsaw-puzzle-v2-settings";
const CURRENT_VERSION = 6;

class SettingsStore {
  imagePackId = $state(DEFAULT_SETTINGS.imagePackId);
  gridPresetIndex = $state(DEFAULT_SETTINGS.gridPresetIndex);
  shapeStyle = $state<ShapeStyle>(DEFAULT_SETTINGS.shapeStyle);
  proximity = $state(DEFAULT_SETTINGS.proximity);
  allowDisconnect = $state(DEFAULT_SETTINGS.allowDisconnect);
  showReferenceImage = $state(DEFAULT_SETTINGS.showReferenceImage);
  pieceFilter = $state<PieceFilter>(DEFAULT_SETTINGS.pieceFilter);
  shuffleImages = $state(DEFAULT_SETTINGS.shuffleImages);
  boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);
  voiceEnabled = $state(DEFAULT_SETTINGS.voiceEnabled);
  gameMode = $state<"continuous" | "manual_end">(DEFAULT_SETTINGS.gameMode);
  showContinueButton = $state(DEFAULT_SETTINGS.showContinueButton);
  beginnerMode = $state(DEFAULT_SETTINGS.beginnerMode);
  shufflePiecePlacement = $state(DEFAULT_SETTINGS.shufflePiecePlacement);
  studentLockMode = $state(DEFAULT_SETTINGS.studentLockMode);
  showRearrangeButton = $state(DEFAULT_SETTINGS.showRearrangeButton);
  adaptGridToImage = $state(DEFAULT_SETTINGS.adaptGridToImage);

  constructor() {
    if (typeof globalThis?.localStorage?.getItem === "function") {
      this.load();
    }

    $effect.root(() => {
      $effect(() => {
        this.toJSON();
        this.save();
      });
    });
  }

  private load(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.imagePackId = parsed.imagePackId ?? DEFAULT_SETTINGS.imagePackId;
        // מיגרציה מ-v1: הזזת gridPresetIndex ב-+1 (נוסף 2×1 בהתחלה של GRID_PRESETS)
        if ((parsed.schemaVersion ?? 1) < 2 && parsed.gridPresetIndex !== undefined) {
          this.gridPresetIndex = parsed.gridPresetIndex + 1;
        } else {
          this.gridPresetIndex = parsed.gridPresetIndex ?? DEFAULT_SETTINGS.gridPresetIndex;
        }
        this.shapeStyle = parsed.shapeStyle ?? DEFAULT_SETTINGS.shapeStyle;
        this.proximity = parsed.proximity ?? DEFAULT_SETTINGS.proximity;
        this.allowDisconnect = parsed.allowDisconnect ?? DEFAULT_SETTINGS.allowDisconnect;
        this.showReferenceImage = parsed.showReferenceImage ?? DEFAULT_SETTINGS.showReferenceImage;
        this.pieceFilter = parsed.pieceFilter ?? DEFAULT_SETTINGS.pieceFilter;
        this.shuffleImages = parsed.shuffleImages ?? DEFAULT_SETTINGS.shuffleImages;
        this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
        this.voiceEnabled = parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
        this.gameMode = parsed.gameMode ?? DEFAULT_SETTINGS.gameMode;
        this.showContinueButton = parsed.showContinueButton ?? DEFAULT_SETTINGS.showContinueButton;
        this.beginnerMode = parsed.beginnerMode ?? DEFAULT_SETTINGS.beginnerMode;
        this.shufflePiecePlacement = parsed.shufflePiecePlacement ?? DEFAULT_SETTINGS.shufflePiecePlacement;
        this.studentLockMode = parsed.studentLockMode ?? DEFAULT_SETTINGS.studentLockMode;
        this.showRearrangeButton = parsed.showRearrangeButton ?? DEFAULT_SETTINGS.showRearrangeButton;
        this.adaptGridToImage = parsed.adaptGridToImage ?? DEFAULT_SETTINGS.adaptGridToImage;

        // אכיפת הגבלת grid במצב מתחילים
        if (this.beginnerMode && this.gridPresetIndex > BEGINNER_MAX_GRID_INDEX) {
          this.gridPresetIndex = BEGINNER_MAX_GRID_INDEX;
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }

  toJSON(): TeacherSettings & { schemaVersion: number } {
    return {
      schemaVersion: CURRENT_VERSION,
      imagePackId: this.imagePackId,
      gridPresetIndex: this.gridPresetIndex,
      shapeStyle: this.shapeStyle,
      proximity: this.proximity,
      allowDisconnect: this.allowDisconnect,
      showReferenceImage: this.showReferenceImage,
      pieceFilter: this.pieceFilter,
      shuffleImages: this.shuffleImages,
      boosterEnabled: this.boosterEnabled,
      voiceEnabled: this.voiceEnabled,
      gameMode: this.gameMode,
      showContinueButton: this.showContinueButton,
      beginnerMode: this.beginnerMode,
      shufflePiecePlacement: this.shufflePiecePlacement,
      studentLockMode: this.studentLockMode,
      showRearrangeButton: this.showRearrangeButton,
      adaptGridToImage: this.adaptGridToImage,
    };
  }

  private save(): void {
    if (typeof globalThis?.localStorage?.setItem !== "function") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
  }

  reset(): void {
    this.imagePackId = DEFAULT_SETTINGS.imagePackId;
    this.gridPresetIndex = DEFAULT_SETTINGS.gridPresetIndex;
    this.shapeStyle = DEFAULT_SETTINGS.shapeStyle;
    this.proximity = DEFAULT_SETTINGS.proximity;
    this.allowDisconnect = DEFAULT_SETTINGS.allowDisconnect;
    this.showReferenceImage = DEFAULT_SETTINGS.showReferenceImage;
    this.pieceFilter = DEFAULT_SETTINGS.pieceFilter;
    this.shuffleImages = DEFAULT_SETTINGS.shuffleImages;
    this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
    this.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
    this.gameMode = DEFAULT_SETTINGS.gameMode;
    this.showContinueButton = DEFAULT_SETTINGS.showContinueButton;
    this.beginnerMode = DEFAULT_SETTINGS.beginnerMode;
    this.shufflePiecePlacement = DEFAULT_SETTINGS.shufflePiecePlacement;
    this.studentLockMode = DEFAULT_SETTINGS.studentLockMode;
    this.showRearrangeButton = DEFAULT_SETTINGS.showRearrangeButton;
    this.adaptGridToImage = DEFAULT_SETTINGS.adaptGridToImage;
  }

  /** הפעלת/כיבוי מצב מתחילים — כולל אכיפת הגבלת grid וכיבוי ערבוב */
  setBeginnerMode(enabled: boolean): void {
    this.beginnerMode = enabled;
    if (enabled) {
      if (this.gridPresetIndex > BEGINNER_MAX_GRID_INDEX) {
        this.gridPresetIndex = BEGINNER_MAX_GRID_INDEX;
      }
      this.shufflePiecePlacement = false;
    }
  }
}

export const settings = new SettingsStore();
