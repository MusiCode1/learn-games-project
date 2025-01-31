// ==UserScript==
// @name        gingim-booster-inject.js
// @description Code injection of gingim-booster
// @match       https://gingim.net/games*
// ==/UserScript==

(function shortInject() {
    window.config = {

    };

    const url = '//musicode1.github.io/gingim-booster/i.js'
    fetch(url).then(r => r.text()).then(eval)

})();
