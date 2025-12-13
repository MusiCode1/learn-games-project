// mode: development 
(() => {

    const selfUrlStr = getUrlWithESNext();
    const esNextSupport = (selfUrlStr.length > 1);

    if (esNextSupport) {

        const mode = 'development';
        const selfUrl = new URL(selfUrlStr).origin;
        const moduleUrl = selfUrl + '/src/main.ts?withESNext=true';

        import(moduleUrl)
            .then(mainModule => mainModule.main(mode))
            .then(() => console.log('the gingim-booster module loaded!'))
            .catch(error => console.error('the gingim-booster module catched!', error))

    } else {

        const url = 'https://preview.gingim.tzlev.ovh/src/main.ts'; loadExternalScript(url);
    }
})();

function loadExternalScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
}

function getUrlWithESNext() {

    try {
        return import.meta.url;
    } catch {
        console.error('`import.meta.url` is not supported');
        return '';
    }
}