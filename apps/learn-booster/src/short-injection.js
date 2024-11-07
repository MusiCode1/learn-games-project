
(function loadExternalScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
})('https://musicode1.github.io/FullyKiosk/gingim-video-cover/index.js');

async function a() {
    javascript: fetch('https://musicode1.github.io/FullyKiosk/gingim-video-cover/short-injection.js')
        .then(r => r.text())
        .then(c => eval(c));

    javascript: fetch('https://musicode1.github.io/FullyKiosk/gingim-video-cover/short-injection.js')
        .then(res => res.text())
        .then(code => eval(code));

    javascript: eval(await (await fetch('https://musicode1.github.io/FullyKiosk/gingim-video-cover/short-injection.js')).text());

    javascript: eval(await (await fetch('https://user.github.io/repo/index.js')).text())();
}

const injectionScriptURL = 'https://musicode1.github.io/FullyKiosk/gingim-video-cover/short-injection.js';

if (window.location.hostname === 'gingim.net') fetch(injectionScriptURL)
    .then(r => r.text())
    .then(c => eval(c));