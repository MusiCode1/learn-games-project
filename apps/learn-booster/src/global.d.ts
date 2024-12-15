/// <reference types="svelte" />

import type { PlayerControls, Config } from "./types";

declare global {
    interface Window {
        openModal: () => void;
        playerControls: PlayerControls;
        config?: Config
    }
}