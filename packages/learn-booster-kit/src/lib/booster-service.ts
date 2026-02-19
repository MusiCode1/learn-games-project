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
import { createRewardWatchdog } from './watchdog/reward-watchdog';

const AFTER_REWARD_DELAY_MS = 2500;
const FULLY_POLL_INTERVAL_MS = 1000;
const WATCHDOG_GRACE_MS = 1000;

export type BoosterServiceInitialized = BoosterService & {
    config: Writable<Config>;
    timer: TimerController;
    isRewardActive: Writable<boolean>;
};

class BoosterService {
    // Internal singleton instance
    private static instance: BoosterService;

    private configStore: Writable<Config>;
    private timerController: TimerController;

    // UI Controls (Registered by BoosterContainer)
    private videoControls?: PlayerControls;
    private siteControls?: SiteBoosterControls;
    private settingsControls?: { show: () => void, hide: () => void };

    // State
    private rewardActiveStore = writable(false);
    private activeRewardSessionId = 0;
    private rewardWatchdog = createRewardWatchdog({
        isSessionActive: (sessionId) => this.activeRewardSessionId === sessionId,
        onTimeout: (payload) => {
            console.error('[gingim-booster][watchdog] Reward timeout detected', payload);
            log('Reward watchdog timeout', payload);
        },
        onLog: (message, payload) => {
            if (typeof payload === 'undefined') {
                log(message);
                return;
            }

            log(message, payload);
        }
    });

    private constructor() {
        this.configStore = configStore;
        this.timerController = createTimer();
    }

    public static getInstance(): BoosterService {
        if (!BoosterService.instance) {
            BoosterService.instance = new BoosterService();
        }
        return BoosterService.instance;
    }

    private initialized = false;

    private ensureInitialized(): asserts this is BoosterServiceInitialized {
        if (this.initialized) return;
        throw new Error('BoosterService not initialized. Call boosterService.init() first.');
    }

    public async init(): Promise<BoosterServiceInitialized> {
        if (this.initialized) {
            this.registerGlobalWatchdogTools();
            return this as BoosterServiceInitialized;
        }

        this.initialized = true;
        await initializeConfig();
        this.registerGlobalWatchdogTools();
        log('BoosterService initialized');
        return this as BoosterServiceInitialized;
    }

    private registerGlobalWatchdogTools() {
        if (typeof window === 'undefined') return;

        window.GingimBoosterTools = window.GingimBoosterTools ?? {};
        window.GingimBoosterTools.watchdog = {
            logRemainingSeconds: () => this.rewardWatchdog.logRemainingSeconds(),
            getRemainingSeconds: () => this.rewardWatchdog.getRemainingSeconds()
        };
    }

    public get config(): Writable<Config> {
        this.ensureInitialized();
        return this.configStore;
    }

    public get timer(): TimerController {
        this.ensureInitialized();
        return this.timerController;
    }

    public get isRewardActive(): Writable<boolean> {
        this.ensureInitialized();
        return this.rewardActiveStore;
    }

    public registerVideoControls(controls: PlayerControls) {
        this.ensureInitialized();
        this.videoControls = controls;
    }

    public registerSiteControls(controls: SiteBoosterControls) {
        this.ensureInitialized();
        this.siteControls = controls;
    }

    public registerSettingsControls(controls: { show: () => void, hide: () => void }) {
        this.ensureInitialized();
        this.settingsControls = controls;
    }

    public showSettings() {
        this.ensureInitialized();
        this.settingsControls?.show();
    }

    public hideSettings() {
        this.ensureInitialized();
        this.settingsControls?.hide();
    }

    public async triggerReward(gameConfig?: GameConfig, configOverride?: Config): Promise<void> {
        this.ensureInitialized();
        const config = configOverride || get(this.config);
        const delay = gameConfig?.delay;
        const rewardSessionId = this.activeRewardSessionId + 1;
        this.activeRewardSessionId = rewardSessionId;

        this.isRewardActive.set(true);
        try {
            if (config.rewardType === 'video') {
                if (!this.videoControls) throw new Error("Video controls not registered");
                await this.handleVideoReward(this.videoControls, config, delay, rewardSessionId);
            } else if (config.rewardType === 'site') {
                if (!this.siteControls) throw new Error("Site controls not registered");
                await this.handleSiteReward(this.siteControls, config, delay, rewardSessionId);
            } else if (config.rewardType === 'app') {
                await this.handleAppReward(config, delay, rewardSessionId);
            }
        } catch (e) {
            log('Error triggering reward:', e);
        } finally {
            this.rewardWatchdog.stop();
            this.isRewardActive.set(false);
            if (this.activeRewardSessionId === rewardSessionId) {
                this.activeRewardSessionId = 0;
            }
        }
    }

    private async handleVideoReward(
        playerControls: PlayerControls,
        config: Config,
        delay?: number,
        rewardSessionId?: number
    ): Promise<void> {
        playerControls.modalHasHidden.set(false);
        if (delay) await sleep(delay);

        let unsubscribe: (() => void) | undefined;
        let stopWatchdog: (() => void) | undefined;
        this.timer.configure(config.rewardDisplayDurationMs);

        // Show Video (implicitly starts timer in VideoMain, but we can supervise)
        playerControls.show();
        stopWatchdog = this.rewardWatchdog.start({
            rewardType: 'video',
            durationMs: config.rewardDisplayDurationMs,
            graceMs: WATCHDOG_GRACE_MS,
            timer: this.timer,
            sessionId: rewardSessionId ?? this.activeRewardSessionId,
            modalHasHidden: playerControls.modalHasHidden
        });

        await Promise.race([
            this.timer.onDone(),
            new Promise<void>((resolve) => {
                unsubscribe = playerControls.modalHasHidden.subscribe(hidden => {
                    if (hidden) {
                        unsubscribe?.();
                        stopWatchdog?.();
                        resolve();
                        log('Modal closed by user');
                    }
                });
            })
        ]).finally(() => {
            unsubscribe?.();
            stopWatchdog?.();
        });

        playerControls.hide();
        await sleep(AFTER_REWARD_DELAY_MS);
    }

    private async handleSiteReward(
        boosterControls: SiteBoosterControls,
        config: Config,
        delay?: number,
        rewardSessionId?: number
    ): Promise<void> {
        const siteUrl = config.booster?.siteUrl?.trim();
        if (!siteUrl) return;

        boosterControls.setUrl(siteUrl);
        if (delay) await sleep(delay);

        boosterControls.modalHasHidden.set(false);
        this.timer.configure(config.rewardDisplayDurationMs);

        boosterControls.show();
        let stopWatchdog: (() => void) | undefined;
        stopWatchdog = this.rewardWatchdog.start({
            rewardType: 'site',
            durationMs: config.rewardDisplayDurationMs,
            graceMs: WATCHDOG_GRACE_MS,
            timer: this.timer,
            sessionId: rewardSessionId ?? this.activeRewardSessionId,
            modalHasHidden: boosterControls.modalHasHidden
        });

        let unsubscribe: (() => void) | undefined;
        await Promise.race([
            this.timer.onDone(),
            new Promise<void>((resolve) => {
                unsubscribe = boosterControls.modalHasHidden.subscribe(hidden => {
                    if (hidden) {
                        unsubscribe?.();
                        stopWatchdog?.();
                        resolve();
                    }
                });
            })
        ]).finally(() => {
            unsubscribe?.();
            stopWatchdog?.();
        });

        boosterControls.hide();
        await sleep(AFTER_REWARD_DELAY_MS);
    }

    private async handleAppReward(
        config: Config,
        delay?: number,
        rewardSessionId?: number
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
            const stopWatchdog = this.rewardWatchdog.start({
                rewardType: 'app',
                durationMs: config.rewardDisplayDurationMs,
                graceMs: WATCHDOG_GRACE_MS,
                timer: this.timer,
                sessionId: rewardSessionId ?? this.activeRewardSessionId,
                getExtraStatus: () => {
                    const status = fullyWatcher?.getStatus?.();
                    return {
                        fullyDetected: true,
                        isInForeground: status?.lastIsInForeground,
                        hasSeenBackground: status?.hasSeenBackground
                    };
                }
            });

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
                stopWatchdog?.();
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
        let lastIsInForeground: boolean | null = null;

        const cancel = () => {
            if (intervalId) clearInterval(intervalId);
            intervalId = null;
        };

        const promise = new Promise<'fully'>((resolve) => {
            intervalId = setInterval(() => {
                try {
                    const inForeground = fullyApi.isInForeground();
                    if (typeof inForeground !== 'boolean') return;
                    lastIsInForeground = inForeground;

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

        const getStatus = () => ({
            hasSeenBackground,
            lastIsInForeground
        });

        return { promise, cancel, getStatus };
    }
}

export const boosterService = BoosterService.getInstance();
