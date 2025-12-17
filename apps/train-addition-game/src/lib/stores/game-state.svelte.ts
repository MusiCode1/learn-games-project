/**
 * State Machine לניהול משחק רכבת החיבור
 * משתמש ב-Svelte 5 runes ($state)
 */

import type { GameState, RoundData, TeacherSettings } from "$lib/types";
import { DEFAULT_SETTINGS } from "$lib/types";
import { generateChoices, generateRoundValues } from "$lib/utils/distractors";
import {
  speakBuildA,
  speakAddB,
  speakChooseAnswer,
  speakCorrect,
  speakWrong,
  speakAssist,
} from "$lib/utils/tts";
import { playSuccess, playError } from "$lib/utils/sound";

// cooldown לאחר טעות - 10 שניות
const WRONG_ANSWER_COOLDOWN_MS = 10000;

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

  // הגדרות
  settings = $state<TeacherSettings>({ ...DEFAULT_SETTINGS });

  // סטטיסטיקות
  roundNumber = $state(0);
  correctCount = $state(0);

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
    const { a, b } = generateRoundValues(
      this.settings.maxA,
      this.settings.maxB
    );
    const correct = a + b;
    const choices = generateChoices(a, b, this.settings.choicesCount);

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
    if (this.settings.voiceEnabled) {
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
        if (this.settings.voiceEnabled) {
          speakAddB(this.round.b);
        }
      }
    } else if (this.state === "ADD_B") {
      this.round.addedB++;

      // בדיקה אם סיימנו את קבוצה B
      if (this.round.addedB >= this.round.b) {
        this.state = "CHOOSE_ANSWER";
        if (this.settings.voiceEnabled) {
          speakChooseAnswer();
        }
      }
    }
  }

  /**
   * בחירת תשובה
   */
  selectAnswer(answer: number): void {
    if (this.state !== "CHOOSE_ANSWER") return;
    if (this.isOnCooldown) return;

    if (answer === this.round.correct) {
      // תשובה נכונה
      this.state = "FEEDBACK_CORRECT";
      this.correctCount++;

      // השמעת סאונד ו-TTS
      playSuccess();
      if (this.settings.voiceEnabled) {
        speakCorrect();
      }

      // מעבר לסיבוב הבא אחרי השהייה
      setTimeout(() => {
        this.state = "NEXT_ROUND";
      }, 1000);
    } else {
      // תשובה שגויה - cooldown של 10 שניות
      this.round.wrongAttempts++;
      this.state = "FEEDBACK_WRONG";
      this.cooldownUntilTs = Date.now() + WRONG_ANSWER_COOLDOWN_MS;

      // השמעת סאונד ו-TTS
      playError();
      if (this.settings.voiceEnabled) {
        speakWrong(this.round.a, this.round.b);
      }

      // בדיקה אם צריך להציג הדרכה
      if (this.round.wrongAttempts >= this.settings.maxWrongAttempts) {
        setTimeout(() => {
          this.state = "ASSIST_OVERLAY";
          if (this.settings.voiceEnabled) {
            speakAssist();
          }
        }, 2000);
      } else {
        // חזרה לבחירה אחרי 2 שניות (תוך כדי ה-cooldown)
        setTimeout(() => {
          this.state = "CHOOSE_ANSWER";
        }, 2000);
      }
    }
  }

  /**
   * סגירת overlay ההדרכה וחזרה לבחירה
   */
  closeAssist(): void {
    if (this.state === "ASSIST_OVERLAY") {
      this.state = "CHOOSE_ANSWER";
    }
  }

  /**
   * מעבר לסיבוב הבא
   */
  nextRound(): void {
    if (this.state === "NEXT_ROUND") {
      this.startRound();
    }
  }

  /**
   * איפוס המשחק
   */
  reset(): void {
    this.state = "INIT";
    this.roundNumber = 0;
    this.correctCount = 0;
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
