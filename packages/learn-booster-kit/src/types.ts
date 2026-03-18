import type { Component as ComponentImport, SvelteComponent } from "svelte";
import type { Writable, Readable } from "svelte/store";
export type { FullyKiosk, FullyItem } from "fully-kiosk-js";

// טיפוסים שמקורם ב-schemas (ArkType inferred) — re-export לתאימות לאחור
export type {
  Config,
  VideoItem,
  Profile,
  ProfilesState,
  ProfilesExportPayload,
  OldConfig,
  AppListItem,
} from "./schemas";

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
