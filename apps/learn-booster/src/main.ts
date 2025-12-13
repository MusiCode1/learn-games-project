
import type { Config, PlayerControls, SiteBoosterControls } from "./types";
import { initializeConfig, tempConfig, getAllConfig } from "./lib/config-manager";
import { mountComponent, defaultOptions } from "./UI/component-composer";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { cancelFullScreen } from "./lib/utils/cancel-full-screen";
import { pushTagToIframe } from "./lib/inject-code-into-function";
import { findFunctionInWindow } from "./lib/object-finder";
import { getVideoPlayerApp } from "./lib/booster-video";
import { createTimer } from "./lib/utils/timer";
import { log } from "./lib/logger.svelte";


import type { Component } from 'svelte';



import {
    isVideoConfig,
    isSiteConfig,
    injectCode,
    handleGameTurn
} from "./lib/game-handler";
import { initializeSiteBoosterControls } from "./lib/booster-site";


import SettingsComponent from "./UI/SettingsMain.svelte";


declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GingimBoosterTools: any;
    }
}

const selfUrl = import.meta.url;
const selfUrlObj = new URL(selfUrl);
const injectUrl = selfUrlObj.origin + '/i.js';



/**
 * הפונקציה הראשית של האפליקציה
 * מזהה את הסביבה ומאתחלת את המערכת בהתאם
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function main(mode?: string): Promise<void> {
    "main-function";

    if (window.GingimBoosterTools) return;

    window.GingimBoosterTools = {
        getConfig: getAllConfig,
        controller: undefined,
        timer: undefined,
        findFunctionInWindow,
    };


    try {
        // אתחול מערכת ההגדרות בתחילת הריצה
        const config = await initializeConfig();

        const {
            isDevServer, isDeployServer, isGingim,
            isIframe, isGamePage, isGingimHomepage,
            isGamesListPage, isBoosterIframe,
            isDirectToGamePage

        } = config.envVals;

        if (!isDevServer && !isDeployServer && !isGingim) return;

        cancelFullScreen();

        log('Gingim-Booster is loaded in', config.environmentMode, 'mode.');

        // ניווט ישיר למשחק דרך פרמטר בכתובת
        if (!isIframe && (isGingimHomepage || isDirectToGamePage)) {

            const thisUrl = new URL(window.location.href);
            const gameName = thisUrl.searchParams.get('gameName');

            if (thisUrl.pathname === '/' && gameName) {

                directLinkToGame(gameName);
            }

            // טעינת קוד המסמן את האייפריים כמחזק
        } else if (isGamesListPage && isIframe && isBoosterIframe) {

            pushTagToIframe();

            // אין טעינת מחזק בעמוד משחק אם המשחק עצמו הוא מחזק
        } else if (isGamePage && isIframe && isBoosterIframe) {

            // אין טעינת מחזק אם המשחק משתמש כבר כמחזק
            log('Booster iframe detected in game page, skipping booster injection.');

            // טעינת מחזק בעמוד משחק רגיל
        } else if (isGamePage || (isIframe && isGamePage && !isBoosterIframe)) {

            const { timer, controller } = await initGameRewardHandler(config);
            injectCode(config, timer, controller);

            // טעינת מחזק בעמוד רשימת משחקים
        } else if (isGamesListPage && !isIframe) {

            injectCodeIntoIframe(injectUrl);
            initializeSettings(config);

            // טעינת מחזק בעמוד פיתוח
        } else if (isDevServer) {

            initializeSettings(config);
        } else {
            log('No booster injection conditions met, skipping initialization.');
        }

    } catch (error) {
        log('Failed to initialize system:', error);
        // TODO: להוסיף טיפול בשגיאות ברמת המערכת
    }
}

(() => {

    const selfUrl = import.meta.url;

    if (!selfUrl.includes('withESNext=true')) {
        main();
    }

})();


function directLinkToGame(gameName: string): void {
    const gameUrl = `https://gingim.net/wp-content/uploads/new_games/${gameName}/?lang=heb`;
    //window.open(gameUrl, '_self');
    window.location.href = gameUrl;
    return;
}

async function initGameRewardHandler(config: Config) {

    const timer = createTimer();
    let controller: PlayerControls | SiteBoosterControls | undefined;
    let app: ReturnType<typeof mountComponent> | undefined = undefined;

    if (isVideoConfig(config)) {

        const videoPlayer = getVideoPlayerApp(config, timer);
        controller = videoPlayer.playerControls;
        app = videoPlayer.videoBoosterApp;
    }

    if (isSiteConfig(config)) {
        const siteBooster = initializeSiteBoosterControls(config, timer);
        controller = siteBooster.boosterController;
        app = siteBooster;
    }

    window.GingimBoosterTools = {
        ...window.GingimBoosterTools,
        controller,
        timer,
        app
    };

    return { timer, app, controller };
}


function initializeSettings(config: Config) {

    const handleCheckConfig = async (newConfig: Config) => {

        newConfig = await tempConfig(newConfig);

        const { timer, controller, app } = await initGameRewardHandler(newConfig);

        newConfig = {
            ...newConfig,
            system: {
                ...newConfig.system,
                disableGameCodeInjection: true
            },
            turnsPerReward: 1
        };

        const handleOptions = {
            config: newConfig,
            controller,
            turnsCounter: 0,
            timer
        };

        window.GingimBoosterTools = {
            ...window.GingimBoosterTools,
            controller,
            timer,
            app
        };

        // טעינת מחזק לדוגמא
        await handleGameTurn(handleOptions);

        // הסרת הקומפוננטה אחרי הזרקת הקוד
        // if (app) unmount(app);

    };

    const settingsApp = mountComponent({
        elementId: 'settingsRoot',
        component: SettingsComponent as unknown as Component,
        props: { config, handleShowVideo: handleCheckConfig },
        styles: {
            ...defaultOptions.styles,
            zIndex: '99998'
        }
    });

    const settingsController = {
        ...settingsApp.settingsController
    };

    window.GingimBoosterTools = {
        ...window.GingimBoosterTools,
        settingsController
    }

    log('settings element is loaded!');

    return settingsController;
}
