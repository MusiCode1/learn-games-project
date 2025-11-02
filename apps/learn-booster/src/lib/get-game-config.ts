import { gameConfigs, defaultGameConfig, type GameConfig } from "./game-config";
import { getFunctionByPath } from "./inject-code-into-function";
import { findFunctionInWindow } from "./object-finder";
import { log } from "./logger.svelte";
import type { Config } from "../types";

const bestPath = 'window.components'

/**
 * מחפש את קונפיגורציית המשחק המתאימה לפי נתיב
 * 
 * @param path נתיב ה-URL של המשחק
 * @returns קונפיגורציית המשחק המתאימה או undefined אם לא נמצאה
 */
function findGameConfig(path: string): GameConfig | undefined {
    return gameConfigs.find((config) => path.includes(config.gameName));
}

/**
 * מנסה למצוא את פונקציית המטרה באמצעות חיפוש רקורסיבי
 * 
 * @param functionName שם הפונקציה לחיפוש
 * @returns נתיב הפונקציה אם נמצאה, או undefined אם לא נמצאה
 */
function findTriggerFunctionPath(functionName: string): string | undefined {
    try {
        log(`מחפש את הפונקציה ${functionName} באמצעות חיפוש רקורסיבי...`);

        const results = findFunctionInWindow({
            keyForSearch: functionName,
            valueType: 'function',
            debug: false
        });

        if (results.length > 0) {

            if (results.length > 1) {
                log(`נמצאו ${results.length} נתיבים לפונקציה ${functionName} `);

                results.forEach((path, index) => {
                    log(`נתיב ${index + 1}: ${path}`);
                });

                const findedBestPath = results.find(path => path.startsWith(bestPath));

                if (findedBestPath) {
                    log(`נבחר הנתיב הטוב ביותר: ${findedBestPath}`);
                    return findedBestPath;
                }

                const path = results.pop() as string;
                log(`לא נמצא נתיב מועדף, נבחר הנתיב האחרון: ${path}`);

                log(`נמצאה הפונקציה ${functionName} בנתיב: ${path}`);
                return path;
            }

            const path = results[0];
            log(`נמצאה הפונקציה ${functionName} בנתיב: ${path}`);
            return path;
        }

        log(`לא נמצאה הפונקציה ${functionName} בחיפוש רקורסיבי`);
        return undefined;
    } catch (error) {
        log(`שגיאה בחיפוש הפונקציה ${functionName}:`, (error as Error).message);
        return undefined;
    }
}

/**
 * מקבל את קונפיגורציית המשחק הנוכחי ומוודא שפונקציית המטרה קיימת
 * אם פונקציית המטרה לא נמצאת בנתיב הידוע, מנסה לחפש אותה באמצעות חיפוש רקורסיבי
 * 
 * @returns קונפיגורציית המשחק המעודכנת אם פונקציית המטרה נמצאה, או false אם לא נמצאה
 */
export function getGameConfig(systemConfig: Config): GameConfig | false {
    try {

        if (systemConfig.system.disableGameCodeInjection) return defaultGameConfig;

        // קבלת נתיב ה-URL הנוכחי
        const currentPath = window.location.pathname;
        log(`נתיב נוכחי: ${currentPath}`);

        // חיפוש קונפיגורציית המשחק המתאימה
        const gameConfig = findGameConfig(currentPath);
        log(gameConfig ? `נמצאה קונפיגורציה למשחק: ${gameConfig.gameName}` : "לא נמצאה קונפיגורציה ספציפית למשחק");

        // בחירת הקונפיגורציה המתאימה (ספציפית או ברירת מחדל)
        const config = gameConfig || defaultGameConfig;
        log(`משתמש בקונפיגורציה: ${config.gameName}`);

        // ניסיון למצוא את הפונקציה בנתיב הידוע
        log(`מחפש את הפונקציה ${config.triggerFunc.name} בנתיב: ${config.triggerFunc.path}`);
        const triggerFuncObj = getFunctionByPath(config.triggerFunc.path);

        if (triggerFuncObj) {
            log(`נמצאה הפונקציה ${config.triggerFunc.name} בנתיב הידוע`);
            return config;
        }

        log(`לא נמצאה הפונקציה ${config.triggerFunc.name} בנתיב הידוע, מנסה חיפוש רקורסיבי...`);

        // אם לא נמצאה הפונקציה, ננסה לחפש אותה באמצעות object-finder
        const functionName = config.triggerFunc.name;
        const newPath = findTriggerFunctionPath(functionName);

        // אם נמצא נתיב חדש
        if (newPath) {
            // עדכון נתיב הפונקציה בקונפיגורציה
            const updatedConfig: GameConfig = {
                ...config,
                triggerFunc: {
                    name: functionName,
                    path: newPath
                }
            };

            // בדיקה שהפונקציה אכן קיימת בנתיב החדש
            const verifyFunc = getFunctionByPath(newPath);
            if (verifyFunc) {
                log(`אומתה הפונקציה ${functionName} בנתיב החדש: ${newPath}`);
                return updatedConfig;
            }

            log(`לא ניתן לאמת את הפונקציה ${functionName} בנתיב החדש: ${newPath}`);
        }

        // אם לא נמצאה הפונקציה בשום דרך
        log(`לא נמצאה הפונקציה ${functionName} בשום דרך`);
        return false;
    } catch (error) {
        log(`שגיאה בקבלת קונפיגורציית המשחק:`, (error as Error).message);
        return false;
    }
}

export { defaultGameConfig };