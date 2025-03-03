/// <reference types="svelte" />

import type { PlayerControls, Config, OldConfig, FullyKiosk, SettingsController } from "./types";

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
        app: any;
    }
}
