/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

import type { TeacherSettings } from "$lib/types";
import { DEFAULT_SETTINGS } from "$lib/types";

const STORAGE_KEY = "train-addition-settings";
const CURRENT_VERSION = 1;

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
        this.maxA = parsed.maxA ?? DEFAULT_SETTINGS.maxA;
        this.maxB = parsed.maxB ?? DEFAULT_SETTINGS.maxB;
        this.choicesCount =
          parsed.choicesCount ?? DEFAULT_SETTINGS.choicesCount;
        this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
        this.maxWrongAttempts =
          parsed.maxWrongAttempts ?? DEFAULT_SETTINGS.maxWrongAttempts;
        this.inputMode = parsed.inputMode ?? DEFAULT_SETTINGS.inputMode;
        this.voiceEnabled =
          parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
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
  }
}

// ייצוא singleton
export const settings = new SettingsStore();
