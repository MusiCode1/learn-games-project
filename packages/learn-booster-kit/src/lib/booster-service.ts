import { get, writable, type Writable } from 'svelte/store';
import type {
    Config,
    GameConfig,
    PlayerControls,
    SiteBoosterControls,
    TimerController
} from '../types';
import { initializeConfig, configStore } from './config-manager';
import { createTimer } from './utils/timer';
import { sleep } from './sleep';
import { log } from './logger.svelte';

const AFTER_REWARD_DELAY_MS = 2500;
const FULLY_POLL_INTERVAL_MS = 1000;

class BoosterService {
    private static instance: BoosterService;

    public config: Writable<Config>;
    public timer: TimerController;

    // UI Controls (Registered by BoosterContainer)
    private videoControls?: PlayerControls;
    private siteControls?: SiteBoosterControls;
    private settingsControls?: { show: () => void, hide: () => void };

    // State
    public isRewardActive = writable(false);

    private constructor() {
        this.config = configStore;
        this.timer = createTimer();
    }

    public static getInstance(): BoosterService {
        if (!BoosterService.instance) {
            BoosterService.instance = new BoosterService();
        }
        return BoosterService.instance;
    }

    private initialized = false;

    public async init() {
        if (this.initialized) return;
        this.initialized = true;
        await initializeConfig();
        log('BoosterService initialized');
    }

    public registerVideoControls(controls: PlayerControls) {
        this.videoControls = controls;
    }

    public registerSiteControls(controls: SiteBoosterControls) {
        this.siteControls = controls;
    }

    public registerSettingsControls(controls: { show: () => void, hide: () => void }) {
        this.settingsControls = controls;
    }

    public showSettings() {
        this.settingsControls?.show();
    }

    public hideSettings() {
        this.settingsControls?.hide();
    }

    public async triggerReward(gameConfig?: GameConfig, configOverride?: Config): Promise<void> {
        const config = configOverride || get(this.config);
        const delay = gameConfig?.delay;

        this.isRewardActive.set(true);
        try {
            if (config.rewardType === 'video') {
                if (!this.videoControls) throw new Error("Video controls not registered");
                await this.handleVideoReward(this.videoControls, config, delay);
            } else if (config.rewardType === 'site') {
                if (!this.siteControls) throw new Error("Site controls not registered");
                await this.handleSiteReward(this.siteControls, config, delay);
            } else if (config.rewardType === 'app') {
                await this.handleAppReward(config, delay);
            }
        } catch (e) {
            log('Error triggering reward:', e);
        } finally {
            this.isRewardActive.set(false);
        }
    }

    private async handleVideoReward(
        playerControls: PlayerControls,
        config: Config,
        delay?: number
    ): Promise<void> {
        playerControls.modalHasHidden.set(false);
        if (delay) await sleep(delay);

        let unsubscribe: (() => void) | undefined;
        this.timer.configure(config.rewardDisplayDurationMs);

        // Show Video (implicitly starts timer in VideoMain, but we can supervise)
        playerControls.show();

        await Promise.race([
            this.timer.onDone(),
            new Promise<void>((resolve) => {
                unsubscribe = playerControls.modalHasHidden.subscribe(hidden => {
                    if (hidden) {
                        unsubscribe?.();
                        resolve();
                        log('Modal closed by user');
                    }
                });
            })
        ]).finally(() => unsubscribe?.());

        playerControls.hide();
        await sleep(AFTER_REWARD_DELAY_MS);
    }

    private async handleSiteReward(
        boosterControls: SiteBoosterControls,
        config: Config,
        delay?: number
    ): Promise<void> {
        const siteUrl = config.booster?.siteUrl?.trim();
        if (!siteUrl) return;

        boosterControls.setUrl(siteUrl);
        if (delay) await sleep(delay);

        boosterControls.modalHasHidden.set(false);
        this.timer.configure(config.rewardDisplayDurationMs);

        boosterControls.show();

        let unsubscribe: (() => void) | undefined;
        await Promise.race([
            this.timer.onDone(),
            new Promise<void>((resolve) => {
                unsubscribe = boosterControls.modalHasHidden.subscribe(hidden => {
                    if (hidden) {
                        unsubscribe?.();
                        resolve();
                    }
                });
            })
        ]).finally(() => unsubscribe?.());

        boosterControls.hide();
        await sleep(AFTER_REWARD_DELAY_MS);
    }

    private async handleAppReward(
        config: Config,
        delay?: number
    ): Promise<void> {
        // App reward logic using Fully Kiosk
        if (delay) await sleep(delay);

        // Ensure Config is strictly AppConfig type or cast safely? 
        // We assume config is loaded correctly.
        const appConfig = config as Config & { rewardType: 'app' }; // Loose cast

        if (typeof window !== 'undefined' && (window as any).fully) {
            const fully = (window as any).fully;
            if (!appConfig.app.packageName) throw new Error('No package name defined');

            fully.startApplication(appConfig.app.packageName);

            // Initial timer config
            this.timer.configure(config.rewardDisplayDurationMs);
            this.timer.start();

            // Poll for foreground return
            const fullyWatcher = this.createFullyForegroundWatcher(fully);

            const racePromises: Array<Promise<'timer' | 'fully'>> = [
                this.timer.onDone().then(() => 'timer' as const)
            ];
            if (fullyWatcher) racePromises.push(fullyWatcher.promise);

            try {
                const result = await Promise.race(racePromises);
                if (result === 'fully') {
                    log('Returned to Fully Kiosk, stopping timer');
                }
            } finally {
                this.timer.stop();
                fullyWatcher?.cancel();
            }

            fully.bringToForeground();
            await sleep(AFTER_REWARD_DELAY_MS);
        } else {
            log('Fully Kiosk Not Detected - simulating app reward');
            await sleep(2000);
        }
    }

    private createFullyForegroundWatcher(fullyApi: any) {
        if (!fullyApi || typeof fullyApi.isInForeground !== 'function') return null;

        let intervalId: any = null;
        let hasSeenBackground = false;

        const cancel = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
        };

        const promise = new Promise<'fully'>((resolve) => {
            intervalId = setInterval(() => {
                try {
                    const inForeground = fullyApi.isInForeground();
                    if (typeof inForeground !== 'boolean') return;

                    if (!hasSeenBackground) {
                        if (!inForeground) hasSeenBackground = true;
                        return;
                    }
                    if (inForeground) {
                        cancel();
                        resolve('fully');
                    }
                } catch (e) { cancel(); }
            }, FULLY_POLL_INTERVAL_MS);
        });

        return { promise, cancel };
    }
}

export const boosterService = BoosterService.getInstance();
