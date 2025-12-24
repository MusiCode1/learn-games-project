/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

import type { TeacherSettings } from "$lib/types";
import { DEFAULT_SETTINGS } from "$lib/types";

const STORAGE_KEY = "train-addition-settings";

// אל תשכח לשנות גרסה בעת ביצוע שינוי במערכת ההגדרות!
const CURRENT_VERSION = 4;

/**
 * מחלקת ניהול הגדרות
 */
class SettingsStore {
  // הגדרות
  maxA = $state(DEFAULT_SETTINGS.maxA);
  maxB = $state(DEFAULT_SETTINGS.maxB);
  choicesCount = $state<2 | 3>(DEFAULT_SETTINGS.choicesCount);
  cooldownMs = $state(DEFAULT_SETTINGS.cooldownMs);
  maxWrongAttempts = $state(DEFAULT_SETTINGS.maxWrongAttempts);
  inputMode = $state<"tap" | "drag" | "both">(DEFAULT_SETTINGS.inputMode);
  voiceEnabled = $state(DEFAULT_SETTINGS.voiceEnabled);

  // מצב משחק החדש
  gameMode = $state<"continuous" | "manual_end">(DEFAULT_SETTINGS.gameMode);

  // חיזוקים (רק בוליאני, השאר בשירות)
  boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);

  constructor() {
    // טעינה ראשונית מ-localStorage
    if (typeof globalThis?.localStorage !== "undefined") {
      this.load();
    }

    // שמירה אוטומטית בכל שינוי
    $effect.root(() => {
      $effect(() => {
        this.toJSON(); // מעקב אחר כל התלויות
        this.save();
      });
    });
  }

  /**
   * טעינת הגדרות מ-localStorage
   */
  private load(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const version = parsed.schemaVersion ?? 0;

        this.maxA = parsed.maxA ?? DEFAULT_SETTINGS.maxA;
        this.maxB = parsed.maxB ?? DEFAULT_SETTINGS.maxB;
        this.choicesCount =
          parsed.choicesCount ?? DEFAULT_SETTINGS.choicesCount;

        // מיגרציה לגרסה 3: איפוס cooldownMs
        if (version < 3) {
          this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
        } else {
          this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
        }

        this.maxWrongAttempts =
          parsed.maxWrongAttempts ?? DEFAULT_SETTINGS.maxWrongAttempts;
        this.inputMode = parsed.inputMode ?? DEFAULT_SETTINGS.inputMode;
        this.voiceEnabled =
          parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
        this.boosterEnabled =
          parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;

        // מיגרציה לגרסה 4: gameMode
        if (version < 4) {
          // אם היה מוגדר לולאה אוטומטית, נעבור למצב רציף
          if (parsed.autoBoosterLoop) {
            this.gameMode = "continuous";
          } else {
            this.gameMode = "manual_end";
          }
        } else {
          this.gameMode = parsed.gameMode ?? DEFAULT_SETTINGS.gameMode;
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }

  /**
   * המרה לאובייקט JSON
   */
  toJSON(): TeacherSettings & { schemaVersion: number } {
    return {
      schemaVersion: CURRENT_VERSION,
      maxA: this.maxA,
      maxB: this.maxB,
      choicesCount: this.choicesCount,
      cooldownMs: this.cooldownMs,
      maxWrongAttempts: this.maxWrongAttempts,
      inputMode: this.inputMode,
      voiceEnabled: this.voiceEnabled,
      boosterEnabled: this.boosterEnabled,
      gameMode: this.gameMode,
    };
  }

  /**
   * שמירה ל-localStorage
   */
  private save(): void {
    if (typeof window?.localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
  }

  /**
   * איפוס להגדרות ברירת מחדל
   */
  reset(): void {
    this.maxA = DEFAULT_SETTINGS.maxA;
    this.maxB = DEFAULT_SETTINGS.maxB;
    this.choicesCount = DEFAULT_SETTINGS.choicesCount;
    this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
    this.maxWrongAttempts = DEFAULT_SETTINGS.maxWrongAttempts;
    this.inputMode = DEFAULT_SETTINGS.inputMode;
    this.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
    this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
    this.gameMode = DEFAULT_SETTINGS.gameMode;
  }
}

// ייצוא singleton
// ייצוא singleton
console.log("Initializing SettingsStore module...");
let _settings: SettingsStore;
try {
  _settings = new SettingsStore();
  console.log("SettingsStore instance created successfully");
} catch (e) {
  console.error("Error creating SettingsStore:", e);
  throw e;
}
export const settings = _settings;
