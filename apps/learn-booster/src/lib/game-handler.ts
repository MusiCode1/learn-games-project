import type { GameConfig } from "./game-config";
import type { PlayerControls, Config } from "../types";

import { injectCodeIntoFunction } from "./inject-code-into-function";
import { getGameConfig } from "./get-game-config";
import { log } from "./logger.svelte";
import { sleep } from "./sleep";

const AFTER_VIDEO_DELAY_MS = 2500;

export function injectCodeToGame(playerControls: PlayerControls, config: Config) {

    try {
        const gameConfig = getGameConfig();

        if (gameConfig) {
            log('The game is supported!');

            let isFirstTurn = true;
            let turnsCounter = 0;

            const handle = async function () {
                // בסיבוב הראשון רק מעדכנים את הדגל
                if (gameConfig.triggerFunc.name === 'makeNewTurn' && isFirstTurn) {
                    isFirstTurn = false;
                    return;
                }

                turnsCounter++;

                // אם לא הגיע הזמן להציג סרטון - יוצאים
                if (turnsCounter % (config.turnsPerVideo || 1) !== 0) {
                    return;
                }

                // מחכה לדיליי שהוגדר בקונפיג
                await sleep(gameConfig.delay);

                // מציג את הוידאו
                playerControls.show();

                // מחכה את הזמן שהוגדר להצגת הוידאו
                await sleep(config.videoDisplayTimeInMS);

                // מסתיר את הוידאו
                playerControls.hide();

                // מחכה זמן קבוע אחרי הסתרת הוידאו
                await sleep(AFTER_VIDEO_DELAY_MS);
            }

            if (gameConfig.triggerFunc.name === 'makeNewTurn') {
                injectCodeIntoFunction(
                    gameConfig.triggerFunc.path,
                    () => handle(),
                    null
                );
            }

        } else {
            log('The game isn\'t supported!');
        }
    } catch (error) {
        log('Failed to initialize game:', error);
        // לא נזרוק שגיאה כאן כי אתחול המשחק הוא אופציונלי
    }

}

/**
 * מטפל בסיום שלב במשחק - מציג וידאו ומסתיר אותו
 * הפונקציה מוזרקת למשחק ומחליפה את הפונקציה המקורית makeNewTurn
 * 
 * @param gameConfig קונפיגורציית המשחק
 * @param playerControls בקר נגן הוידאו
 * @param videoDisplayTimeInMS זמן הצגת הוידאו במילישניות
 * @param isFirstTurn האם זו הקריאה הראשונה ל-makeNewTurn (תחילת השלב הראשון)
 */
export async function handleGameLevelEnd(
    gameConfig: GameConfig,
    playerControls: { show: () => void; hide: () => void },
    videoDisplayTimeInMS: number,
    isFirstTurn: boolean
): Promise<void> {
    // בקריאה הראשונה ל-makeNewTurn (תחילת השלב הראשון)
    // אנחנו רק מעדכנים את הדגל ולא מציגים וידאו
    if (gameConfig.triggerFunc.name === 'makeNewTurn' && isFirstTurn) {
        isFirstTurn = false;
        return;
    }

    // מחכה לדיליי שהוגדר בקונפיג
    await sleep(gameConfig.delay);

    // מציג את הוידאו
    playerControls.show();

    // מחכה את הזמן שהוגדר להצגת הוידאו
    await sleep(videoDisplayTimeInMS);

    // מסתיר את הוידאו
    playerControls.hide();

    // מחכה זמן קבוע אחרי הסתרת הוידאו
    await sleep(AFTER_VIDEO_DELAY_MS);
}
