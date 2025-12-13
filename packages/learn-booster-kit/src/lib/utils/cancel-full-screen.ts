import { log } from "../logger.svelte";

export function cancelFullScreen() {
    window.document.addEventListener("fullscreenchange", (ev) => {

        ev.stopPropagation();

        if (document.fullscreenElement) {

            log("מסך מלא זוהה — מבטל.");
            document.exitFullscreen();
        }
    });
}