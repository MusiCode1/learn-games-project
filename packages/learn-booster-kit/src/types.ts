import type { Component as ComponentImport, SvelteComponent } from "svelte";
import type { Writable, Readable } from "svelte/store";
import type { WatchStateWatchOptions } from "./lib/watchdog/reward-watchdog";
export type { FullyKiosk, FullyItem } from "fully-kiosk-js";

// === Global window extensions ===
//
// `learn-booster-kit` רץ בתוך 3 סביבות:
// 1. אפליקציות SvelteKit עצמאיות (find-letter-game, lotto-game, etc.)
// 2. דף gingim.net הישן (WordPress) שמזריק `window.config` עם פורמט legacy
// 3. ה-overlay של Fully Kiosk
//
// ה-declare global הזה ב-types.ts (ולא ב-vite-env.d.ts) — כדי שהוא יחול
// אוטומטית על כל צרכן של הקיט, גם אם ה-tsconfig שלו לא כולל את ה-d.ts
// של הקיט. types.ts כן מיובא ע"י כל צרכן (דרך re-exports מ-index.ts).
declare global {
  interface Window {
    /** legacy gingim config — נקרא ע"י config-manager לזיהוי OldConfig שדורש migration */
    config?: unknown;

    /** debug/control hooks שהקיט מציע ל-DevTools console ול-overlay חיצוני */
    GingimBoosterTools?: {
      watchdog?: {
        logRemainingSeconds: () => void;
        getRemainingSeconds: () => number | null;
        watchStateUntilReturn: (options?: WatchStateWatchOptions) => boolean;
      };
      overlay?: {
        start: (durationMs?: number) => void;
        stop: () => void;
      };
    };
  }
}

// טיפוסים שמקורם ב-schemas (ArkType inferred) — מיובאים ל-binding מקומי
// (לשימוש בקובץ זה: VideoDialogProps, VideoConfig, AppConfig, ConfigOverrides, VideoList)
// וגם מיוצאים החוצה לתאימות לאחור
import type {
  Config,
  VideoItem,
  Profile,
  ProfilesState,
  ProfilesExportPayload,
  OldConfig,
  AppListItem,
} from "./schemas";
export type {
  Config,
  VideoItem,
  Profile,
  ProfilesState,
  ProfilesExportPayload,
  OldConfig,
  AppListItem,
};

/**
 * Game Configuration passing to triggerReward
 */
export interface GameConfig {
  delay?: number;
}

/**
 * Video Controller Interface
 * Manages video playback operations
 */
export interface VideoController {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

/**
 * Props for the VideoDialog component
 */
export interface VideoDialogProps {
  config: Config;
  visible: boolean;
  videoUrl: string;
  type: string;
  videoController?: VideoController;
  time?: string;
  onVideoEnded: () => void;
  hideProgress?: boolean;
  hideModal: () => void;
}

/**
 * Controls returned from the main API
 */
export interface TimerController {
  start: () => void;
  pause: () => void;
  stop: () => void;
  configure: (durationMs: number) => void;
  onDone: () => Promise<void>;
  time: Readable<number>;
  getTime: () => string;
  subscribe: (
    run: (value: string) => void,
    invalidate?: (value?: string) => void,
  ) => () => void;
}

export interface PlayerControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  video?: VideoController;
  modalHasHidden: Writable<boolean>;
}

export interface SiteBoosterControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  setUrl: (url: string) => void;
  modalHasHidden: Writable<boolean>;
  getIframe: () => HTMLIFrameElement | null;
}

// OldConfig מוגדר ב-src/schemas.ts ומיוצא למעלה

// Config מוגדר ב-src/schemas.ts ומיוצא למעלה

export type VideoConfig = Config & { rewardType: "video" };
export type AppConfig = Config & { rewardType: "app" };

type DeepPartial<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [P in keyof T]?: T[P] extends (infer U)[]
    ? T[P] // שמירה על טיפוס המערך המקורי
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export type ConfigOverrides = DeepPartial<Config>;

// Profile, ProfilesState, ProfilesExportPayload מוגדרים ב-src/schemas.ts ומיוצאים למעלה

/**
 * בקר עבור דף ההגדרות
 */
export interface SettingsController {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

// VideoItem מוגדר ב-src/schemas.ts ומיוצא למעלה
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * רשימת פריטי וידאו
 */
export type VideoList = VideoItem[];

export type Exports = Record<string, any> | Record<string, Record<string, any>>;
export type Props = Record<string, any>;
export type Component =
  | SvelteComponent<Props, Exports>
  | ComponentImport<Props, Exports, string>;

// AppListItem מוגדר ב-src/schemas.ts ומיוצא למעלה
