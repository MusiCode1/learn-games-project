import { defaultGameConfig, type GameConfig } from "./game-config";
import type { PlayerControls, Config } from "../types";
import { injectCodeIntoFunction } from "./inject-code-into-function";
import { getGameConfig } from "./get-game-config";
import { log } from "./logger.svelte";
import { sleep } from "./sleep";
import { monitorFunctionCalls } from "./function-monitor";

const AFTER_VIDEO_DELAY_MS = 2500;

// אפשרויות עבור סוג תגמול אפליקציה
interface AppGameOptions {
    gameConfig?: GameConfig;
    config: Config & { rewardType: 'app' };
    turnsCounter?: number;
    isFirstTurn?: boolean;
}

// אפשרויות עבור סוג תגמול וידאו
interface VideoGameOptions {
    gameConfig?: GameConfig;
    config: Config;
    playerControls: PlayerControls;
    turnsCounter?: number;
    isFirstTurn?: boolean;
}

// איחוד הטיפוסים
type handleGameOptions = VideoGameOptions | AppGameOptions;

// Type guard לבדיקה אם מדובר באפשרויות של וידאו
function isVideoOptions(options: handleGameOptions): options is VideoGameOptions {
    return options.config.rewardType === 'video';
}

// Type guard לבדיקה אם מדובר באפשרויות של אפליקציה
function isAppOptions(options: handleGameOptions): options is AppGameOptions {
    return options.config.rewardType === 'app';
}

// Type guard לבדיקה אם מדובר בקונפיגורציה של וידאו
export function isVideoConfig(config: Config): config is Config & { rewardType: 'video' } {
    return config.rewardType === 'video';
}

export function isAppConfig(config: Config): config is Config & { rewardType: 'app' } {
    return config.rewardType === 'app';
}

type AsyncFun = () => Promise<void>;

// הפונקציה שרצה בפועל בעת התגמול בסוף משימה
export async function handleGameTurn(options: handleGameOptions):
    Promise<void> {

    // חילוץ שדות משותפים
    const { gameConfig, config } = options;


    if (isVideoOptions(options)) {
        // עכשיו אנחנו יודעים שיש playerControls
        const { playerControls } = options;

        // מחכה לדיליי שהוגדר בקונפיג
        if (gameConfig?.delay) await sleep(gameConfig.delay);

        // מציג את הוידאו
        playerControls.show();

        // מחכה את הזמן שהוגדר להצגת הוידאו
        await sleep(config.rewardDisplayDurationMs);

        // מסתיר את הוידאו
        playerControls.hide();

        // מחכה זמן קבוע אחרי הסתרת הוידאו
        await sleep(AFTER_VIDEO_DELAY_MS);

    } else if (isAppOptions(options)) {
        // מחכה לדיליי שהוגדר בקונפיג
        if (gameConfig?.delay) await sleep(gameConfig.delay);

        if (!window.fully) throw new Error('Fully Kiosk API is not available');
        if (!config.app.packageName) throw new Error('No application name has been defined.');

        // מציג את האפליקציה
        window.fully.startApplication(config.app.packageName);

        await sleep(config.rewardDisplayDurationMs);

        window.fully.bringToForeground();

        await sleep(AFTER_VIDEO_DELAY_MS);
    }
}

/**
 * הזרקת קוד למשחק עבור סוג תגמול וידאו
 */
export function injectCodeToGame_old(config: Config & { rewardType: 'video' }, playerControls: PlayerControls): void;

/**
 * הזרקת קוד למשחק עבור סוג תגמול אפליקציה
 */
export function injectCodeToGame_old(config: Config & { rewardType: 'app' }): void;


/**
 * הזרקת קוד למשחק
 * @param config הגדרות המערכת
 * @param playerControls בקר הנגן (חובה רק עבור rewardType === 'video')
 */
export function injectCodeToGame_old(config: Config, playerControls?: PlayerControls) {
    try {
        // הזרקת קוד לפונקציית היצירה של המשחק
        const createGamePath = 'PIXI.game.state.states.game.create';

        injectCodeIntoFunction(createGamePath, null, async () => {
            // בדיקת תמיכה במשחק לאחר אתחול המשחק
            const gameConfig = getGameConfig();

            if (gameConfig) {
                log('The game is supported!');

                // הוצא משימוש.
                let isFirstTurn = false;

                let turnsCounter = 1;
                let beforeCallback: null | AsyncFun,
                    afterCallback: null | AsyncFun;

                let handlerOptions: handleGameOptions = {
                    config,
                    turnsCounter,
                    isFirstTurn,
                    gameConfig
                } as AppGameOptions;

                if (isVideoConfig(config)) {
                    handlerOptions = { ...handlerOptions, playerControls };
                }

                const triggerFuncName = gameConfig.triggerFunc.name;

                const handler = async () => {
                    let canExecute = false;
                    if (!config.system.disableGameCodeInjection) {

                        // בסיבוב הראשון רק מעדכנים את הדגל
                        if (triggerFuncName === 'makeNewTurn' && isFirstTurn) {
                            isFirstTurn = false;
                        } else if (turnsCounter && (turnsCounter % config.turnsPerReward) !== 0) {
                            // אם לא הגיע הזמן להציג סרטון - יוצאים
                        } else {
                            canExecute = true;
                        }
                    }

                    if (canExecute)
                        await handleGameTurn({ ...handlerOptions });

                    turnsCounter++;
                    log('turnsCounter: ', turnsCounter)
                };

                if (triggerFuncName === 'makeNewTurn') {
                    beforeCallback = handler;
                    afterCallback = null;
                } else {
                    beforeCallback = null;
                    afterCallback = handler;
                }

                // הזרקת קוד לפונקציית הטריגר
                injectCodeIntoFunction(
                    gameConfig.triggerFunc.path,
                    beforeCallback,
                    afterCallback
                );
                log(`Injected code into ${gameConfig.triggerFunc.path}`);
            } else {
                log('The game isn\'t supported!');
            }
        });
    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        throw error;
    }
}

// הגדרת פונקציה שתרוץ בעת קריאה לפונקציית טריגר, ללא הזרקה מראש
export function injectCodeToGame(config: Config, playerControls?: PlayerControls) {
    try {

        let isHandlerDefinded = false;

        const definingHandler = () => {
            const gameConfig = getGameConfig();

            if (!gameConfig) {
                log('The game isn\'t supported!');
                return;
            }

            log('The game is supported!');

            let turnsCounter = 1;
            let callbackTiming: 'before' | 'after' | 'both';
            let isFirstTurn = false; // נכון לעכשיו, מבוטל

            let handlerOptions: handleGameOptions = {
                config,
                turnsCounter,
                gameConfig
            } as AppGameOptions;

            if (isVideoConfig(config)) {
                handlerOptions = { ...handlerOptions, playerControls };
            }

            const triggerFuncName = gameConfig.triggerFunc.name;

            if (triggerFuncName === 'makeNewTurn') {
                callbackTiming = 'before';
            } else {
                callbackTiming = 'after';
            }

            const handler = async () => {

                // לא בסיבוב הראשון אם הטריגר הוא יצירת סיבוב חדש
                if (triggerFuncName === 'makeNewTurn' && isFirstTurn) {
                    isFirstTurn = false;
                    return;
                }

                if (
                    // המערכת במצב בדיקה
                    (config.system.disableGameCodeInjection) ||
                    // לא נמצאים במספר סיבוב שאינו מתאים להגדרות
                    (turnsCounter % config.turnsPerReward === 0)
                ) {

                    // אז תריץ את התגמול
                    await handleGameTurn({
                        ...handlerOptions,
                    });
                }
                // כך או כך צריך להמשיך לספור סיבובים
                log('turnsCounter: ', turnsCounter);
                turnsCounter++;
            };

            monitorFunctionCalls(
                gameConfig.triggerFunc.name,
                handler,
                callbackTiming
            );

            log(`Injected code into ${gameConfig.triggerFunc.path}`);
        };

        monitorFunctionCalls(
            defaultGameConfig.triggerFunc.name,
            async () => {
                if (!isHandlerDefinded) { definingHandler(); isHandlerDefinded = true; }
                log('handler defined');
            },
            'before'
        );

    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        throw error;
    }
}