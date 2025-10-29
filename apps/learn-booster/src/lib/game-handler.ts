import * as store from "svelte/store";
import type { Writable } from "svelte/store";

import type { GameConfig, InjectionMethod } from "./game-config";
import type { PlayerControls, Config, TimerController, FullyKiosk } from "../types";
import { injectCodeIntoFunction, getFunctionByPath } from "./inject-code-into-function";
import { getGameConfig } from "./get-game-config";
import { log } from "./logger.svelte";
import { sleep } from "./sleep";
import { monitorFunctionCalls } from "./function-monitor";

const AFTER_VIDEO_DELAY_MS = 2500;
const FULLY_POLL_INTERVAL_MS = 1000;

type FullyForegroundWatcher = {
    promise: Promise<'fully'>;
    cancel: () => void;
};

function createFullyForegroundWatcher(fullyApi: FullyKiosk | undefined): FullyForegroundWatcher | null {
    if (!fullyApi || typeof fullyApi.isInForeground !== 'function') {
        return null;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let hasSeenBackground = false;

    const cancel = (): void => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    const promise = new Promise<'fully'>((resolve) => {
        intervalId = setInterval(() => {
            try {
                const inForeground = fullyApi.isInForeground!();
                if (typeof inForeground !== 'boolean') {
                    return;
                }

                if (!hasSeenBackground) {
                    if (!inForeground) {
                        hasSeenBackground = true;
                    }
                    return;
                }

                if (inForeground) {
                    cancel();
                    resolve('fully');
                }
            } catch (error) {
                cancel();
                log('Failed to poll Fully foreground state:', (error as Error).message);
            }
        }, FULLY_POLL_INTERVAL_MS);
    });

    return { promise, cancel };
}

// ברירת מחדל גלובלית לשיטת הזרקה
const DEFAULT_INJECTION_METHOD: InjectionMethod = 'monitor';

// אפשרויות בסיסיות למשחק
interface BaseGameOptions {
    gameConfig?: GameConfig;
    config: Config;
    turnsCounter: number;
    timer: TimerController;
}

// אפשרויות עבור סוג תגמול אפליקציה
interface AppGameOptions extends BaseGameOptions {
    config: Config & { rewardType: 'app' };
}

// אפשרויות עבור סוג תגמול וידאו
interface VideoGameOptions extends BaseGameOptions {
    config: Config & { rewardType: 'video' };
    playerControls: PlayerControls;
}

interface UnknownGameOptions extends BaseGameOptions {
    config: Config & { rewardType: string };
    playerControls: PlayerControls;
}

// איחוד הטיפוסים
type GameOptions = VideoGameOptions | AppGameOptions | UnknownGameOptions;

// טיפוס לפונקציה אסינכרונית
type AsyncFun = () => Promise<void>;

// Type guard לבדיקה אם מדובר באפשרויות של וידאו
export function isVideoOptions(options: GameOptions): options is VideoGameOptions {
    return options.config.rewardType === 'video';
}

// Type guard לבדיקה אם מדובר באפשרויות של אפליקציה
export function isAppOptions(options: GameOptions): options is AppGameOptions {
    return options.config.rewardType === 'app';
}

// Type guard לבדיקה אם מדובר בקונפיגורציה של וידאו
export function isVideoConfig(config: Config): config is Config & { rewardType: 'video' } {
    return config.rewardType === 'video';
}

// Type guard לבדיקה אם מדובר בקונפיגורציה של אפליקציה
export function isAppConfig(config: Config): config is Config & { rewardType: 'app' } {
    return config.rewardType === 'app';
}

/**
 * יוצר אובייקט אפשרויות משחק בהתאם לסוג התגמול
 */
function createGameOptions(
    config: Config,
    gameConfig: GameConfig | undefined,
    turnsCounter: number,
    playerControls: PlayerControls | undefined,
    timer: TimerController
): GameOptions {
    // יצירת אובייקט האפשרויות הבסיסי
    const baseOptions: BaseGameOptions = {
        config,
        turnsCounter,
        gameConfig,
        timer
    };

    // הוספת playerControls אם מדובר בתגמול וידאו
    if (isVideoConfig(config)) {
        return {
            ...baseOptions,
            playerControls: playerControls!
        } as VideoGameOptions;
    }

    return baseOptions as AppGameOptions;
}

/**
 * בודק אם צריך להציג תגמול בסיבוב הנוכחי
 */
function shouldShowReward(
    config: Config,
    turnsCounter: number,
    isFirstTurn: boolean,
    triggerFuncName: string
): boolean {
    // במצב בדיקה תמיד מציגים תגמול
    if (config.system.disableGameCodeInjection) {
        return true;
    }

    // בסיבוב הראשון של makeNewTurn לא מציגים תגמול
    if (triggerFuncName === 'makeNewTurn' && isFirstTurn) {
        return false;
    }

    // מציגים תגמול רק כשמספר הסיבובים מתחלק במספר הסיבובים לתגמול
    return turnsCounter % config.turnsPerReward === 0;
}

/**
 * מטפל בלוגיקה של הצגת תגמול וידאו
 */
async function handleVideoReward(
    playerControls: PlayerControls,
    config: Config,
    timer: TimerController,
    delay?: number
): Promise<void> {

    playerControls.modalHasHidden.set(false);
    // מחכה לדיליי שהוגדר בקונפיג
    if (delay) await sleep(delay);

    let unsubscribe: store.Unsubscriber | undefined;

    timer.configure(config.rewardDisplayDurationMs);

    // מציג את הוידאו
    playerControls.show();

    await Promise.race([
        // הזמן המרבי להצגת הווידאו
        timer.onDone(),

        // נסגר ברגע שהמודאל הוסתר
        new Promise<void>((resolve) => {
            unsubscribe = playerControls.modalHasHidden.subscribe(h => {
                if (h) {
                    unsubscribe?.();
                    resolve();
                    log('Modal was closed by user');
                }
            });
        }),
    ]).finally(() => {
        // אם הסתיים מה-timeout, ננקה את המנוי
        unsubscribe?.();
    });

    // מסתיר את הוידאו
    playerControls.hide();

    // מחכה זמן קבוע אחרי הסתרת הוידאו
    await sleep(AFTER_VIDEO_DELAY_MS);
}

/**
 * מטפל בלוגיקה של הצגת תגמול אפליקציה
 */
async function handleAppReward(
    config: Config & { rewardType: 'app' },
    timer: TimerController,
    delay?: number
): Promise<void> {
    // מחכה לדיליי שהוגדר בקונפיג
    if (delay) await sleep(delay);

    if (!window.fully) throw new Error('Fully Kiosk API is not available');
    if (!config.app.packageName) throw new Error('No application name has been defined.');

    // מציג את האפליקציה
    window.fully.startApplication(config.app.packageName);

    const fullyWatcher = createFullyForegroundWatcher(window.fully);

    timer.configure(config.rewardDisplayDurationMs);

    const racePromises: Array<Promise<'timer' | 'fully'>> = [
        timer.onDone().then(() => 'timer' as const),
    ];

    if (fullyWatcher) {
        racePromises.push(fullyWatcher.promise);
    }

    timer.start();

    let result: 'timer' | 'fully' | null = null;
    try {
        result = await Promise.race(racePromises);
    } finally {
        timer.stop();
        fullyWatcher?.cancel();
    }

    if (result === 'fully') {
        log('Detected return to Fully Kiosk, stopping timer early');
    }

    window.fully.bringToForeground();

    await sleep(AFTER_VIDEO_DELAY_MS);
}

function replaceLastLiteral(str: string, search: string, replace: string): string {
    if (search === "") return str; // הימנע ממקרה קצה: "" נמצא "בסוף"
    const i = str.lastIndexOf(search);
    return i === -1 ? str
        : str.slice(0, i) + replace + str.slice(i + search.length);
}

/**
 * הפונקציה שרצה בפועל בעת התגמול בסוף משימה
 */
export async function handleGameTurn(options: GameOptions): Promise<void> {
    // חילוץ שדות משותפים
    const { gameConfig, config, timer } = options;

    if (isVideoOptions(options)) {
        await handleVideoReward(options.playerControls, config, timer, gameConfig?.delay);
    } else if (isAppOptions(options)) {
        await handleAppReward(options.config, timer, gameConfig?.delay);
    }
}

/**
 * יוצר פונקציית האנדלר לטיפול בתורות משחק
 */
export function createGameTurnHandler(
    config: Config,
    gameConfig: GameConfig,

    //משתנה שמחזיק האם המשחק אותחל
    // כדי שלא ירוץ מחזק בסיבוב הראשון של makeNewTurn
    isGameInitialized: Writable<boolean>,
    playerControls: PlayerControls | undefined,
    timer: TimerController
): AsyncFun {

    // === משתנים משותפים ===
    let turnsCounter = 1;
    let isFirstTurn = false;

    // ========================


    const triggerFuncName = gameConfig.triggerFunc.name;

    // יצירת אובייקט האפשרויות
    const gameOptions = createGameOptions(config, gameConfig, turnsCounter, playerControls, timer);

    // פונקציית ההאנדלר
    return async () => {

        // בדיקה אם המשחק אותחל
        if (!store.get(isGameInitialized)) {
            isFirstTurn = false;
            return;
        }

        // בדיקה אם זה הסיבוב הראשון של makeNewTurn
        if (triggerFuncName === 'makeNewTurn' && isFirstTurn) {
            isFirstTurn = false;
            return;
        }

        // בדיקה אם צריך להציג תגמול
        const showReward = shouldShowReward(config, turnsCounter, isFirstTurn, triggerFuncName);

        // הצגת תגמול אם צריך
        if (showReward) {
            await handleGameTurn({
                ...gameOptions,
                turnsCounter
            });
        }

        // עדכון מונה הסיבובים
        log('turnsCounter: ', turnsCounter);
        turnsCounter++;
    };
}

/**
 * מאתחל את הזרקת הקוד לפי השיטה המבוקשת
 * @param method שיטת ההזרקה
 * @param gameConfig קונפיגורציית המשחק
 * @param handler פונקציית ההאנדלר
 */
function initializeInjectionByMethod(
    gameConfig: GameConfig,
    handler: AsyncFun,
    method: InjectionMethod
): void {
    if (method === 'direct') {
        // שיטת הזרקה ישירה
        let beforeCallback: AsyncFun | null = null;
        let afterCallback: AsyncFun | null = null;

        if (gameConfig.triggerFunc.name === 'makeNewTurn') {
            beforeCallback = handler;
        } else {
            afterCallback = handler;
        }

        injectCodeIntoFunction(
            gameConfig.triggerFunc.path,
            beforeCallback,
            afterCallback
        );
    } else if (method === 'monitor') {
        // שיטת ניטור פונקציות
        const callbackTiming: 'before' | 'after' =
            gameConfig.triggerFunc.name === 'makeNewTurn' ? 'before' : 'after';

        monitorFunctionCalls(
            gameConfig.triggerFunc.name,
            handler,
            callbackTiming
        );
    } else {
        // במקרה של שיטה לא מוכרת, נשתמש בברירת המחדל
        log(`Unknown injection method: ${method}, using default method instead`);
        initializeInjectionByMethod(gameConfig, handler, DEFAULT_INJECTION_METHOD);
    }

    log(`Injected code into ${gameConfig.triggerFunc.path} using ${method} method`);
}

/**
 * מזריק קוד למשחק באמצעות השיטה המתאימה
 * @param config הגדרות המערכת
 * @param playerControls בקר הנגן (חובה רק עבור rewardType === 'video')
 * @param method שיטת ההזרקה (אופציונלי - אם צוין, ידרוס את ההגדרות של המשחק)
 */
export function injectCode(
    config: Config,
    playerControls: PlayerControls | undefined,
    timer: TimerController,
    method?: InjectionMethod
): void {
    try {

        // בדיקת תמיכה במשחק
        const gameConfig = getGameConfig(config);

        if (!gameConfig) {
            log('The game isn\'t supported!');
            return;
        }

        log('The game is supported!');

        // קביעת שיטת ההזרקה
        let injectionMethod: InjectionMethod;

        // אם צוינה שיטת הזרקה בפרמטר, נשתמש בה
        if (method) {
            injectionMethod = method;
            log(`Using specified injection method: ${method}`);
        }
        // אחרת, אם יש קונפיג משחק עם שיטת הזרקה מוגדרת, נשתמש בה
        else if ('injectionMethod' in gameConfig && gameConfig.injectionMethod) {
            injectionMethod = gameConfig.injectionMethod;
            log(`Using game config injection method: ${injectionMethod}`);
        }
        // אחרת, נשתמש בברירת המחדל
        else {
            injectionMethod = DEFAULT_INJECTION_METHOD;
            log(`Using default injection method: ${DEFAULT_INJECTION_METHOD}`);
        }

        // הזרקת קוד לפונקציית אתחול המשחק, כדי לסמן שהמשחק אותחל
        const initGameFnName = "create";
        const initGameFnPath = replaceLastLiteral(
            gameConfig.triggerFunc.path,
            gameConfig.triggerFunc.name,
            initGameFnName);

        const initGameFnExists = getFunctionByPath(initGameFnPath);
        const isGameInitialized = store.writable(false);

        if (initGameFnExists) {

            injectCodeIntoFunction(initGameFnPath, null, async () => {
                await sleep(1000); // מחכים שנייה כדי לוודא שהמשחק אכן אותחל
                isGameInitialized.set(true);
                log('Game initialized');
            });

            log(`Found game initialization function at path: ${initGameFnPath}`);
        } else {
            isGameInitialized.set(true);
        }

        // יצירת פונקציית ההאנדלר
        const handler = createGameTurnHandler(config, gameConfig, isGameInitialized, playerControls, timer);

        // אתחול הזרקת הקוד לפי השיטה המתאימה
        initializeInjectionByMethod(gameConfig, handler, injectionMethod);

    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        throw error;
    }
}
