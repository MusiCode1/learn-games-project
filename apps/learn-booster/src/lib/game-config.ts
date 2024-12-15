interface gameConfig {
    gameName: string,
    gameNameHeb?: string,
    triggerFunc: FunctionConfig,
    delay: number,
    gameUrlPath: string
};

interface FunctionConfig {
    name: string,
    path: string
};

interface FunctionsConfig {
    [functionName: string]: FunctionConfig
}

const rootPath = 'PIXI.game.state.states.game';

export const functionsList: FunctionsConfig = {

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
    }
};

export const defaultGame = {
    gameName: 'default',
    triggerFunc: null,
    delay: 5 * 1000,
    gameUrlPath: null
};

export const gameConfigs: gameConfig[] = [{
    gameName: 'tidy_up',
    gameNameHeb: "סדר את החדר",
    triggerFunc: functionsList.makeMovie,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/tidy_up/'
}, {
    gameName: 'touch_go',
    gameNameHeb: "לחץ וסע",
    triggerFunc: functionsList.makeMovie,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/touch_go/'
},
{
    gameName: 'earase_animals',
    gameNameHeb: "מחק וגלה בעלי חיים",
    triggerFunc: functionsList.onShowAnimation,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/earase_animals/'
},
{
    gameName: 'earase_animals',
    gameNameHeb: "מחק וגלה בעלי חיים",
    triggerFunc: functionsList.onShowAnimation,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/earase_animals/'
},
{
    gameName: 'puzzle_2',
    gameNameHeb: "פאזל",
    triggerFunc: functionsList.playEndLevelAnimation,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/puzzle_2/'
},
{
    gameName: 'animals',
    gameNameHeb: "בעלי חיים",
    triggerFunc: functionsList.playEndLevelAnimation,
    delay: 5 * 1000,
    gameUrlPath: '/wp-content/uploads/new_games/animals/'
}];
