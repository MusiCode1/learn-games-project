/**
 * טיפוסים ראשיים של משחק הפאזל
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

export type OutlineStyle = "rounded" | "squared";
export type PieceFilter = "all" | "border_only";

export interface GridConfig {
  columns: number;
  rows: number;
  label: string;
}

export const GRID_PRESETS: GridConfig[] = [
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

// === הגדרות מורה ===

export interface TeacherSettings {
  imagePackId: string;
  gridPresetIndex: number;
  outlineStyle: OutlineStyle;
  proximity: number;
  allowDisconnect: boolean;
  showReferenceImage: boolean;
  pieceFilter: PieceFilter;
  shuffleImages: boolean;
  boosterEnabled: boolean;
  voiceEnabled: boolean;
  gameMode: "continuous" | "manual_end";
}

export const DEFAULT_SETTINGS: TeacherSettings = {
  imagePackId: "animals",
  gridPresetIndex: 0, // 2×2
  outlineStyle: "squared",
  proximity: 50,
  allowDisconnect: false,
  showReferenceImage: true,
  pieceFilter: "all",
  shuffleImages: false,
  boosterEnabled: true,
  voiceEnabled: false,
  gameMode: "manual_end",
};
