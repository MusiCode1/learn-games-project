// dev inject

(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = '//dev-server.dev:5173/src/main.ts';
    loadExternalScript(url);
})();