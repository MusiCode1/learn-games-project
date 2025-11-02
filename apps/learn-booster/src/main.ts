import { unmount } from "svelte";

import { mountComponent, defaultOptions } from "./UI/component-composer";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { initializeConfig, tempConfig, getAllConfig } from "./lib/config-manager";

import {
    isVideoConfig,
    isSiteConfig,
    injectCode,
    handleGameTurn
} from "./lib/game-handler";
import { initializeSiteBoosterControls } from "./lib/booster-site";

import VideoComponent from './UI/VideoMain.svelte';
import SettingsComponent from "./UI/SettingsMain.svelte";
import type { Config, PlayerControls, TimerController, SiteBoosterControls } from "./types";
import type { Component } from 'svelte';
import { createTimer } from "./lib/utils/timer";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GingimBoosterTools: any;
    }
}


const DEV_SERVER_HOSTNAME = 'dev-server.dev',
    GAME_PAGE_URL = 'https://gingim.net/wp-content/uploads/new_games/';

const hostname = window.location.hostname,
    fullPath = window.location.href,
    isIframe = window.self !== window.top,
    selfUrl = import.meta.url,
    isDevServer = (hostname === DEV_SERVER_HOSTNAME),
    devMode = import.meta.env.DEV,
    deployServer = import.meta.env.VITE_PRJ_DOMAIN,
    isDeployServer = (hostname === deployServer),
    isGingim = (hostname === 'gingim.net'),
    isGamePage = (fullPath.includes(GAME_PAGE_URL));


/**
 * הפונקציה הראשית של האפליקציה
 * מזהה את הסביבה ומאתחלת את המערכת בהתאם
 */
async function main(): Promise<void> {
    "main-function";

    if (!isDevServer && !isDeployServer && !isGingim) return;

    window.GingimBoosterTools = {
        getConfig: getAllConfig,
        controler: undefined,
        timer: undefined,
    };


    const mode = (devMode) ? 'development' : 'production';
    log('Gingim-Booster is loaded in', mode, 'mode.');

    try {
        // אתחול מערכת ההגדרות בתחילת הריצה
        const config = await initializeConfig();

        if (isIframe || isGamePage) {
            const { timer, controller } = await initGameRewardHandler(config);
            injectCode(config, timer, controller);

        } else if (isDevServer) {

            initializeSettings(config);
        } else {
            injectCodeIntoIframe(selfUrl);
            initializeSettings(config);
        }
    } catch (error) {
        log('Failed to initialize system:', error);
        // TODO: להוסיף טיפול בשגיאות ברמת המערכת
    }
}

main();

async function initGameRewardHandler(config: Config) {

    const timer = createTimer();
    let controller: PlayerControls | SiteBoosterControls | undefined;
    let app: ReturnType<typeof mountComponent> | undefined = undefined;

    if (isVideoConfig(config)) {

        const videoPlayer = initializeVideoPlayer(config, timer);
        controller = videoPlayer.playerControls;
        app = videoPlayer.app;
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

function initializeVideoPlayer(config: Config, timer: TimerController) {

    const app = mountComponent({
        elementId: 'playerRoot',
        component: VideoComponent as unknown as Component,
        props: { config, timer }
    });

    const playerControls = {
        ...app.modalController,
        get video() {
            return app.modalController.getVideo();
        }
    } as PlayerControls;


    log('video element is loaded!');

    return { playerControls, app };
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

        // הזרקת קוד למשחק עם הגדרות בדיקה
        await handleGameTurn(handleOptions);

        // הסרת הקומפוננטה אחרי הזרקת הקוד
        if (app) unmount(app);

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

    window.settingsController = settingsController;

    log('settings element is loaded!');

    return settingsController;
}
