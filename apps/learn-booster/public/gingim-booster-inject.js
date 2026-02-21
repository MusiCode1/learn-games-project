

// ==UserScript==
// @name        gingim-booster-inject.js
// @description Code injection of gingim-booster
// @match       https://gingim.net/games*
// @version     0.0.1
// ==/UserScript==

/**
 * mode: production 
 */

(() => {
    if (window.location.hostname === 'gingim.net') {

        const url = 'https://undefined/i.js';
        import(url);

        // old way
        /* 
        fetch(url).then(r => r.text()).then(eval)
        */
    }
})();
