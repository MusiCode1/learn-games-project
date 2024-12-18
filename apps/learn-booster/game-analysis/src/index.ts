import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import './types.js';
import { games, type Game } from './games.js';

interface GameFunction {
    name: string;
    code: string;
}

interface GameAnalysis {
    name: string;
    url: string;
    functions: GameFunction[];
}

async function login(page: Page): Promise<void> {
    await page.goto('https://gingim.net/login');
    await page.fill('#user_login', 'צוהר לטוהר');
    await page.fill('#user_pass', 'רכסים');
    await page.click('.tml-button');
    await page.waitForTimeout(2000); // המתנה להתחברות
}

async function analyzeGame(page: Page, game: Game): Promise<GameAnalysis> {
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
            .filter(key => typeof game[key] === 'function')
            .map(key => ({
                name: key,
                code: game[key].toString()
            }));
    });

    console.log('Functions found:');
    console.log(JSON.stringify(functions, null, 2));
    
    await page.waitForTimeout(2000); // המתנה בין משחקים

    return {
        name: game.name,
        url: game.url,
        functions: Array.isArray(functions) ? functions : []
    };
}

async function saveResults(results: GameAnalysis[]): Promise<void> {
    const outputPath = join('results.json');
    await writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Results saved to ${outputPath}`);
}

async function main(): Promise<void> {
    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    const results: GameAnalysis[] = [];

    try {
        await login(page);
        
        for (const game of games) {
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
