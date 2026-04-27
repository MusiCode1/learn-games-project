/**
 * טיפוסים ראשיים של משחק הפאזל — version 2
 */

// === מצבי State Machine ===

export type GamePhase =
  | "INIT"
  | "LOADING"
  | "PLAYING"
  | "PIECE_FEEDBACK"
  | "PUZZLE_COMPLETE"
  | "REWARD_TIME";

// === פאזל ===

export type ShapeStyle = "classic" | "triangle" | "round" | "straight";
export type PieceFilter = "all" | "border_only";

export interface GridConfig {
  columns: number;
  rows: number;
  label: string;
}

export const GRID_PRESETS: GridConfig[] = [
  { columns: 2, rows: 1, label: "2×1" },
  { columns: 2, rows: 2, label: "2×2" },
  { columns: 3, rows: 2, label: "3×2" },
  { columns: 3, rows: 3, label: "3×3" },
  { columns: 4, rows: 3, label: "4×3" },
  { columns: 4, rows: 4, label: "4×4" },
  { columns: 5, rows: 4, label: "5×4" },
  { columns: 6, rows: 6, label: "6×6" },
];

// === תמונות ===

export interface PuzzleImage {
  id: string;
  name: string;
  src: string;
  ttsText?: string;
}

export interface ImagePack {
  id: string;
  name: string;
  icon: string;
  description: string;
  images: PuzzleImage[];
}

// === מצב מתחילים ===

/** אינדקס מקסימלי ב-GRID_PRESETS שמותר במצב מתחילים (3x3 = אינדקס 3) */
export const BEGINNER_MAX_GRID_INDEX = 3;

// === הגדרות מורה ===

export interface TeacherSettings {
  imagePackId: string;
  gridPresetIndex: number;
  shapeStyle: ShapeStyle;
  proximity: number;
  allowDisconnect: boolean;
  showReferenceImage: boolean;
  pieceFilter: PieceFilter;
  shuffleImages: boolean;
  boosterEnabled: boolean;
  voiceEnabled: boolean;
  gameMode: "continuous" | "manual_end";
  showContinueButton: boolean;
  /** מצב מתחילים — ללא zoom/pan, הגבלת grid */
  beginnerMode: boolean;
  /** ערבוב מיקום חלקים — true=מפוזרים, false=מסודרים בשורה */
  shufflePiecePlacement: boolean;
  /** מצב נעילה לתלמידים — מסתיר את כפתור הבית בזמן משחק */
  studentLockMode: boolean;
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  imagePackId: "animals",
  gridPresetIndex: 1, // 2×2 (index 1 after adding 2×1 at index 0)
  shapeStyle: "classic",
  proximity: 30,
  allowDisconnect: true,
  showReferenceImage: true,
  pieceFilter: "all",
  shuffleImages: false,
  boosterEnabled: true,
  voiceEnabled: false,
  gameMode: "manual_end",
  showContinueButton: false,
  beginnerMode: false,
  shufflePiecePlacement: true,
  studentLockMode: false,
};
