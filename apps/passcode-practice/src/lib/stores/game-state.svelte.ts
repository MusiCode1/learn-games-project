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

  // --- Per-digit feedback (מצב עיוור) ---
  digitStatuses = $state<Array<"correct" | "wrong" | "">>([]);

  // --- Hint cooldown ---
  hintCooldownUntilTs = $state(0);
  hintVisibleUntilTs = $state(0);

  // =================== DERIVED ===================

  get isOnCooldown(): boolean {
    return Date.now() < this.cooldownUntilTs;
  }

  get isHintOnCooldown(): boolean {
    return Date.now() < this.hintCooldownUntilTs;
  }

  get isHintVisible(): boolean {
    return Date.now() < this.hintVisibleUntilTs;
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

    const pos = this.entered.length;
    this.entered += digit;

    // מצב עיוור: בדיקה פר-ספרה
    if (!settings.showHint) {
      if (digit === settings.passcode[pos]) {
        this.digitStatuses[pos] = "correct";
      } else {
        this.digitStatuses[pos] = "wrong";
        this.state = "ERROR";
        this.cooldownUntilTs = Date.now() + settings.cooldownMs;
        if (settings.voiceEnabled) speakWrong();
        setTimeout(() => {
          if (this.state !== "ERROR") return;
          // מוחקים רק את הספרה השגויה, שומרים את הנכונות שלפניה
          this.entered = this.entered.slice(0, pos);
          this.digitStatuses = this.digitStatuses.slice(0, pos);
          this.state = pos > 0 ? "ENTERING" : "IDLE";
          this.cooldownUntilTs = 0;
        }, settings.cooldownMs);
        return;
      }
    }

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
    this.digitStatuses = [];
  }

  /**
   * הצגת רמז — עם צינון
   */
  useHint(): void {
    if (this.isHintOnCooldown) return;
    // שלב 1: הצגת רמז, שלב 2: המתנה — סדרתיים
    this.hintVisibleUntilTs = Date.now() + settings.hintVisibleMs;
    this.hintCooldownUntilTs = Date.now() + settings.hintVisibleMs + settings.hintCooldownMs;
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
    this.digitStatuses = [];
    this.hintCooldownUntilTs = 0;
    this.hintVisibleUntilTs = 0;
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
