
(() => {

    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const bootstrapURL = '//localhost/src/app-booster.js';
    const devURL = 'https://dev-server.dev/src/app-booster.js';
    loadExternalScript(devURL);

})();