
(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = '//musicode1.github.io/gingim-booster/main.js';
    loadExternalScript(url);
})();

function shortInject() {
    if (window.location.hostname === 'gingim.net') {
        window.config = {
            videoDisplayTimeInMS: 1000 * 30
        };
        const url = '//musicode1.github.io/gingim-booster/i.js';
        fetch(url).then(r => r.text()).then(eval);
    }
}

function shortInjectWithShortUrl() {
    if (window.location.hostname === 'gingim.net') {
        url = '//is.gd/GingimV02';
        fetch(url, { mode: 'no-cors', redirect: 'follow' }).then(r => r.text()).then(eval);
    }
}