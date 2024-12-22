/// <reference types="svelte" />

import type { PlayerControls, Config ,FullyKiosk} from "./types";

declare global {
    interface Window {
        openModal: () => void;
        playerControls: PlayerControls;
        config?: Config;
        fully?: FullyKiosk;
        videoUrls: string[];
        currentVideoIndex: number;
    }
}