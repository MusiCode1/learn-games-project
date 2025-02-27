// prod inject

(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = '//gingim-booster.vercel.app/main.js';
    loadExternalScript(url);
})();
