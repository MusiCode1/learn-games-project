import { log } from "./logger.svelte";

export function loadExternalScript(url: string) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
}


function getCodeString(scriptUrl: string) {
    const fnName = loadExternalScript.name;
    let funStr = "\n";
    funStr += loadExternalScript.toString();
    funStr += "\n\n";
    funStr += `${fnName}('${scriptUrl}')\n`;

    return funStr;
}

export function InjectCodeIntoIframe(scriptUrl: string) {

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
            const codeString = getCodeString(scriptUrl);
            script.textContent = codeString;

            iframeWindow.onload = (event) => {
                iframe.contentDocument!.head.appendChild(script);
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
