import type { BoosterControls, Config, TimerController } from "../types";
import { mountComponent } from "../UI/component-composer";
import BoosterComponent from "../UI/BoosterMain.svelte";
import type { Component } from "svelte";

type BoosterAppInstance = ReturnType<typeof mountComponent> & {
    boosterController: BoosterControls;
};

let boosterApp: BoosterAppInstance | null = null;

function mountBoosterApp(config: Config, timer: TimerController): BoosterAppInstance {
    const app = mountComponent({
        elementId: "boosterRoot",
        component: BoosterComponent as unknown as Component,
        props: { config, timer }
    });

    return app as BoosterAppInstance;
}

export function ensureBoosterControls(config: Config, timer: TimerController): BoosterControls {
    if (!boosterApp) {
        boosterApp = mountBoosterApp(config, timer);
    }

    return boosterApp.boosterController;
}

export function getBoosterControls(): BoosterControls | undefined {
    return boosterApp?.boosterController;
}

export function setBoosterUrl(url: string): void {
    boosterApp?.boosterController.setUrl(url);
}

export function showBooster(): void {
    boosterApp?.boosterController.show();
}

export function hideBooster(): void {
    boosterApp?.boosterController.hide();
}
