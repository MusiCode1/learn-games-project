/**
 * טיפוסים ראשיים של משחק מיון הכרטיסים
 */

// === מצבי State Machine ===

export type GameState =
  | "INIT"
  | "PLAYING"
  | "FEEDBACK_CORRECT"
  | "FEEDBACK_WRONG"
  | "ROUND_COMPLETE"
  | "REWARD_TIME"
  | "GAME_COMPLETE";

// === קטגוריות וארגזים ===

/** קטגוריה (ארגז) יחיד */
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

/** כרטיס בודד */
export interface SortCard {
  id: string;
  content: string;
  categoryId: string;
  image?: string;
}

/** הגדרת סיבוב */
export interface RoundDefinition {
  id: string;
  title: string;
  categories: Category[];
  cards: SortCard[];
}

/** חבילת תוכן */
export interface ContentPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  rounds: RoundDefinition[];
}

// === נתוני סיבוב נוכחי ===

export type CardStatus = "pending" | "sorted" | "active";

/** כרטיס בזמן משחק */
export interface ActiveCard extends SortCard {
  status: CardStatus;
}

/** נתוני סיבוב נוכחי */
export interface RoundData {
  definition: RoundDefinition;
  cards: ActiveCard[];
  currentCardIndex: number;
  correctCount: number;
  wrongCount: number;
}

// === הגדרות מורה ===

export interface TeacherSettings {
  contentPackId: string;
  cardsPerRound: number;
  cooldownMs: number;
  resetCooldownOnTap: boolean;
  shuffleCards: boolean;
  shuffleRounds: boolean;
  boosterEnabled: boolean;
  gameMode: "continuous" | "manual_end";
  voiceEnabled: boolean;
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  contentPackId: "animals-plants",
  cardsPerRound: 8,
  cooldownMs: 3000,
  resetCooldownOnTap: false,
  shuffleCards: true,
  shuffleRounds: false,
  boosterEnabled: true,
  gameMode: "manual_end",
  voiceEnabled: false,
};
