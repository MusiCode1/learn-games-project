import type { SiteBoosterControls, Config, TimerController } from "../types";
import type { Component } from "svelte";

import { mountComponent } from "../UI/component-composer";
import { createConfigStore } from "./config-store.svelte";

import BoosterComponent from "../UI/SiteBoosterMain.svelte";

type SiteBoosterAppInstance = ReturnType<typeof mountComponent> & {
    boosterController: SiteBoosterControls;
};

const { config: configStore, setConfig } = createConfigStore();

let siteBoosterApp: SiteBoosterAppInstance | null = null;

export function getBoosterControls(): SiteBoosterControls | undefined {
    return siteBoosterApp?.boosterController;
}

export function setBoosterUrl(url: string): void {
    siteBoosterApp?.boosterController.setUrl(url);
}

export function showBooster(): void {
    siteBoosterApp?.boosterController.show();
}

export function hideBooster(): void {
    siteBoosterApp?.boosterController.hide();
}

function mountBoosterApp(config: Config, timer: TimerController): SiteBoosterAppInstance {

    siteBoosterApp = mountComponent({
        elementId: "boosterRoot",
        component: BoosterComponent as unknown as Component,
        props: {
            config: configStore,
            timer
        }
    }) as SiteBoosterAppInstance;

    return siteBoosterApp as SiteBoosterAppInstance;
}

export function initializeSiteBoosterControls(config: Config, timer: TimerController) {

    setConfig(config);

    if (!siteBoosterApp) {
        siteBoosterApp = mountBoosterApp(config, timer);
    }

    return siteBoosterApp;
}


