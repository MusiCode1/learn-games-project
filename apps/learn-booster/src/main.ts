import { unmount } from "svelte";

import { mountComponent, defaultOptions } from "./UI/component-composer";
import { injectCodeIntoIframe } from "./lib/script-element-injection";
import { log } from "./lib/logger.svelte";
import { initializeConfig } from "./lib/config-manager";

import { injectCodeToGame, handleGameTurn, isVideoConfig, isAppConfig } from "./lib/game-handler";

import VideoComponent from './UI/VideoMain.svelte';
import SettingsComponent from "./UI/SettingsMain.svelte";
import type { Config, Component } from "./types";


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
        // אתחול מערכת ההגדרות בתחילת הריצה
        const config = await initializeConfig(selfUrl, devMode);

        if (isIframe) {
            await initGameRewardHandler(config);

        } else if (isDevServer) {
            /* const playerControls = await loadVideoElement();
            playerControls?.show(); */

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

    if (isVideoConfig(config)) {

        const { playerControls } = initializeVideoPlayer(config);

        injectCodeToGame(config, playerControls);

    } else if (isAppConfig(config)) {

        injectCodeToGame(config);
    }
}

function initializeVideoPlayer(config: Config) {

    const app = mountComponent({
        elementId: 'playerRoot',
        component: VideoComponent as Component,
        props: { config }
    });

    const playerControls = {
        ...app.modalController,
        get video() {
            return app.modalController.getVideo();
        }
    };


    log('video element is loaded!');

    return { playerControls, app };
}

function initializeSettings(config: Config) {

    const handleShowVideo = async (newConfig: Config) => {
        const { playerControls, app } = initializeVideoPlayer(newConfig);

        handleGameTurn({
            playerControls,
            config: config
        }).then(() => {
            unmount(app);
        });
    };

    const settingsApp = mountComponent({
        elementId: 'settingsRoot',
        component: SettingsComponent,
        props: { config, handleShowVideo },
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