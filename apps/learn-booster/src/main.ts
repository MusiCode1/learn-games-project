import { loadUI } from "./UI/main";
import { getGameConfig } from "./lib/get-game-config";
import { wrapFunctionByPath } from "./lib/wrap-fun-by-path";
import { InjectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { config } from "./config";
import { sleep } from "./lib/sleep";

function main() {

    const isIframe = window.self !== window.top;
    const selfUrl = import.meta.url;
    const isDevServer = (window.location.hostname === 'dev-server.dev');

    if (isIframe) {
        loadVideoElement();
    } else if (isDevServer) {
        const playerControls = loadVideoElement();

        if (playerControls) {
            playerControls.show();
        }

    } else {
        InjectCodeIntoIframe(selfUrl)
    }
}

function loadVideoElement() {

    const { videoDisplayTimeInMS } = config;

    const playerControls = loadUI(config);

    window.playerControls = playerControls;

    const gameConfig = getGameConfig();

    if (gameConfig) {

        wrapFunctionByPath(gameConfig.triggerFunc.path, null, async () => {

            await sleep(gameConfig.delay);
            playerControls.show();

            await sleep(videoDisplayTimeInMS);
            playerControls.hide();
        });
    }

    log('video element is loaded!');

    return playerControls;
}

function shortInjection() {

    const url = 'https://musicode1.github.io/gingim-booster/main-inject.js';
    if (window.location.hostname === 'gingim.net')
        fetch(url).then(r => r.text()).then(eval);

}

main();