// מקבל את כל הפונקציות במשחק
const game = PIXI.game.state.states.game;
const functions = Object.keys(game).filter(key => typeof game[key] === 'function');

// שומר את הפונקציות המקוריות
const originalFunctions = {};

// מזריק את ההדפסות
functions.forEach(funcName => {
    originalFunctions[funcName] = game[funcName];
    game[funcName] = function(...args) {
        console.log('Function called:', funcName);
        return originalFunctions[funcName].apply(this, args);
    };
});

console.log('הוזרקו הדפסות ל-' + functions.length + ' פונקציות:');
console.log(functions);

// פונקציה להחזרת הפונקציות המקוריות
window.restoreOriginalFunctions = function() {
    Object.keys(originalFunctions).forEach(funcName => {
        game[funcName] = originalFunctions[funcName];
    });
    console.log('הפונקציות הוחזרו למצבן המקורי');
};
