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
  logRemainingSeconds: () => number | null;
  getRemainingSeconds: () => number | null;
}

interface GingimBoosterTools {
  watchdog?: GingimBoosterWatchdogTools;
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
