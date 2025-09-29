/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * כדי להריץ קובץ זה בצורה מקבילית
 * npx playwright test search-triger.spec.ts --grep "Parallel" --workers 3
 * 
 * npx playwright test search-triger.spec.ts --ui --debug --grep '@serial'
 */
import { test, type Page, Frame } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

import {
    loginToGingim,
    openGame
} from './utils';

import type { GameConfig } from '../../src/lib/game-config';

// הגדרת טיפוסים
interface Game {
    id: string;
    name: string;
    description: string;
    url: string;
    imageUrl: string;
    categories: string[];
}

interface ResultItem {
    id: number;
    name: string;
    url: string;
    result: GameConfig | false;
}

declare global {
    interface Window {
        loadScriptFromUrl: (text: string) => void;
        gingimBoosterTest: {
            videoShown: boolean,
            logMessages: Array<any>,
        };

        checkGameConfigFn: () => Promise<GameConfig | false>;
    }
}

// משתנה גלובלי לשמירת כל התוצאות
const allTestResults: ResultItem[] = [];

// פונקציית עזר לחלוקת מערך לקבוצות
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// פונקציות עזר
async function getGameFrame(page: Page): Promise<Frame> {
    const childFrames = page.mainFrame().childFrames();

    // מציאת ה-iframe של המשחק
    const frame = childFrames.find((f) => {
        const url = new URL(f.url());
        return (
            (url.hostname === 'gingim.net')
            && (url.pathname.includes('/wp-content/uploads/new_games/'))
        );
    });

    if (!frame) {
        throw new Error("Game iframe not found");
    }

    return frame;
}

// פונקציה להזרקת קוד בדיקה ל-Frame
async function injectTestCodeToFrame(frame: Frame): Promise<void> {
    await frame.evaluate(() => {
        // הגדרת אובייקט חלון גלובלי לבדיקות
        window.gingimBoosterTest = {
            videoShown: false,
            logMessages: [] as any[],
        };

        // עטיפת console.log כדי לעקוב אחר הודעות
        const originalLog = console.log;

        console.log = function (...args: any[]) {
            if (typeof args[0] === 'string')
                window.gingimBoosterTest.logMessages.push(args[0]);
            originalLog.apply(console, args);
        };

        window.loadScriptFromUrl = function (url: string) {
            const script = document.createElement("script");
            script.async = true;
            script.type = "module";
            script.src = url;
            document.head.appendChild(script);
            console.log(`Script loaded`);
        };
    });
}

async function checkGameConfig(frame: Frame): Promise<GameConfig | false> {
    return await frame.evaluate(async () => {
        window.loadScriptFromUrl('https://dev-server.dev/tests/e2e/check-game-config.js');
        await new Promise(r => setTimeout(r, 1000));
        return await window.checkGameConfigFn();
    });
}

// פונקציה לשמירת תוצאות לקובץ
async function saveResultsToFile(results: ResultItem[]): Promise<void> {
    try {
        const resultsPath = path.join(import.meta.dirname, '../../output/game-config-results.jsonl');
        await fs.promises.writeFile(resultsPath, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${resultsPath}`);
    } catch (error) {
        console.error(`Error saving results:`, error);
    }
}

// פונקציה לטעינת רשימת המשחקים
function loadGameList(): Game[] {
    const gameListPath = path.join(import.meta.dirname, '../../output/games-list.json');

    try {
        // בדיקה שהקובץ קיים
        if (!fs.existsSync(gameListPath)) {
            console.error(`Game list file not found: ${gameListPath}`);
            return [];
        }

        const gameListString = fs.readFileSync(gameListPath, { encoding: 'utf-8' });
        const gameList = JSON.parse(gameListString) as Game[];
        console.log(`Loaded ${gameList.length} games from ${gameListPath}`);
        return gameList;
    } catch (error) {
        console.error(`Error loading game list from ${gameListPath}:`, error);
        return [];
    }
}

// קבוע המגדיר את מספר המשחקים בכל קבוצה עבור הטסט הסדרתי
const SERIAL_GAMES_PER_GROUP = 5;

// פונקציה להגדרת רשימת המשחקים עבור טסט סדרתי
function getSerialTestGameList(): {
    gameList: Game[],
    gameGroups: Game[][]
} {
    // טעינת רשימת המשחקים המלאה
    const allGames = loadGameList();

    // כאן ניתן להוסיף לוגיקה נוספת לסינון או עיבוד רשימת המשחקים
    // לדוגמה: סינון לפי קטגוריה, מיון, הגבלת כמות וכו'

    // חלוקת רשימת המשחקים לקבוצות
    const gameGroups = chunkArray(allGames, SERIAL_GAMES_PER_GROUP);

    return {
        gameList: allGames,
        gameGroups: gameGroups
    };
}

// פונקציה לבדיקת משחק בודד
async function testSingleGame(page: Page, game: Game): Promise<ResultItem> {
    try {
        // פתיחת המשחק
        await page.goto('https://gingim.net/games/');
        const gameId = Number(game.id);
        await openGame(page, gameId);

        // המתנה לטעינת המשחק
        await page.waitForTimeout(5000);

        // קבלת ה-iframe של המשחק
        const frame = await getGameFrame(page);

        // הזרקת קוד הבדיקה
        await injectTestCodeToFrame(frame);

        // לחיצה במרכז הקנוואס
        const canvas = frame.locator("canvas");
        const canvasBounds = await canvas.boundingBox();

        if (canvasBounds) {
            const centerX = canvasBounds.width * 0.5;
            const centerY = canvasBounds.height * 0.5;

            await canvas.click({ position: { x: centerX, y: centerY } });
            await frame.waitForTimeout(1000);

            // בדיקת קונפיגורציית המשחק
            const gameConfig = await checkGameConfig(frame);

            console.log(`Game ${game.name} (ID: ${gameId}): ${gameConfig ? 'Supported' : 'Not supported'}`);

            return {
                id: gameId,
                name: game.name,
                result: gameConfig,
                url: game.url
            };
        } else {
            console.error(`Canvas not found for game ${game.name} (ID: ${gameId})`);
            return {
                id: gameId,
                name: game.name,
                result: false,
                url: game.url
            };
        }
    } catch (error) {
        console.error(`Error testing game ${game.name} (ID: ${game.id}):`, error);
        return {
            id: Number(game.id),
            name: game.name,
            result: false,
            url: game.url
        };
    }
}

// פונקציה להוספת תוצאות למשתנה הגלובלי ושמירה לקובץ
async function addResultsAndSave(results: ResultItem[]): Promise<void> {
    // הוספת התוצאות למשתנה הגלובלי
    for (const result of results) {
        // בדיקה אם התוצאה כבר קיימת (לפי ID)
        const existingIndex = allTestResults.findIndex(r => r.id === result.id);
        if (existingIndex >= 0) {
            // עדכון התוצאה הקיימת
            allTestResults[existingIndex] = result;
        } else {
            // הוספת תוצאה חדשה
            allTestResults.push(result);
        }
    }

    // שמירת כל התוצאות לקובץ
    await saveResultsToFile(allTestResults);

    // הצגת סיכום ביניים
    const supportedGames = allTestResults.filter(r => r.result !== false).length;
    const unsupportedGames = allTestResults.length - supportedGames;
    console.log(`Current summary: ${supportedGames} supported games, ${unsupportedGames} unsupported games (total: ${allTestResults.length})`);
}

// משתנים גלובליים לשימוש בטסטים
let gameList: Game[] = [];
let gameGroups: Game[][] = [];





// טעינת רשימת המשחקים וחלוקתה לקבוצות
{
    const result = getSerialTestGameList()
    gameList = result.gameList;
    gameGroups = result.gameGroups;
}



// בדיקות סדרתיות
test.describe('Game config tests - Serial', { tag: '@serial' }, () => {

    // בדיקה שיש משחקים לבדוק
    if (gameList.length === 0) {
        test.skip(true, 'No games to test');
        return;
    }

    // עבור על כל קבוצת משחקים
    for (let i = 0; i < gameGroups.length; i++) {

        const groupResults: ResultItem[] = [];

        test(`test all games in group ${i}`, async ({ page }) => {
            test.setTimeout(0); // הגדלת ה-timeout

            console.log(`Testing group ${i + 1} of ${gameGroups.length} `
                + `(games ${i * SERIAL_GAMES_PER_GROUP + 1}-${Math.min((i + 1) * SERIAL_GAMES_PER_GROUP, gameList.length)})`);


            // התחברות לאתר ג'ינג'ים (פעם אחת בלבד)
            await loginToGingim(page);
            // עבור על כל משחק בקבוצה
            for (const game of gameGroups[i]) {
                const result = await testSingleGame(page, game);
                groupResults.push(result);
            }

            // הוספת התוצאות למשתנה הגלובלי ושמירה לקובץ
            await addResultsAndSave(groupResults);
        });
    }

    test.afterAll(() => {

        // סיכום סופי
        const supportedGames = allTestResults.filter(r => r.result !== false).length;
        const unsupportedGames = allTestResults.length - supportedGames;

        console.log(`Final summary: ${supportedGames} supported games, ${unsupportedGames} unsupported games (total: ${allTestResults.length})`);
    });
});


// בדיקות מקביליות
// לא עובד כרגע
test.describe.parallel('Game config tests - Parallel', { tag: '@parallelTest' }, () => {
    // test.describe.configure({ mode: 'parallel' });

    let gameList: Game[] = [];

    test.beforeAll(async ({ page }) => {
        // שימוש בפונקציה הייעודית להגדרת רשימת המשחקים
        const result = await getSerialTestGameList();
        gameList = result.gameList;

        // התחברות לאתר ג'ינג'ים
        await loginToGingim(page);
    });

    // נחלק את רשימת המשחקים לקבוצות קטנות יותר (10 משחקים בכל קבוצה)
    const PARALLEL_GAMES_PER_GROUP = 10;
    const MAX_WORKERS = 3; // מספר העובדים המקסימלי שירוצו במקביל

    // יצירת בדיקות נפרדות לכל קבוצת משחקים
    for (let i = 0; i < MAX_WORKERS; i++) {
        const groupIndex = i; // קיבוע ערך ה-i לסגירה

        test(`test games group ${groupIndex + 1}`, async ({ page }) => {
            test.setTimeout(300_000); // הגדלת ה-timeout ל-5 דקות

            // בדיקה שיש משחקים לבדוק
            if (gameList.length === 0) {
                test.skip(true, 'No games to test');
                return;
            }

            // חלוקת רשימת המשחקים לקבוצות
            const localGameGroups = chunkArray(gameList, PARALLEL_GAMES_PER_GROUP);

            // בדיקה שהקבוצה קיימת
            if (groupIndex >= localGameGroups.length) {
                test.skip(true, `Group ${groupIndex + 1} does not exist`);
                return;
            }

            const groupResults: ResultItem[] = [];

            // עבור על כל משחק בקבוצה
            for (const game of localGameGroups[groupIndex]) {
                const result = await testSingleGame(page, game);
                groupResults.push(result);
            }

            // הוספת התוצאות למשתנה הגלובלי ושמירה לקובץ
            await addResultsAndSave(groupResults);

            // סיכום קבוצה
            const supportedGames = groupResults.filter(r => r.result !== false).length;
            const unsupportedGames = groupResults.length - supportedGames;

            console.log(`Group ${groupIndex + 1} summary: ${supportedGames} supported games, ${unsupportedGames} unsupported games`);
        });
    }
});

// בדיקה אופציונלית למשחקים ספציפיים
test('test specific games', async ({ page }) => {
    test.setTimeout(120_000); // הגדלת ה-timeout ל-2 דקות

    // רשימת ID של משחקים ספציפיים לבדיקה
    const specificGameIds = ['208', '209', '210']; // דוגמה - יש להחליף עם ID אמיתיים

    // טעינת רשימת המשחקים
    const result = await getSerialTestGameList();
    const specificGameList = result.gameList;

    if (specificGameList.length === 0) {
        test.skip(true, 'Could not load game list');
        return;
    }

    // סינון רשימת המשחקים לפי ה-IDs הספציפיים
    const filteredGames = specificGameList.filter(game => specificGameIds.includes(game.id));

    if (filteredGames.length === 0) {
        test.skip(true, 'No matching games found');
        return;
    }

    // התחברות לאתר ג'ינג'ים
    await loginToGingim(page);

    const results: ResultItem[] = [];

    // עבור על כל משחק ברשימה המסוננת
    for (const game of filteredGames) {
        const result = await testSingleGame(page, game);
        results.push(result);
    }

    // הוספת התוצאות למשתנה הגלובלי ושמירה לקובץ
    await addResultsAndSave(results);

    // סיכום התוצאות
    const supportedGames = results.filter(r => r.result !== false).length;
    const unsupportedGames = results.length - supportedGames;

    console.log(`Specific games summary: ${supportedGames} supported games, ${unsupportedGames} unsupported games`);
});