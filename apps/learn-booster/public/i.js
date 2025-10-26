// mode: development 
(() => {
    function loadExternalScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.type = 'module';
        document.head.appendChild(script);
    }

    const url = 'https://192.168.33.116/src/main.ts';

    loadExternalScript(url);
})();
