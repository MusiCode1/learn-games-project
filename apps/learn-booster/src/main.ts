import { loadVideoElement, loadSettingsElement } from "./UI/component-composer";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";

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
            /* const playerControls = await loadVideoElement();
            playerControls?.show(); */

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

main();
