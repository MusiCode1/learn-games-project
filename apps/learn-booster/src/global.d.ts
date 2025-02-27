/// <reference types="svelte" />

import type { PlayerControls, Config, FullyKiosk, SettingsController } from "./types";

declare global {
    interface Window {
        openModal: () => void;
        playerControls: PlayerControls;

        config?: Config;
        defaultConfig?:Config;
        fully?: FullyKiosk;
        videoUrls: string[];
        currentVideoIndex: number;
        settingsController: SettingsController;

        app: any;
    }
}
