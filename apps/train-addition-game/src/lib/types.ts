/**
 * טיפוסים ראשיים של משחק רכבת החיבור
 */

// סטייטים אפשריים למשחק
export type GameState =
  | "INIT"
  | "BUILD_A"
  | "ADD_B"
  | "CHOOSE_ANSWER"
  | "FEEDBACK_CORRECT"
  | "FEEDBACK_WRONG"
  | "ASSIST_OVERLAY"
  | "NEXT_ROUND"
  | "LEVEL_END"
  | "REWARD_TIME";

// נתוני סיבוב נוכחי
export interface RoundData {
  a: number; // מספר קרונות ראשוניים
  b: number; // מספר קרונות להוספה
  correct: number; // התשובה הנכונה
  choices: number[]; // 3 אפשרויות תשובה
  builtA: number; // כמה קרונות A נבנו
  addedB: number; // כמה קרונות B נוספו
  wrongAttempts: number; // מספר טעויות בסיבוב
}

// הגדרות מורה
export interface TeacherSettings {
  maxA: number; // מקסימום לקבוצה A (ברירת מחדל: 5)
  maxB: number; // מקסימום לקבוצה B (ברירת מחדל: 4)
  choicesCount: 2 | 3; // מספר אפשרויות תשובה
  cooldownMs: number; // זמן השהייה בין לחיצות
  maxWrongAttempts: number; // מקסימום טעויות לסיבוב
  inputMode: "tap" | "drag" | "both";
  voiceEnabled: boolean;
  gameMode: "continuous" | "manual_end";
  // הגדרות חיזוקים (Booster) - בוליאני בלבד, השאר ב-BoosterService
  boosterEnabled: boolean;
  // האם להשמיע שאלה מפורטת ("כמה זה X ועוד Y") או רגילה ("כמה רכבות יש")
  detailedQuestion: boolean;
}

// קבועים
export const DEFAULT_SETTINGS: TeacherSettings = {
  maxA: 5,
  maxB: 4,
  choicesCount: 3,
  cooldownMs: 10000,
  maxWrongAttempts: 2,
  inputMode: "tap",
  voiceEnabled: true,
  gameMode: "manual_end", // ברירת מחדל חדשה: סיום ידני עם מסך "שחק שוב"
  boosterEnabled: true,
  detailedQuestion: false,
};
