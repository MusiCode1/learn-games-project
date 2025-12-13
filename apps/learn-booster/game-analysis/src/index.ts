import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

interface Category {
    id: string;
    name: string;
    parent?: {
        id: string;
        name: string;
    }
}

interface GameFromList {
    id: string;
    name: string;
    url: string;
    categories: Category[];
}

interface GamesData {
    categories: {
        main: { id: string; name: string; }[];
        sub: { id: string; name: string; parentId?: string; }[];
    };
    games: GameFromList[];
}

interface GameAnalysis {
    id: string;
    name: string;
    url: string;
    categories: Category[];
    functions: string[];  // רק שמות הפונקציות
}

async function login(page: Page): Promise<void> {
    await page.goto('https://gingim.net/login');
    await page.fill('#user_login', 'צוהר לטוהר');
    await page.fill('#user_pass', 'רכסים');
    await page.click('.tml-button');
    await page.waitForTimeout(2000);
}

async function analyzeGame(page: Page, game: GameFromList): Promise<GameAnalysis> {
    console.log(`\nAnalyzing game: ${game.name}`);
    console.log(`URL: ${game.url}`);
    
    // ביצוע בקשת POST למשחק
    await page.evaluate(async (url) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        window.location.href = url;
    }, game.url);

    await page.waitForTimeout(5000); // המתנה לטעינת המשחק

    const functions = await page.evaluate(() => {
        if (!window.PIXI?.game?.state?.states?.game) {
            return 'Game object not found';
        }
        
        const game = window.PIXI.game.state.states.game;
        return Object.keys(game)
            .filter(key => typeof game[key] === 'function');
    });

    console.log('Functions found:', functions);
    
    await page.waitForTimeout(2000); // המתנה בין משחקים

    return {
        id: game.id,
        name: game.name,
        url: game.url,
        categories: game.categories,
        functions: Array.isArray(functions) ? functions : []
    };
}

async function loadGamesList(): Promise<GamesData> {
    const gamesListPath = join('..', 'temp', 'games-list.json');
    const data = await readFile(gamesListPath, 'utf-8');
    return JSON.parse(data);
}

async function saveResults(results: GameAnalysis[]): Promise<void> {
    const outputPath = join('..', 'temp', 'games-analysis.json');
    await writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Results saved to ${outputPath}`);
}

async function main(): Promise<void> {
    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    const results: GameAnalysis[] = [];

    try {
        // טעינת רשימת המשחקים
        const gamesData = await loadGamesList();
        
        // התחברות
        await login(page);
        
        // ניתוח כל משחק
        for (const game of gamesData.games) {
            try {
                const analysis = await analyzeGame(page, game);
                results.push(analysis);
            } catch (error) {
                console.error(`Error analyzing game ${game.name}:`, error);
            }
        }

        await saveResults(results);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
