import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface Category {
    id: string;
    name: string;
    subCategories?: {
        id: string;
        name: string;
    }[];
    parentId?: string;
}

interface Game {
    id: string;
    name: string;
    url: string;
    categories: {
        id: string;
        name: string;
        parent?: {
            id: string;
            name: string;
        }
    }[];
}

interface GamesData {
    categories: {
        main: Category[];
        sub: Category[];
    };
    games: Game[];
}

async function login(page: Page): Promise<void> {
    await page.goto('https://gingim.net/login');
    await page.fill('#user_login', 'צוהר לטוהר');
    await page.fill('#user_pass', 'רכסים');
    await page.click('.tml-button');
    await page.waitForTimeout(2000);
}

async function getCategories(page: Page): Promise<GamesData['categories']> {
    // קבלת קטגוריות ראשיות
    const mainCategories = await page.evaluate(() => {
        const filters = document.querySelectorAll('.game_filter_level1');
        return Array.from(filters).map(f => ({
            id: f.getAttribute('data-term-id') || '',
            name: f.textContent?.trim().split('\n')[0].trim() || ''
        })).filter(c => c.id !== '0'); // מסנן את "כל הפעילויות"
    });

    // קבלת תת-קטגוריות
    const subCategories = await page.evaluate(() => {
        const filters = document.querySelectorAll('.game_filter_level2');
        return Array.from(filters).map(f => ({
            id: f.getAttribute('data-term-id') || '',
            name: f.textContent?.trim() || '',
            parentId: f.getAttribute('data-parent-id') || undefined
        }));
    });

    return {
        main: mainCategories,
        sub: subCategories
    };
}

async function getGames(page: Page, categories: GamesData['categories']): Promise<Game[]> {
    return await page.evaluate(({ main, sub }) => {
        const games = document.querySelectorAll('.games_grid_item');
        return Array.from(games).map(game => {
            // מידע בסיסי על המשחק
            const id = game.getAttribute('data-gid') || '';
            const name = game.querySelector('.games_grid_item_title')?.textContent?.trim() || '';
            const url = game.getAttribute('data-href') || '';

            // קטגוריות המשחק
            const categoryIds = (game.getAttribute('data-category') || '').trim().split(' ').filter(Boolean);
            const categories = categoryIds.map(catId => {
                // מחפש קודם בתת-קטגוריות
                const subCat = sub.find(c => c.id === catId);
                if (subCat) {
                    // אם נמצאה תת-קטגוריה, מחפש את הקטגוריה הראשית שלה
                    const mainCat = main.find(c => c.id === subCat.parentId);
                    return {
                        id: subCat.id,
                        name: subCat.name,
                        parent: mainCat ? {
                            id: mainCat.id,
                            name: mainCat.name
                        } : undefined
                    };
                }

                // אם לא נמצאה תת-קטגוריה, מחפש בקטגוריות ראשיות
                const mainCat = main.find(c => c.id === catId);
                if (mainCat) {
                    return {
                        id: mainCat.id,
                        name: mainCat.name
                    };
                }

                // אם לא נמצאה קטגוריה בכלל
                return {
                    id: catId,
                    name: 'Unknown'
                };
            });

            return {
                id,
                name,
                url,
                categories
            };
        });
    }, categories);
}

async function saveResults(data: GamesData): Promise<void> {
    const tempDir = join('..', 'temp');
    const outputPath = join(tempDir, 'games-list.json');

    // יצירת תיקיית temp אם היא לא קיימת
    if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
    }

    await writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Results saved to ${outputPath}`);
}

async function main(): Promise<void> {
    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {
        // התחברות
        await login(page);

        // מעבר לדף המשחקים
        await page.goto('https://gingim.net/games');
        await page.waitForTimeout(2000);

        // איסוף מידע
        const categories = await getCategories(page);
        const games = await getGames(page, categories);

        // שמירת התוצאות
        await saveResults({ categories, games });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
