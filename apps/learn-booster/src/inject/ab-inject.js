(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const baseUrl = new URL('https://dev-server.dev');
    const url = new URL('src/app-booster.js', baseUrl);
    loadExternalScript(url.toString());
})();