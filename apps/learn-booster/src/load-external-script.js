import logger from "./logger.js";

function getCodeString (scriptURL) {
    const fnName = loadExternalScript.name;
    let funStr = "\n";
    funStr += loadExternalScript.toString();
    funStr += "\n\n";
    funStr += `${fnName}('${scriptURL}')\n`;

    return funStr;
}

function InjectCodeIntoIframe(scriptURL) { 

    function injectFunction (iframe) {

        try {
            logger.log('iFrame creating!');

            const script = iframe.contentDocument.createElement('script');
            const codeString = getCodeString(scriptURL);
            script.textContent = codeString;

            logger.log('Script ready for injection...');

            iframe.contentWindow.onload = () => {
                iframe.contentDocument.head.appendChild(script);
            }

            logger.log('The script has been injected');

        } catch (e) {
            console.error('Cannot access iframe due to cross-origin restrictions');
            console.error(e);
            
        }
    }



    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IFRAME') {
                    injectFunction(node)
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

}

function loadExternalScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
}

const devURL = 'https://localhost/gingim-video-cover/index.js?v=0.1'

// loadExternalScript(devURL)


export {
    InjectCodeIntoIframe,
    loadExternalScript
}