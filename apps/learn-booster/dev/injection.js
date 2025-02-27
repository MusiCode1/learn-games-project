(function () {

    if (window.location.hostname === 'gingim.net') {

        window.config = {
            videoUrl :'http://localhost/sdcard/Movies/video.mp4',
            type: 'video/mp4',
            videoDisplayTimeInMS: 20 * 1000,
            mode: 'video'
        };

        function loadExternalScript(url) {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.type = 'module';
            document.head.appendChild(script);
        }
        const url = 'https://musicode1.github.io/gingim-booster/gingim-booster.js';


        loadExternalScript(url);
    }

})();