import type { Config } from './types';
import { getVideoUrl, videoList } from './lib/google-drive-video';

const selfUrl = import.meta.url;
const devMode = import.meta.env.DEV;

console.log(import.meta.env);

// הפיכת רשימת הסרטונים למערך של כתובות URL
let videoUrls = videoList.map(video => getVideoUrl(video.fileId));

const localVideo = new URL('videos/video.webm', new URL(selfUrl).origin).toString(),
    BigBuckBunny = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

let defaultVideoUrl = devMode ? localVideo : BigBuckBunny;

videoUrls.push(
    devMode ? localVideo : BigBuckBunny
);

if (window.FullyKiosk) {
    const localFullyVideo = 'https://localhost/sdcard/Movies/video.mp4';
    videoUrls = [localFullyVideo];
}

export const defaultConfig: Config = {
    videoDisplayTimeInMS: 20 * 1000,
    videoUrls,
    type: 'video/webm',
    mode: 'video'
};

export const config: Config = {
    ...defaultConfig,
    ...(typeof window !== 'undefined' && window.config ? window.config : {})
};
