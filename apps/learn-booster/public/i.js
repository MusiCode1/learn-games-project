// mode: development 
(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = 'https://dev-server.dev/src/main.ts';

    loadExternalScript(url);
})();
