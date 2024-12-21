export interface GameConfig {
    gameName: string,
    gameNameHeb?: string,
    triggerFunc: FunctionConfig,
    delay: number,
    gameUrlPath: string | null
};

interface FunctionConfig {
    name: string,
    path: string
};

const rootPath = 'PIXI.game.state.states.game';

const functionsListObj = {
    makeMovie: {
        name: 'makeMovie',
        path: rootPath + '.makeMovie'
    },
    onShowAnimation: {
        name: 'onShowAnimation',
        path: rootPath + '.onShowAnimation'
    },
    makeBigMovie: {
        name: 'makeBigMovie',
        path: rootPath + '.makeBigMovie'
    },
    playEndLevelAnimation: {
        name: 'playEndLevelAnimation',
        path: rootPath + '.playEndLevelAnimation'
    },
    makeAnimation: {
        name: 'makeAnimation',
        path: rootPath + '.makeAnimation'
    },
    onStartAnim: {
        name: 'onStartAnim',
        path: rootPath + '.onStartAnim'
    },
    makeNewTurn: {
        name: 'makeNewTurn',
        path: rootPath + '.makeNewTurn'
    }

} as const;

type FunctionName = keyof typeof functionsListObj;
type FunctionsConfig = {
    [K in FunctionName]: {
        name: K,
        path: string
    }
};

export const functionsList: FunctionsConfig = functionsListObj;

export const defaultGameConfig = {
    gameName: 'default',
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: null
};

export const gameConfigs: GameConfig[] = [{
    gameName: 'tidy_up',
    gameNameHeb: "סדר את החדר",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/tidy_up/'
}, {
    gameName: 'touch_go',
    gameNameHeb: "לחץ וסע",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/touch_go/'
},
{
    gameName: 'earase_animals',
    gameNameHeb: "מחק וגלה בעלי חיים",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/earase_animals/'
},
{
    gameName: 'puzzle_2',
    gameNameHeb: "פאזל",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/puzzle_2/'
},
{
    gameName: 'animals',
    gameNameHeb: "בעלי חיים",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/animals/'
},
{
    gameName: 'transport',
    gameNameHeb: "כלי תחבורה",
    triggerFunc: functionsList.playEndLevelAnimation,
    delay: 1000 * 5,
    gameUrlPath: '/wp-content/uploads/new_games/transport/'
},
{
    gameName: 'puzzle_3',
    gameNameHeb: "פאזל שני חלקים",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/puzzle_3/'
}, {
    gameName: 'earase_purim',
    gameNameHeb: "מחקו וגלו תחפושות",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/earase_purim/'
},
{
    gameName: 'catch_me',
    gameNameHeb: "תפוס אותי",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/catch_me/'
}, {
    gameName: 'catch_hanuka',
    gameNameHeb: "תפוס אותי",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/catch_hanuka/'
}, {
    gameName: 'box',
    gameNameHeb: "הפתעה בקופסה",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/box/'
}];
