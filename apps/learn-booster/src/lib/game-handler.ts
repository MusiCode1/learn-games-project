import type { GameConfig } from "./game-config";
import type { PlayerControls, Config } from "../types";

import { injectCodeIntoFunction } from "./inject-code-into-function";
import { getGameConfig } from "./get-game-config";
import { log } from "./logger.svelte";
import { sleep } from "./sleep";

const AFTER_VIDEO_DELAY_MS = 2500;

interface handleGameOptions {
    gameConfig?: GameConfig;
    config: Config;

    playerControls: PlayerControls;

    turnsCounter?: number;
    isFirstTurn?: boolean;
}

export async function handleGameTurn(options: handleGameOptions):
    Promise<{ isFirstTurn: boolean, turnsCounter: number }> {

    const { playerControls, turnsCounter, isFirstTurn, gameConfig, config } = options;

    const res = {
        isFirstTurn: isFirstTurn || false,
        turnsCounter: turnsCounter || 1
    };

    // בסיבוב הראשון רק מעדכנים את הדגל
    if (gameConfig?.triggerFunc?.name === 'makeNewTurn' && isFirstTurn) {
        res.isFirstTurn = false;
        return res;
    }

    // אם לא הגיע הזמן להציג סרטון - יוצאים
    if (turnsCounter && turnsCounter % config.turnsPerVideo !== 0) {
        return res;
    }

    if (config.mode === 'video') {

        // מחכה לדיליי שהוגדר בקונפיג
        gameConfig?.delay && await sleep(gameConfig.delay);

        // מציג את הוידאו
        playerControls.show();

        // מחכה את הזמן שהוגדר להצגת הוידאו
        await sleep(config.videoDisplayTimeInMS);

        // מסתיר את הוידאו
        playerControls.hide();

        // מחכה זמן קבוע אחרי הסתרת הוידאו
        await sleep(AFTER_VIDEO_DELAY_MS);
    } else if (config.mode === 'app') {
        // מחכה לדיליי שהוגדר בקונפיג
        gameConfig?.delay && await sleep(gameConfig.delay);

        if (!window.fully) throw new Error('Fully Kiosk API is not available');
        if (!config.appName) throw new Error('No application name has been defined.');

        // מציג את האפליקציה
        window.fully.startApplication(config.appName);

        await sleep(config.videoDisplayTimeInMS);

        window.fully.bringToForeground();

        await sleep(AFTER_VIDEO_DELAY_MS);
    }

    return res;
}

export function injectCodeToGame(playerControls: PlayerControls, config: Config) {
    try {
        const gameConfig = getGameConfig();

        if (gameConfig) {
            log('The game is supported!');

            let isFirstTurn = true;
            let turnsCounter = 0;

            if (gameConfig.triggerFunc.name === 'makeNewTurn') {
                injectCodeIntoFunction(
                    gameConfig.triggerFunc.path,
                    async () => {
                        turnsCounter++;
                        const res = await handleGameTurn({
                            playerControls,
                            config,
                            turnsCounter,
                            isFirstTurn, gameConfig
                        });
                        isFirstTurn = res.isFirstTurn;
                    },
                    null
                );
            } else {
                injectCodeIntoFunction(
                    gameConfig.triggerFunc.path,
                    null,
                    async () => {
                        turnsCounter++;
                        await handleGameTurn({
                            playerControls,
                            config, gameConfig
                        });
                    }
                );
            }
        } else {
            log('The game isn\'t supported!');
        }
    } catch (error) {
        log('Failed to initialize game:', (error as Error).message);
        // לא נזרוק שגיאה כאן כי אתחול המשחק הוא אופציונלי
        throw error;
    }
}

