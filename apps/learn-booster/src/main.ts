import { unmount } from "svelte";

import { mountComponent, defaultOptions } from "./UI/component-composer";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { initializeConfig, tempConfig } from "./lib/config-manager";

import {
    isVideoConfig,
    injectCode,
    handleGameTurn
} from "./lib/game-handler";

import VideoComponent from './UI/VideoMain.svelte';
import SettingsComponent from "./UI/SettingsMain.svelte";
import type { Config, PlayerControls, TimerController } from "./types";
import type { Component } from 'svelte';
import { createTimer } from "./lib/utils/timer";


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

    const mode = (devMode) ? 'development' : 'production';
    log('Gingim-Booster is loaded in', mode, 'mode.');

    try {
        // אתחול מערכת ההגדרות בתחילת הריצה
        const config = await initializeConfig();

        if (isIframe || isGamePage) {
            await initGameRewardHandler(config);

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
    let playerControls: PlayerControls | undefined = undefined;

    if (isVideoConfig(config)) {

        ({ playerControls } = initializeVideoPlayer(config, timer));
    }
    injectCode(config, playerControls, timer);
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

        const timer = createTimer();
        const { playerControls, app } = initializeVideoPlayer(newConfig, timer);

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
            playerControls,
            turnsCounter: 0,
            timer
        };

        // הזרקת קוד למשחק עם הגדרות בדיקה
        await handleGameTurn(handleOptions);

        // הסרת הקומפוננטה אחרי הזרקת הקוד
        unmount(app);

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