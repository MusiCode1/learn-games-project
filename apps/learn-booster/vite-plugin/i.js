// mode: @mode 
(() => {

    const selfUrlStr = getUrlWithESNext();
    const esNextSupport = (selfUrlStr.length > 1);

    if (esNextSupport) {

        const mode = '@mode';
        const selfUrl = new URL(selfUrlStr).origin;
        const moduleUrl = selfUrl + '@mainPath';

        import(moduleUrl)
            .then(mainModule => mainModule.main(mode))
            .then(() => console.log('the gingim-booster module loaded!'))
            .catch(error => console.error('the gingim-booster module catched!', error))

    } else {

        const url = '@theUrl'; loadExternalScript(url);
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