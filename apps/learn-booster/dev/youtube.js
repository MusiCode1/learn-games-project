/**@typedef {import('youtube-player/dist/types').IframeApiType} Youtube */

var player;



function onYouTubeIframeAPIReady() {

    const videoId = 'M7lc1UVf-VE';
    const elementId = 'player';

    const iframe = document.createElement('iframe');

    const params = new URLSearchParams({
        playsinline: 1,
        enablejsapi: 1,
        disablekb: 1,
        controls: 0,
        rel: 0,
        fs: 0
    });

    const videoURL = new URL('https://www.youtube.com/embed/' + videoId);
    videoURL.search = params.toString();

    iframe.src = videoURL.toString();
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.id = elementId;


    document.getElementById(elementId).replaceWith(iframe);



    /**@type {Youtube} */
    const YoutubeConstractor = YT;

    player = new YoutubeConstractor.Player(elementId, {

        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    window.player = player;
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}
function stopVideo() {
    player.stopVideo();

}