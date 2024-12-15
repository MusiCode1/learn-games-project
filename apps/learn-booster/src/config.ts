import type { Config } from "./types";

const selfUrl = import.meta.url;

export const defaultConfig: Config = {
    videoDisplayTimeInMS: 20 * 1000,
    videoUrl: new URL("videos/video.webm", new URL(selfUrl).origin).toString(),
    type: "video/webm",
    mode: "video"
};

export const config: Config = {
    ...defaultConfig,
    ...(typeof window !== 'undefined' && window.config ? window.config : {})
};
