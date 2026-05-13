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

// === חלקים מחוברים מראש ===

/** איזה חלק יישאר לא-מחובר כשמצב "חלקים מחוברים מראש" פעיל */
export type LoosePieceSelection = "top-left" | "random";

// === פרופילים ===

export type SettingsProfile = "beginner" | "intermediate" | "advanced" | "custom";

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
  /** הצגת כפתור "סידור מחדש" ליד שם הפאזל — מחזיר חלקים לא מחוברים למיקום ההתחלתי */
  showRearrangeButton: boolean;
  /** התאמת gridPresetIndex לפרופורציות התמונה — מספר החלקים נשאר קרוב למטרה אבל היחס משתנה */
  adaptGridToImage: boolean;
  /** רווח בין חלקים במצב מסודר (0-100, אחוז מגודל החלק) */
  organizedGap: number;
  /** השארת חלקים לא-מחוברים; השאר ממוזגים מראש לקבוצה אחת בעמדת הפתרון */
  prePlacedPieces: boolean;
  /** בחירת החלקים שיישארו לא-מחוברים (כש-prePlacedPieces=true) */
  loosePieceSelection: LoosePieceSelection;
  /** כמות חלקים שהתלמיד יצטרך לחבר (1 = פאזל כמעט שלם, N-1 = רוב החלקים) */
  loosePiecesCount: number;
  /** פרופיל הגדרות פעיל */
  activeProfile: SettingsProfile;
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
  showRearrangeButton: true,
  adaptGridToImage: false,
  organizedGap: 20,
  prePlacedPieces: false,
  loosePieceSelection: "top-left",
  loosePiecesCount: 1,
  activeProfile: "beginner",
};
