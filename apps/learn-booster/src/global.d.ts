/// <reference types="svelte" />

import type { PlayerControls } from "./types";

declare global {
    interface Window {
        openModal: () => void;
        playerControls: PlayerControls;
    }
}