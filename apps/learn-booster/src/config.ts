import type { Config } from './types';
import { getVideoUrl, videoList } from './lib/google-drive-video';

const selfUrl = import.meta.url;
const devMode = import.meta.env.DEV;

console.log(import.meta.env);

// הפיכת רשימת הסרטונים למערך של כתובות URL
const videoUrls = videoList.map(video => getVideoUrl(video.fileId));

// @ts-ignore
let defaultVideoUrl = devMode ?
    new URL('videos/video.webm', new URL(selfUrl).origin).toString() :
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

if (window.FullyKiosk) {
    defaultVideoUrl = 'http://localhost/sdcard/Movies/video.mp4';
    videoUrls.splice(0, videoUrls.length, defaultVideoUrl);
}

export const defaultConfig: Config = {
    videoDisplayTimeInMS: 20 * 1000,
    videoUrls: videoUrls,
    type: 'video/webm',
    mode: 'video'
};

export const config: Config = {
    ...defaultConfig,
    ...(typeof window !== 'undefined' && window.config ? window.config : {})
};
