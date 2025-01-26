import { initializeVideoPlayer, initializeSettings } from "./UI/main";
import { getGameConfig } from "./lib/get-game-config";
import { injectCodeIntoFunction } from "./lib/inject-code-into-function";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { getConfigs } from "./config";
import { handleGameLevelEnd, injectCodeToGame } from "./lib/game-handler";
import type { GameConfig } from "./lib/game-config";

const DEV_SERVER_HOSTNAME = 'dev-server.dev';

/**
 * הפונקציה הראשית של האפליקציה
 * מזהה את הסביבה ומאתחלת את המערכת בהתאם
 */
async function main(): Promise<void> {
    const isIframe = window.self !== window.top;
    const selfUrl = import.meta.url;
    const isDevServer = (window.location.hostname === DEV_SERVER_HOSTNAME);
    const devMode = import.meta.env.DEV;

    const mode = (devMode) ? 'development' : 'production';
    log('Gingim-Booster is loaded in', mode, 'mode.');

    try {
        if (isIframe) {
            await loadVideoElement();

        } else if (isDevServer) {
            const playerControls = await loadVideoElement();
            playerControls?.show();

            await loadSettingsElement();
        } else {
            injectCodeIntoIframe(selfUrl);
            await loadSettingsElement();

        }
    } catch (error) {
        log('Failed to initialize system:', error);
        // TODO: להוסיף טיפול בשגיאות ברמת המערכת
    }
}

/**
 * מאתחל את המערכת - טוען את נגן הווידאו ומגדיר את הטיפול במשחק
 * @param skipGameInit האם לדלג על אתחול המשחק
 * @returns בקר נגן הווידאו
 * @throws {Error} אם הקונפיגורציה חסרה או שגויה
 */
async function loadVideoElement(skipGameInit = false): Promise<ReturnType<typeof initializeVideoPlayer>> {

    // בדיקת קונפיגורציה
    const { config, defaultConfig } = await getConfigs();

    if (!config?.videoDisplayTimeInMS) {
        const error = new Error('Invalid configuration: missing videoDisplayTimeInMS field that defines video display duration in milliseconds');
        log('Error:', error.message);
        throw error;
    }

    if (!config?.videoUrls?.length) {
        const error = new Error('Invalid configuration: missing or empty videoUrls list');
        log('Error:', error.message);
        throw error;
    }

    // אתחול נגן הווידאו
    let playerControls: ReturnType<typeof initializeVideoPlayer>;
    try {
        playerControls = initializeVideoPlayer(config, defaultConfig);
    } catch (error) {
        log('Failed to initialize video player:', error);
        throw new Error('Failed to initialize video player: ' + (error as Error).message);
    }

    // אתחול המשחק
    if (!skipGameInit) {

        injectCodeToGame(playerControls, config);
    }

    return playerControls;
}

/**
 * מאתחל את דף ההגדרות
 * @returns מופע הקומפוננטה
 * @throws {Error} אם הקונפיגורציה חסרה או שגויה
 */
async function loadSettingsElement() {
    // בדיקת קונפיגורציה
    const { config } = await getConfigs();
    if (!config) {
        const error = new Error('Invalid configuration: configuration object not found. Please verify the configuration file exists and is valid');
        log('Error:', error.message);
        throw error;
    }

    // אתחול דף ההגדרות
    try {
        return initializeSettings(config);
    } catch (error) {
        log('Failed to initialize settings:', error);
        throw new Error('Failed to initialize settings: ' + (error as Error).message);
    }
}

main();
