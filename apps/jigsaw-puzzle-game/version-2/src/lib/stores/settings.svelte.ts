/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

import type {
  TeacherSettings,
  ShapeStyle,
  PieceFilter,
  SettingsProfile,
  LoosePieceSelection,
} from "$lib/types";
import { DEFAULT_SETTINGS, BEGINNER_MAX_GRID_INDEX } from "$lib/types";

const STORAGE_KEY = "jigsaw-puzzle-v2-settings";
const CURRENT_VERSION = 9;

/** הגדרות לפי פרופיל */
const PROFILE_PRESETS: Record<Exclude<SettingsProfile, "custom">, Partial<TeacherSettings>> = {
  beginner: {
    beginnerMode: true,
    gridPresetIndex: 1, // 2×2
    shufflePiecePlacement: false,
    adaptGridToImage: true,
    studentLockMode: true,
    proximity: 70,
    shapeStyle: "classic",
    prePlacedPieces: true,
    loosePieceSelection: "top-left",
    loosePiecesCount: 1,
  },
  intermediate: {
    beginnerMode: false,
    gridPresetIndex: 3, // 3×3
    shufflePiecePlacement: true,
    adaptGridToImage: true,
    studentLockMode: false,
    proximity: 50,
    shapeStyle: "classic",
    prePlacedPieces: false,
    loosePieceSelection: "top-left",
    loosePiecesCount: 1,
  },
  advanced: {
    beginnerMode: false,
    gridPresetIndex: 5, // 4×4
    shufflePiecePlacement: true,
    adaptGridToImage: false,
    studentLockMode: false,
    proximity: 25,
    shapeStyle: "classic",
    prePlacedPieces: false,
    loosePieceSelection: "top-left",
    loosePiecesCount: 1,
  },
};

/** ההגדרות שמשפיעות על הפרופיל — שינוי בהן יעביר ל-custom */
const PROFILE_AFFECTING_KEYS: (keyof TeacherSettings)[] = [
  "beginnerMode",
  "gridPresetIndex",
  "shufflePiecePlacement",
  "adaptGridToImage",
  "studentLockMode",
  "proximity",
  "shapeStyle",
  "prePlacedPieces",
  "loosePieceSelection",
  "loosePiecesCount",
];

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
  organizedGap = $state(DEFAULT_SETTINGS.organizedGap);
  prePlacedPieces = $state(DEFAULT_SETTINGS.prePlacedPieces);
  loosePieceSelection = $state<LoosePieceSelection>(DEFAULT_SETTINGS.loosePieceSelection);
  loosePiecesCount = $state(DEFAULT_SETTINGS.loosePiecesCount);
  activeProfile = $state<SettingsProfile>(DEFAULT_SETTINGS.activeProfile);

  /** דגל פנימי שמונע מעבר ל-custom בזמן applyProfile */
  private _applyingProfile = false;
  /** ערכי ההגדרות האחרונים לזיהוי שינוי ידני */
  private _lastProfileValues: Partial<TeacherSettings> = {};

  constructor() {
    if (typeof globalThis?.localStorage?.getItem === "function") {
      this.load();
    }

    // שמירת ערכים נוכחיים לזיהוי שינויים
    this._snapshotProfileValues();

    $effect.root(() => {
      $effect(() => {
        this.toJSON();
        this.save();
      });

      // זיהוי שינוי ידני בהגדרות — מעבר ל-custom
      $effect(() => {
        // קריאה לכל השדות הרלוונטיים כדי ליצור dependency
        const current = {
          beginnerMode: this.beginnerMode,
          gridPresetIndex: this.gridPresetIndex,
          shufflePiecePlacement: this.shufflePiecePlacement,
          adaptGridToImage: this.adaptGridToImage,
          studentLockMode: this.studentLockMode,
          proximity: this.proximity,
          shapeStyle: this.shapeStyle,
          prePlacedPieces: this.prePlacedPieces,
          loosePieceSelection: this.loosePieceSelection,
          loosePiecesCount: this.loosePiecesCount,
        };

        if (this._applyingProfile) return;

        // בדיקה אם יש שינוי מהערכים האחרונים
        for (const key of PROFILE_AFFECTING_KEYS) {
          if (current[key as keyof typeof current] !== this._lastProfileValues[key]) {
            if (this.activeProfile !== "custom") {
              this.activeProfile = "custom";
            }
            break;
          }
        }

        this._lastProfileValues = current;
      });
    });
  }

  private _snapshotProfileValues(): void {
    this._lastProfileValues = {
      beginnerMode: this.beginnerMode,
      gridPresetIndex: this.gridPresetIndex,
      shufflePiecePlacement: this.shufflePiecePlacement,
      adaptGridToImage: this.adaptGridToImage,
      studentLockMode: this.studentLockMode,
      proximity: this.proximity,
      shapeStyle: this.shapeStyle,
      prePlacedPieces: this.prePlacedPieces,
      loosePieceSelection: this.loosePieceSelection,
      loosePiecesCount: this.loosePiecesCount,
    };
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
        this.organizedGap = parsed.organizedGap ?? DEFAULT_SETTINGS.organizedGap;
        this.prePlacedPieces = parsed.prePlacedPieces ?? DEFAULT_SETTINGS.prePlacedPieces;
        this.loosePieceSelection = parsed.loosePieceSelection ?? DEFAULT_SETTINGS.loosePieceSelection;
        this.loosePiecesCount = parsed.loosePiecesCount ?? DEFAULT_SETTINGS.loosePiecesCount;

        // מיגרציה מ-v6 (ומטה): משתמש קיים מקבל custom
        if (!parsed.activeProfile) {
          this.activeProfile = "custom";
        } else {
          this.activeProfile = parsed.activeProfile;
        }

        // אכיפת הגבלת grid במצב מתחילים
        if (this.beginnerMode && this.gridPresetIndex > BEGINNER_MAX_GRID_INDEX) {
          this.gridPresetIndex = BEGINNER_MAX_GRID_INDEX;
        }

        // עדכון snapshot אחרי load
        this._snapshotProfileValues();
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    // אם אין saved — משתמש חדש — נשאר עם ברירת המחדל (beginner)
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
      organizedGap: this.organizedGap,
      prePlacedPieces: this.prePlacedPieces,
      loosePieceSelection: this.loosePieceSelection,
      loosePiecesCount: this.loosePiecesCount,
      activeProfile: this.activeProfile,
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
    this.organizedGap = DEFAULT_SETTINGS.organizedGap;
    this.prePlacedPieces = DEFAULT_SETTINGS.prePlacedPieces;
    this.loosePieceSelection = DEFAULT_SETTINGS.loosePieceSelection;
    this.loosePiecesCount = DEFAULT_SETTINGS.loosePiecesCount;
    this.activeProfile = DEFAULT_SETTINGS.activeProfile;
    this._snapshotProfileValues();
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

  /** סימון ידני של הפרופיל כ-custom — לקריאה מ-UI כשמשתמש משנה הגדרה */
  markAsCustom(): void {
    if (this.activeProfile !== "custom") {
      this.activeProfile = "custom";
      this._snapshotProfileValues();
    }
  }

  /** החלת פרופיל — custom לא משנה הגדרות, רק מסמן */
  applyProfile(profile: SettingsProfile): void {
    this._applyingProfile = true;

    this.activeProfile = profile;

    if (profile !== "custom") {
      const preset = PROFILE_PRESETS[profile];
      if (preset.beginnerMode !== undefined) this.beginnerMode = preset.beginnerMode;
      if (preset.gridPresetIndex !== undefined) this.gridPresetIndex = preset.gridPresetIndex;
      if (preset.shufflePiecePlacement !== undefined) this.shufflePiecePlacement = preset.shufflePiecePlacement;
      if (preset.adaptGridToImage !== undefined) this.adaptGridToImage = preset.adaptGridToImage;
      if (preset.studentLockMode !== undefined) this.studentLockMode = preset.studentLockMode;
      if (preset.proximity !== undefined) this.proximity = preset.proximity;
      if (preset.shapeStyle !== undefined) this.shapeStyle = preset.shapeStyle;
      if (preset.prePlacedPieces !== undefined) this.prePlacedPieces = preset.prePlacedPieces;
      if (preset.loosePieceSelection !== undefined) this.loosePieceSelection = preset.loosePieceSelection;
      if (preset.loosePiecesCount !== undefined) this.loosePiecesCount = preset.loosePiecesCount;
    }

    this._snapshotProfileValues();
    this._applyingProfile = false;
  }
}

export const settings = new SettingsStore();
