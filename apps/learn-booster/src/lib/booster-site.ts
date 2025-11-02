import type { SiteBoosterControls, Config, TimerController } from "../types";
import { mountComponent } from "../UI/component-composer";
import BoosterComponent from "../UI/SiteBoosterMain.svelte";
import type { Component } from "svelte";

type SiteBoosterAppInstance = ReturnType<typeof mountComponent> & {
    boosterController: SiteBoosterControls;
};

let siteBoosterApp: SiteBoosterAppInstance | null = null;

function mountBoosterApp(config: Config, timer: TimerController): SiteBoosterAppInstance {
    const app = mountComponent({
        elementId: "boosterRoot",
        component: BoosterComponent as unknown as Component,
        props: { config, timer }
    });

    return app as SiteBoosterAppInstance;
}

export function initializeSiteBoosterControls(config: Config, timer: TimerController) {
    if (!siteBoosterApp) {
        siteBoosterApp = mountBoosterApp(config, timer);
    }

    return siteBoosterApp;
}

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
