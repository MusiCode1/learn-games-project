/**
 * State Machine לניהול משחק רכבת החיבור
 * משתמש ב-Svelte 5 runes ($state)
 */

import type { GameState, RoundData, TeacherSettings } from "$lib/types";
import { DEFAULT_SETTINGS } from "$lib/types";
import { generateChoices, generateRoundValues } from "$lib/utils/distractors";
import { settings } from "$lib/stores/settings.svelte"; // ייבוא אובייקט ה-settings הכללי
import {
  speakBuildA,
  speakAddB,
  speakChooseAnswer,
  speakCorrect,
  speakWrong,
} from "$lib/utils/tts";
import { playSuccess, playError } from "$lib/utils/sound";
import { get } from "svelte/store";
import { boosterService } from "learn-booster-kit";

/**
 * מחלקת ניהול מצב המשחק
 */
class GameStateStore {
  // מצב נוכחי
  state = $state<GameState>("INIT");

  // נתוני הסיבוב הנוכחי
  round = $state<RoundData>({
    a: 0,
    b: 0,
    correct: 0,
    choices: [],
    builtA: 0,
    addedB: 0,
    wrongAttempts: 0,
  });

  // הגדרות - משתמשים באובייקט ה-settings הכללי של האפליקציה

  // סטטיסטיקות
  roundNumber = $state(0);
  correctCount = $state(0);
  winsSinceLastReward = $state(0);

  // cooldown - חותמת זמן עד מתי חסום
  cooldownUntilTs = $state(0);

  // האם בזמן cooldown
  get isOnCooldown(): boolean {
    return Date.now() < this.cooldownUntilTs;
  }

  /**
   * התחלת סיבוב חדש
   */
  startRound(): void {
    const { a, b } = generateRoundValues(settings.maxA, settings.maxB);
    const correct = a + b;
    const choices = generateChoices(a, b, settings.choicesCount);

    this.round = {
      a,
      b,
      correct,
      choices,
      builtA: 0,
      addedB: 0,
      wrongAttempts: 0,
    };

    this.roundNumber++;
    this.state = "BUILD_A";

    // השמעת הוראה
    if (settings.voiceEnabled) {
      speakBuildA(a);
    }
  }

  /**
   * הוספת קרון
   */
  addCar(): void {
    if (this.state === "BUILD_A") {
      this.round.builtA++;

      // בדיקה אם סיימנו את קבוצה A
      if (this.round.builtA >= this.round.a) {
        this.state = "ADD_B";
        if (settings.voiceEnabled) {
          speakAddB(this.round.b);
        }
      }
    } else if (this.state === "ADD_B") {
      this.round.addedB++;

      // בדיקה אם סיימנו את קבוצה B
      if (this.round.addedB >= this.round.b) {
        this.state = "CHOOSE_ANSWER";
        if (settings.voiceEnabled) {
          speakChooseAnswer();
        }
      }
    }
  }

  async selectAnswer(answer: number): Promise<void> {
    if (this.state !== "CHOOSE_ANSWER") return;
    if (this.isOnCooldown) return;

    if (answer === this.round.correct) {
      // תשובה נכונה
      this.state = "FEEDBACK_CORRECT";
      this.correctCount++;
      this.winsSinceLastReward++;

      // השמעת סאונד ו-TTS
      playSuccess();
      if (settings.voiceEnabled) {
        // ממתינים לסיום ההודעה
        await speakCorrect();
      }

      // בדיקת פרס
      // משתמשים בהגדרות מה-boosterService שנטען
      const config = get(boosterService.config);
      const turnsForReward = config ? config.turnsPerReward : 3;

      if (
        settings.boosterEnabled &&
        this.winsSinceLastReward >= turnsForReward
      ) {
        // הגיע זמן פרס
        this.state = "REWARD_TIME";
      } else {
        // לא הגיע זמן פרס
        this.handleLevelCompletion();
      }
    } else {
      // תשובה שגויה - cooldown
      this.round.wrongAttempts++;
      this.state = "FEEDBACK_WRONG";
      this.cooldownUntilTs = Date.now() + settings.cooldownMs;

      // השמעת סאונד ו-TTS
      playError();
      if (settings.voiceEnabled) {
        speakWrong(this.round.a, this.round.b);
      }

      // חזרה לבחירה אחרי 2 שניות (תוך כדי ה-cooldown)
      setTimeout(() => {
        this.state = "CHOOSE_ANSWER";
      }, 2_000);
    }
  }

  /**
   * טיפול בסיום שלב (או אחרי פרס או ישירות אחרי תשובה נכונה)
   */
  handleLevelCompletion(): void {
    if (settings.gameMode === "continuous") {
      this.state = "NEXT_ROUND";
    } else {
      this.state = "LEVEL_END";
    }
  }

  /**
   * מעבר לסיבוב הבא
   */
  nextRound(): void {
    if (this.state === "NEXT_ROUND" || this.state === "LEVEL_END") {
      this.startRound();
    }
  }

  /**
   * סיום פרס וחזרה למשחק
   */
  completeReward(): void {
    this.winsSinceLastReward = 0;
    this.handleLevelCompletion();
  }

  /**
   * איפוס המשחק
   */
  reset(): void {
    this.state = "INIT";
    this.roundNumber = 0;
    this.correctCount = 0;
    this.winsSinceLastReward = 0;
    this.cooldownUntilTs = 0;
    this.round = {
      a: 0,
      b: 0,
      correct: 0,
      choices: [],
      builtA: 0,
      addedB: 0,
      wrongAttempts: 0,
    };
  }
}

// ייצוא singleton
export const gameState = new GameStateStore();
