/* eslint-disable no-undef */
// @ts-nocheck
(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = '//dev-server.dev:443/src/main.ts';

    loadExternalScript(url);
})();
