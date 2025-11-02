// סוגי הזרקת קוד
export type InjectionMethod = 'direct' | 'monitor';

export interface GameConfig {
    gameName: string,
    gameNameHeb?: string,
    triggerFunc: FunctionConfig,
    delay: number,
    gameUrlPath?: string,
    injectionMethod?: InjectionMethod
};

interface FunctionConfig {
    name: string,
    path: string
};

const rootPath = 'PIXI.game.state.states.game';

const functionNames = [
    'makeNewTurn',

    'makeMovie',
    'onShowAnimation',
    'makeBigMovie',
    'playEndLevelAnimation',
    'makeAnimation',
    'onStartAnim'

] as const;

type FunctionKey = typeof functionNames[number];
type FunctionsListType = Record<FunctionKey, FunctionConfig>;

export const functionsList = Object.fromEntries(
    functionNames.map(name => [
        name,
        { name, path: `${rootPath}.${name}` }
    ])
) as FunctionsListType;

export const defaultGameConfig: GameConfig = {
    gameName: 'default',
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    injectionMethod: "direct"
};

export const gameConfigs: GameConfig[] = [{
    gameName: 'tidy_up',
    gameNameHeb: "סדר את החדר",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/tidy_up/',
    injectionMethod: "direct"
}, {
    gameName: 'touch_go',
    gameNameHeb: "לחץ וסע",
    triggerFunc: functionsList.makeNewTurn,
    delay: 100,
    gameUrlPath: '/wp-content/uploads/new_games/touch_go/',
    injectionMethod: "direct"
},

// משחק עם פונקציה שונה
{
    gameName: 'transport',
    gameNameHeb: "כלי תחבורה",
    triggerFunc: functionsList.playEndLevelAnimation,
    delay: 1000 * 5,
    gameUrlPath: '/wp-content/uploads/new_games/transport/',
    injectionMethod: "direct"
}];
