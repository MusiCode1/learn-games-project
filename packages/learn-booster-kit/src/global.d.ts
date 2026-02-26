/// <reference types="svelte" />
/// <reference types="node" />

import type {
  PlayerControls,
  Config,
  OldConfig,
  FullyKiosk,
  SettingsController,
} from "./types";

interface GingimBoosterWatchdogTools {
  watchStateUntilReturn: (options?: {
    intervalMs?: number;
    level?: "compact" | "medium" | "full";
  }) => boolean;
  logRemainingSeconds: () => number | null;
  getRemainingSeconds: () => number | null;
}

interface GingimBoosterOverlayTools {
  /** מפעיל את הטיימר עם משך נתון (ברירת מחדל: 30 שניות) */
  start: (durationMs?: number) => Promise<boolean>;
  /** עוצר את הטיימר */
  stop: () => Promise<boolean>;
}

interface GingimBoosterTools {
  watchdog?: GingimBoosterWatchdogTools;
  overlay?: GingimBoosterOverlayTools;
  [key: string]: unknown;
}

declare global {
  interface Window {
    openModal: () => void;
    playerControls: PlayerControls;

    config?: Config | OldConfig; // תמיכה בשני הפורמטים
    defaultConfig?: Config;
    fully?: FullyKiosk;
    videoUrls: string[];
    currentVideoIndex: number;
    settingsController: SettingsController;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app: any;
    getGingimBoosterConfig?: () => Config;
    GingimBoosterTools?: GingimBoosterTools;
  }
}
