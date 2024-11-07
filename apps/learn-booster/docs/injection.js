
(() => {

    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const bootstrapURL = 'https://musicode1.github.io/gingim-booster/index.js';
    loadExternalScript(bootstrapURL);

})();
