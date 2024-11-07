
(function loadExternalScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
})('utl');

async function a() {
    javascript: fetch('url')
        .then(r => r.text())
        .then(c => eval(c));

    javascript: fetch('url')
        .then(res => res.text())
        .then(code => eval(code));

    javascript: eval(await (await fetch('url')).text());

    javascript: eval(await (await fetch('https://user.github.io/repo/index.js')).text())();
}

const injectionScriptURL = 'url';

if (window.location.hostname === 'gingim.net') fetch(injectionScriptURL)
    .then(r => r.text())
    .then(c => eval(c));