import { log } from "./logger.svelte";

export function loadExternalScript(url: string) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
}

function getCodeInjectorString(scriptUrl: string) {
    const fnName = loadExternalScript.name;
    let funStr = "\n";
    funStr += loadExternalScript.toString();
    funStr += "\n\n";
    funStr += `${fnName}('${scriptUrl}')\n`;

    return funStr;
}

function getScriptInjectorCode(document: Document, scriptUrl: string): HTMLScriptElement {
    const script = document.createElement('script');
    const codeString = getCodeInjectorString(scriptUrl);
    script.textContent = codeString;
    return script;
}

function getLinkCode(document: Document, props: object) {
    const link = document.createElement('link');
    Object.assign(link, props);
    return link;
}

function injectHeeboFont(document: Document) {
    const fontsLink = [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap'
    }];

    return fontsLink.map(fontLink => getLinkCode(document, fontLink));
}

export function injectCodeIntoIframe(scriptUrl: string) {

    function injectFunction(iframe: HTMLIFrameElement) {
        try {
            let iframeDocument = iframe.contentDocument as Document;
            let iframeWindow = iframe.contentWindow as Window;

            if (!iframeDocument) {
                if (iframe.contentWindow?.document)
                    iframeDocument = iframeWindow?.document!;

                if (!iframeDocument)
                    throw new Error("iframe not have document prop");

                if (!iframeWindow)
                    throw new Error("iframe not have window prop");

                if (iframe.contentEditable !== 'true')
                    throw new Error("iframe don't editable");
            }

            const script = iframeDocument.createElement('script');
            const codeString = getCodeInjectorString(scriptUrl);
            script.textContent = codeString;

            const envConfig = (window?.config) ? { ...window?.config } : null;

            iframeWindow.onload = (event) => {

                // @ts-ignore
                envConfig ? iframe.contentWindow.config = envConfig : null;

                const script = getScriptInjectorCode(iframe.contentDocument!, scriptUrl);
                const links = injectHeeboFont(iframe.contentDocument!);

                iframe.contentDocument!.head.appendChild(script);
                iframe.contentDocument!.head.append(...links);

                log('The script has been injected');
            }

        } catch (e) {
            console.error('Cannot access iframe due to cross-origin restrictions');
            console.error(e);
        }
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') return;

            for (const node of mutation.addedNodes) {

                if (node.nodeName === 'IFRAME')
                    injectFunction(node as HTMLIFrameElement);

            }

        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    log('The iframe injection script is loaded.');

}
