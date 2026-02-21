import type { FullyItem, FullyKiosk } from '../../types'
const MOVIES_PATH = '/sdcard/Movies/';
const BASE_URL = 'https://localhost';

export const isFullyKiosk = (): boolean => (!!window.fully)

declare global {
    interface Window {
        fully?: FullyKiosk;
    }
}

function filterMP4Files(items: FullyItem[]): FullyItem[] {
    return items.filter(item => item.type === 'file' && item.name.endsWith('.mp4'));
}

export function getFileList(): string[] | false {
    if (!isFullyKiosk()) {
        throw new Error("fully-kiosk API is not available");
    }

    const fileListStr = window.fully!.getFileList(MOVIES_PATH);
    if (!fileListStr) {
        return false;
    }

    const fileList = JSON.parse(fileListStr) as FullyItem[];
    const mp4Files = filterMP4Files(fileList);

    return mp4Files.map(item => BASE_URL + MOVIES_PATH + item.name);
}

export async function getVideoBlob(videoUrl: string): Promise<string> {
    try {
        if (!videoUrl.startsWith(BASE_URL)) {
            throw new Error('Invalid video URL');
        }

        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        const blobUrl = URL.createObjectURL(videoBlob);

        window.addEventListener('unload', () => {
            URL.revokeObjectURL(blobUrl);
        });

        return blobUrl;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred');
    }
}
