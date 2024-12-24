import { loadUI } from "./UI/main";
import { getGameConfig } from "./lib/get-game-config";
import { wrapFunctionByPath } from "./lib/wrap-fun-by-path";
import { InjectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { getConfigs } from "./config";
import { sleep } from "./lib/sleep";
import type { GameConfig } from "./lib/game-config";

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

function loadVideoElement(isNoGame = false) {

    const { config, defaultConfig } = getConfigs();

    const { videoDisplayTimeInMS } = config;

    const playerControls = loadUI(config);

    window.playerControls = playerControls;
    window.videoUrls = config.videoUrls;
    window.defaultConfig = defaultConfig;

    let isFirstTime = true;

    const gameConfig = getGameConfig();

    async function runAfterEndGameLevel(gameConfig: GameConfig) {

        if (gameConfig.triggerFunc.name === 'makeNewTurn' && isFirstTime) {
            isFirstTime = false;
            return;
        }

        await sleep(gameConfig.delay);
        playerControls.show();

        await sleep(videoDisplayTimeInMS!);
        playerControls.hide();
        await sleep(1000 * 2.5);

    }

    if (gameConfig) {

        log('The game is supported!');

        wrapFunctionByPath(
            gameConfig.triggerFunc.path,
            () => runAfterEndGameLevel(gameConfig)
        );

    } else {
        log('The game isn\'t supported!');
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