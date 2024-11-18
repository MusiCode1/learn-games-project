
import { wrapFunctionByPath, getFunctionByPath } from "./wrap-fun-by-path.js";
import { searchFunInGlobal } from "./search-fun-in-global.js";
import { createVideoHTML } from "./video-element.js";
import { gameConfigs as gameConfigsFromFile } from "./configs.js";
import { InjectCodeIntoIframe } from "./load-external-script.js";
import logger from "./logger.js"


// @ts-ignore
const videoDisplayTimeInMS = window.videoLength || 20 * 1000;
// @ts-ignore
let videoURL = window.videoURL || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const gameConfigs = window.gameConfigs || gameConfigsFromFile;

if (window.FullyKiosk) {
    videoURL = 'http://localhost/sdcard/video.mp4';
}



function loadElements() {

    const { modal, modalManager } = createVideoHTML(videoURL);

    logger.log(document.readyState);

    document.body.appendChild(modal);
    logger.log('The elements have been loaded successfully!');

    return { modalManager, modal };
}

function pullGameConfig(path) {

    return gameConfigs.find((v) => path.includes(v.urlPath))
}

function getGameConfig() {
    const gameConfig = pullGameConfig(window.location.pathname);

    if (!gameConfig) {
        return false;
    };

    let triggerFuncPath = gameConfig?.triggerFunc?.path;
    let triggerFuncCode = getFunctionByPath(triggerFuncPath)?.func;
    
    if (!triggerFuncCode || typeof triggerFuncCode !== 'function') {

        triggerFuncPath = searchFunInGlobal(gameConfig.triggerFunc.name)?.[0];

        if (!triggerFuncPath) throw new Error("No wrapping function found.");

        gameConfig.triggerFunc.path = triggerFuncPath;

        logger.log('Function search successfully completed!');
    } else {

        logger.log('Trigger function successfully extracted from configuration!')
    }

    return gameConfig;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function loadAndSetVideoElement() {

    if (document.readyState !== 'complete') {

        await new Promise(resolve => window.onload = resolve)
    }

    const gameConfig = getGameConfig();

    if (!gameConfig) {
        console.info('The current game is not yet supported.');
        return;
    }

    logger.log('path:', gameConfig.triggerFunc.path);

    const { modalManager, modal } = loadElements();

    wrapFunctionByPath(gameConfig.triggerFunc.path, null, async () => {

        logger.log('Video playback begins...');

        await sleep(gameConfig.delay);

        modalManager.show();

        await sleep(videoDisplayTimeInMS + gameConfig.delay);

        modalManager.hide();
    });

    logger.log('The video element has successfully loaded!');

    window.modalManager = modalManager;
}

export async function main() {

    const config = {

        type: 'app' || 'video',
        appID: 'com.edujoy.fidget.pop.it',
        videoURL: ''

    };

    const selfURL = import.meta.url;

    logger.log(`The script runs under the address ${window.location.href}`);

    if (window.self !== window.top) {
        logger.log("The page is inside an iframe.");
        await loadAndSetVideoElement();

    } else {
        logger.log("The page is not inside an iframe.");

        if (
            window.location.href.includes('new_game')
            || window.location.hostname === 'localhost'
        ) {
            await loadAndSetVideoElement();

        } else {
            InjectCodeIntoIframe(selfURL);
        }

    }

}

main();
