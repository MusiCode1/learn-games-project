import type { GameConfig, InjectionMethod } from "./game-config";
import type { PlayerControls, Config } from "../types";
import { injectCodeIntoFunction } from "./inject-code-into-function";
import { getGameConfig } from "./get-game-config";
import { log } from "./logger.svelte";
import { sleep } from "./sleep";
import { monitorFunctionCalls } from "./function-monitor";

const AFTER_VIDEO_DELAY_MS = 2500;

// ברירת מחדל גלובלית לשיטת הזרקה
const DEFAULT_INJECTION_METHOD: InjectionMethod = 'monitor';

// אפשרויות בסיסיות למשחק
interface BaseGameOptions {
    gameConfig?: GameConfig;
    config: Config;
    turnsCounter: number;
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

// איחוד הטיפוסים
type GameOptions = VideoGameOptions | AppGameOptions;

// טיפוס לפונקציה אסינכרונית
type AsyncFun = () => Promise<void>;

// Type guard לבדיקה אם מדובר באפשרויות של וידאו
function isVideoOptions(options: GameOptions): options is VideoGameOptions {
    return options.config.rewardType === 'video';
}

// Type guard לבדיקה אם מדובר באפשרויות של אפליקציה
function isAppOptions(options: GameOptions): options is AppGameOptions {
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
    playerControls?: PlayerControls
): GameOptions {
    // יצירת אובייקט האפשרויות הבסיסי
    const baseOptions: BaseGameOptions = {
        config,
        turnsCounter,
        gameConfig
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
    delay?: number
): Promise<void> {
    // מחכה לדיליי שהוגדר בקונפיג
    if (delay) await sleep(delay);

    // מציג את הוידאו
    playerControls.show();

    // מחכה את הזמן שהוגדר להצגת הוידאו
    await sleep(config.rewardDisplayDurationMs);

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
    delay?: number
): Promise<void> {
    // מחכה לדיליי שהוגדר בקונפיג
    if (delay) await sleep(delay);

    if (!window.fully) throw new Error('Fully Kiosk API is not available');
    if (!config.app.packageName) throw new Error('No application name has been defined.');

    // מציג את האפליקציה
    window.fully.startApplication(config.app.packageName);

    await sleep(config.rewardDisplayDurationMs);

    window.fully.bringToForeground();

    await sleep(AFTER_VIDEO_DELAY_MS);
}

/**
 * הפונקציה שרצה בפועל בעת התגמול בסוף משימה
 */
export async function handleGameTurn(options: GameOptions): Promise<void> {
    // חילוץ שדות משותפים
    const { gameConfig, config } = options;

    if (isVideoOptions(options)) {
        await handleVideoReward(options.playerControls, config, gameConfig?.delay);
    } else if (isAppOptions(options)) {
        await handleAppReward(options.config, gameConfig?.delay);
    }
}

/**
 * יוצר פונקציית האנדלר לטיפול בתורות משחק
 */
function createGameTurnHandler(
    config: Config,
    gameConfig: GameConfig,
    playerControls?: PlayerControls
): AsyncFun {
    // משתנים משותפים
    let turnsCounter = 1;
    let isFirstTurn = false;
    const triggerFuncName = gameConfig.triggerFunc.name;

    // יצירת אובייקט האפשרויות
    const gameOptions = createGameOptions(config, gameConfig, turnsCounter, playerControls);

    // פונקציית ההאנדלר
    return async () => {
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
 * מזריק קוד למשחק באמצעות הזרקה ישירה לפונקציה
 * @deprecated השתמש ב-injectCode במקום
 */
export function injectCodeDirectly(config: Config, playerControls?: PlayerControls): void {
    try {
        // הזרקת קוד לפונקציית היצירה של המשחק
        const createGamePath = 'PIXI.game.state.states.game.create';

        injectCodeIntoFunction(createGamePath, null, async () => {
            // בדיקת תמיכה במשחק לאחר אתחול המשחק
            const gameConfig = getGameConfig();

            if (!gameConfig) {
                log('The game isn\'t supported!');
                return;
            }

            log('The game is supported!');

            // יצירת פונקציית ההאנדלר
            const handler = createGameTurnHandler(config, gameConfig, playerControls);

            // אתחול הזרקת הקוד בשיטה הישירה
            initializeInjectionByMethod(gameConfig, handler, 'direct');
        });
    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        throw error;
    }
}

/**
 * מזריק קוד למשחק באמצעות השיטה המתאימה
 * @param config הגדרות המערכת
 * @param playerControls בקר הנגן (חובה רק עבור rewardType === 'video')
 * @param method שיטת ההזרקה (אופציונלי - אם צוין, ידרוס את ההגדרות של המשחק)
 */
export function injectCode(
    config: Config,
    playerControls?: PlayerControls,
    method?: InjectionMethod
): void {
    try {

        // בדיקת תמיכה במשחק
        const gameConfig = getGameConfig();

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

        // יצירת פונקציית ההאנדלר
        const handler = createGameTurnHandler(config, gameConfig, playerControls);

        // אתחול הזרקת הקוד לפי השיטה המתאימה
        initializeInjectionByMethod(gameConfig, handler, injectionMethod);

    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        throw error;
    }
}