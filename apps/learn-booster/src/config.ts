export interface Config {
    videoDisplayTimeInMS: number,
    videoUrl: string,
    mode: string
}

export const config: Config = {
    videoDisplayTimeInMS: 20 * 1000,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mode: 'video'
};