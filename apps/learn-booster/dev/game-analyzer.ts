import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface Game {
    name: string;
    url: string;
}

interface GameFunction {
    name: string;
    code: string;
}

const games: Game[] = [{
    "name": "כלי תחבורה",
    "url": "https://gingim.net/wp-content/uploads/new_games/transport?lang=heb"
},
{
    "name": "בעלי חיים",
    "url": "https://gingim.net/wp-content/uploads/new_games/animals?lang=heb"
},
{
    "name": "פאזל אנשים",
    "url": "https://gingim.net/wp-content/uploads/new_games/puzzle_people/?lang=heb"
},
{
    "name": "פאזל שני חלקים",
    "url": "https://gingim.net/wp-content/uploads/new_games/puzzle_3/?lang=heb"
},
{
    "name": "מחק וגלה בעלי חיים",
    "url": "https://gingim.net/wp-content/uploads/new_games/earase_animals/?lang=heb"
},
{
    "name": "מחקו וגלו תחפושות",
    "url": "https://gingim.net/wp-content/uploads/new_games/earase_purim?lang=heb"
},
{
    "name": "פנס",
    "url": "https://gingim.net/wp-content/uploads/new_games/flash_light/?lang=heb"
},
{
    "name": "מחק וגלה",
    "url": "https://gingim.net/wp-content/uploads/new_games/earase_2/?lang=heb"
},
{
    "name": "מה קרה?",
    "url": "https://gingim.net/wp-content/uploads/new_games/touch_n_look?lang=heb"
},
{
    "name": "פאזל",
    "url": "https://gingim.net/wp-content/uploads/new_games/puzzle_2?lang=heb"
},
{
    "name": "תפוס אותי",
    "url": "https://gingim.net/wp-content/uploads/new_games/catch_me/?lang=heb"
},
{
    "name": "תפוס אותי",
    "url": "https://gingim.net/wp-content/uploads/new_games/catch_hanuka/?lang=heb"
},
{
    "name": "הפתעה בקופסה",
    "url": "https://gingim.net/wp-content/uploads/new_games/box?lang=heb"
},
{
    "name": "לחץ וסע",
    "url": "https://gingim.net/wp-content/uploads/new_games/touch_go/?lang=heb"
},
{
    "name": "סדר את החדר",
    "url": "https://gingim.net/wp-content/uploads/new_games/tidy_up/?lang=heb"
},
{
    "name": "כלי נגינה",
    "url": "https://gingim.net/wp-content/uploads/new_games/music/?lang=heb"
},
{
    "name": "כדורסל",
    "url": "https://gingim.net/wp-content/uploads/new_games/basketball_ce/?lang=heb"
},
{
    "name": "מכוניות מירוץ",
    "url": "https://gingim.net/wp-content/uploads/new_games/car_race/?lang=heb"
},
{
    "name": "תמונות מנגנות",
    "url": "https://gingim.net/wp-content/uploads/new_games/music_cause_effect2?lang=heb"
},
{
    "name": "צביעת מספרים",
    "url": "https://gingim.net/wp-content/uploads/new_games/painting_numbers/?lang=heb"
},
{
    "name": "צְבִיעַת אוֹתִיּוֹת",
    "url": "https://gingim.net/wp-content/uploads/new_games/painting_letters/?lang=heb"
},
{
    "name": "נדנדה",
    "url": "https://gingim.net/wp-content/uploads/new_games/seesaw_action_reaction/?lang=heb"
}];

async function login(page: Page): Promise<void> {
    await page.goto('https://gingim.net/login');
    await page.fill('#user_login', 'צוהר לטוהר');
    await page.fill('#user_pass', 'רכסים');
    await page.click('.tml-button');
    await page.waitForTimeout(2000); // המתנה להתחברות
}

async function analyzeGame(page: Page, game: Game): Promise<void> {
    try {
        console.log(`\nAnalyzing game: ${game.name}`);
        console.log(`URL: ${game.url}`);
        
        await page.goto(game.url);
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
    } catch (error) {
        console.error(`Error analyzing game ${game.name}:`, error);
    }
}

async function main(): Promise<void> {
    const browser: Browser = await chromium.launch({ headless: false });
    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();

    try {
        await login(page);
        
        for (const game of games) {
            await analyzeGame(page, game);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
