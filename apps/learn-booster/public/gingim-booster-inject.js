 
// ==UserScript==
// @name        gingim-booster-inject.js
// @description Code injection of gingim-booster
// @match       https://gingim.net/games*
// ==/UserScript==
(function shortInject() {
    
    const url = '//gingim-booster.vercel.app/i.js'
    fetch(url).then(r => r.text()).then(eval)
})();
