/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

import type { TeacherSettings } from "$lib/types";
import { DEFAULT_SETTINGS } from "$lib/types";

const STORAGE_KEY = "sort-cards-settings";
const CURRENT_VERSION = 1;

/**
 * מחלקת ניהול הגדרות
 */
class SettingsStore {
  contentPackId = $state(DEFAULT_SETTINGS.contentPackId);
  cardsPerRound = $state(DEFAULT_SETTINGS.cardsPerRound);
  cooldownMs = $state(DEFAULT_SETTINGS.cooldownMs);
  resetCooldownOnTap = $state(DEFAULT_SETTINGS.resetCooldownOnTap);
  shuffleCards = $state(DEFAULT_SETTINGS.shuffleCards);
  shuffleRounds = $state(DEFAULT_SETTINGS.shuffleRounds);
  boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);
  gameMode = $state<"continuous" | "manual_end">(DEFAULT_SETTINGS.gameMode);
  voiceEnabled = $state(DEFAULT_SETTINGS.voiceEnabled);

  constructor() {
    if (typeof globalThis?.localStorage !== "undefined") {
      this.load();
    }

    // שמירה אוטומטית בכל שינוי
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
        this.contentPackId = parsed.contentPackId ?? DEFAULT_SETTINGS.contentPackId;
        this.cardsPerRound = parsed.cardsPerRound ?? DEFAULT_SETTINGS.cardsPerRound;
        this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
        this.resetCooldownOnTap = parsed.resetCooldownOnTap ?? DEFAULT_SETTINGS.resetCooldownOnTap;
        this.shuffleCards = parsed.shuffleCards ?? DEFAULT_SETTINGS.shuffleCards;
        this.shuffleRounds = parsed.shuffleRounds ?? DEFAULT_SETTINGS.shuffleRounds;
        this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
        this.gameMode = parsed.gameMode ?? DEFAULT_SETTINGS.gameMode;
        this.voiceEnabled = parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }

  toJSON(): TeacherSettings & { schemaVersion: number } {
    return {
      schemaVersion: CURRENT_VERSION,
      contentPackId: this.contentPackId,
      cardsPerRound: this.cardsPerRound,
      cooldownMs: this.cooldownMs,
      resetCooldownOnTap: this.resetCooldownOnTap,
      shuffleCards: this.shuffleCards,
      shuffleRounds: this.shuffleRounds,
      boosterEnabled: this.boosterEnabled,
      gameMode: this.gameMode,
      voiceEnabled: this.voiceEnabled,
    };
  }

  private save(): void {
    if (typeof window?.localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
  }

  reset(): void {
    this.contentPackId = DEFAULT_SETTINGS.contentPackId;
    this.cardsPerRound = DEFAULT_SETTINGS.cardsPerRound;
    this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
    this.resetCooldownOnTap = DEFAULT_SETTINGS.resetCooldownOnTap;
    this.shuffleCards = DEFAULT_SETTINGS.shuffleCards;
    this.shuffleRounds = DEFAULT_SETTINGS.shuffleRounds;
    this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
    this.gameMode = DEFAULT_SETTINGS.gameMode;
    this.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
  }
}

// ייצוא singleton
export const settings = new SettingsStore();
