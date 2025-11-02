import type { Config, PlayerControls, TimerController } from "../types";

import { mountComponent } from "../UI/component-composer";
import { createConfigStore } from "./config-store.svelte";

import VideoComponent from '../UI/VideoMain.svelte';
import { log } from "./logger.svelte";

import type { Component } from 'svelte';

const { config: configStore, setConfig } = createConfigStore();

type VideoAppInstance = ReturnType<typeof mountComponent>;

let videoBoosterApp: VideoAppInstance;

export function getVideoPlayerApp(config: Config, timer: TimerController) {

    if (!videoBoosterApp) {
        initializeVideoPlayer(config, timer);
    }

    const playerControls = {
        ...videoBoosterApp.modalController,
        get video() {
            return videoBoosterApp.modalController.getVideo();
        }
    } as PlayerControls;

    return { playerControls, videoBoosterApp };

}

function initializeVideoPlayer(config: Config, timer: TimerController) {

    setConfig(config);

    videoBoosterApp = mountComponent({
        elementId: 'playerRoot',
        component: VideoComponent as unknown as Component,
        props: {
            config: configStore,
            timer
        }
    });

    const playerControls = {
        ...videoBoosterApp.modalController,
        get video() {
            return videoBoosterApp.modalController.getVideo();
        }
    } as PlayerControls;


    log('video element is loaded!');

    return { playerControls, videoBoosterApp };
}