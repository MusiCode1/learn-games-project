import type { Config } from "./types";

const selfUrl = import.meta.url;
const devMode = import.meta.env.DEV;


// @ts-ignore
let videoUrl = devMode ?
    new URL("videos/video.webm", new URL(selfUrl).origin).toString() :
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';



if (window.FullyKiosk) {
    videoUrl = 'http://localhost/sdcard/Movies/video.mp4';
}

export const defaultConfig: Config = {
    videoDisplayTimeInMS: 20 * 1000,
    videoUrl,
    type: "video/webm",
    mode: "video"
};

export const config: Config = {
    ...defaultConfig,
    ...(typeof window !== 'undefined' && window.config ? window.config : {})
};
