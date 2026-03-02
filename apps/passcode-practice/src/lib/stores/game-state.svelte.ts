/**
 * State Machine למשחק תרגול סיסמא
 *
 * IDLE → (pressDigit) → ENTERING
 * ENTERING → (pressDigit, length < passcode.length) → ENTERING
 * ENTERING → (last digit, WRONG) → ERROR → (after cooldownMs) → IDLE
 * ENTERING → (last digit, CORRECT) → SUCCESS → (after 1200ms)
 *     ├─ reward due → REWARD → (completeReward) → IDLE
 *     └─ no reward  → IDLE
 */

import { settings } from "$lib/stores/settings.svelte";
import { speakSuccess, speakWrong, speakDigit } from "$lib/utils/tts";
import { get } from "svelte/store";
import { boosterService } from "learn-booster-kit";

export type GamePhase = "IDLE" | "ENTERING" | "ERROR" | "SUCCESS" | "REWARD";

class GameStateStore {
  // --- State Machine ---
  state = $state<GamePhase>("IDLE");

  // --- Input ---
  entered = $state<string>("");

  // --- Statistics ---
  correctCount = $state(0);
  winsSinceLastReward = $state(0);

  // --- Cooldown ---
  cooldownUntilTs = $state(0);

  // =================== DERIVED ===================

  get isOnCooldown(): boolean {
    return Date.now() < this.cooldownUntilTs;
  }

  get canPress(): boolean {
    return this.state === "IDLE" || this.state === "ENTERING";
  }

  // =================== ACTIONS ===================

  /**
   * לחיצה על ספרה
   */
  pressDigit(digit: string): void {
    if (!this.canPress) return;
    if (this.isOnCooldown) return;

    // TTS ספרה (אם מופעל)
    if (settings.voiceEnabled && settings.speakDigits) {
      speakDigit(digit);
    }

    // מעבר מ-IDLE ל-ENTERING
    if (this.state === "IDLE") {
      this.state = "ENTERING";
    }

    this.entered += digit;

    // בדיקה אוטומטית כשמגיעים לאורך הסיסמא
    if (this.entered.length >= settings.passcode.length) {
      this.checkPasscode();
    }
  }

  /**
   * מחיקת ספרה אחרונה
   */
  backspace(): void {
    if (!this.canPress) return;
    if (this.entered.length === 0) return;

    this.entered = this.entered.slice(0, -1);

    // אם מחקנו את כל הספרות — חזרה ל-IDLE
    if (this.entered.length === 0) {
      this.state = "IDLE";
    }
  }

  /**
   * ניקוי הכל — חזרה ל-IDLE
   */
  clear(): void {
    this.entered = "";
    this.state = "IDLE";
    this.cooldownUntilTs = 0;
  }

  /**
   * נקרא אחרי שסיים חיזוק
   */
  completeReward(): void {
    this.winsSinceLastReward = 0;
    this.clear();
  }

  /**
   * איפוס מלא
   */
  reset(): void {
    this.state = "IDLE";
    this.entered = "";
    this.correctCount = 0;
    this.winsSinceLastReward = 0;
    this.cooldownUntilTs = 0;
  }

  /**
   * בדיקת סיסמא — נקרא אוטומטית לאחר הזנת כל הספרות
   */
  private checkPasscode(): void {
    if (this.entered === settings.passcode) {
      // === הצלחה ===
      this.state = "SUCCESS";
      this.correctCount++;
      this.winsSinceLastReward++;

      if (settings.voiceEnabled) {
        speakSuccess();
      }

      // בדיקה האם מגיע פרס
      setTimeout(() => {
        const config = get(boosterService.config);
        const turnsForReward = config ? config.turnsPerReward : 3;

        if (settings.boosterEnabled && this.winsSinceLastReward >= turnsForReward) {
          this.state = "REWARD";
        } else {
          this.clear();
        }
      }, 1200);
    } else {
      // === שגיאה ===
      this.state = "ERROR";
      this.cooldownUntilTs = Date.now() + settings.cooldownMs;

      if (settings.voiceEnabled) {
        speakWrong();
      }

      // לאחר הcooldown — חזרה ל-IDLE
      setTimeout(() => {
        if (this.state === "ERROR") {
          this.clear();
        }
      }, settings.cooldownMs);
    }
  }
}

// ייצוא singleton
export const gameState = new GameStateStore();
