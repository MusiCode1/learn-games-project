export const config = {
    video: ''
}


const rootPath = 'PIXI.game.state.states.game';

export const functionsList = {

    makeMovie: {
        name: 'makeMovie',
        path: 'PIXI.game.state.states.game.makeMovie'
    },

    onShowAnimation: {
        name: 'onShowAnimation',
        path: 'PIXI.game.state.states.game.onShowAnimation'
    },
    makeBigMovie: {
                name: 'makeBigMovie',
        path: 'PIXI.game.state.states.game.makeBigMovie'
    }
};

export const defaultGame = {
    gameName: 'default',
    triggerFunc: null,
    delay: 5 * 1000,
    urlPath: null
};

export const gameConfigs = [
    {
        gameName: 'tidy_up',
        triggerFunc: functionsList.makeMovie,
        delay: 5 * 1000,
        urlPath: '/wp-content/uploads/new_games/tidy_up/'
    },
    {
        gameName: 'touch_go',
        triggerFunc: functionsList.makeMovie,
        delay: 5 * 1000,
        urlPath: 'wp-content/uploads/new_games/touch_go/'
    },
    {
        gameName: 'earase_animals',
        triggerFunc: functionsList.onShowAnimation,
        delay: 5 * 1000,
        urlPath: '/wp-content/uploads/new_games/earase_animals/'
    },
    {
        gameName: 'earase_animals',
        triggerFunc: functionsList.onShowAnimation,
        delay: 5 * 1000,
        urlPath: '/wp-content/uploads/new_games/earase_animals/'
    },
    {
        gameName: 'placeValue_eggs',
        triggerFunc: functionsList.makeBigMovie,
        delay: 3 * 1000,
        urlPath: '/wp-content/uploads/new_games/placeValue_eggs/'
    }
];