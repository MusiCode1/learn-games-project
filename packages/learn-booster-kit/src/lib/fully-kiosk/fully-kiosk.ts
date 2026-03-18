import type { FullyKiosk } from '../../types'
import { FullyItemSchema } from '../../schemas'
import { type } from 'arktype'

const MOVIES_PATH = '/sdcard/Movies/';
const BASE_URL = 'https://localhost';

export const isFullyKiosk = (): boolean => (!!window.fully)

declare global {
    interface Window {
        fully?: FullyKiosk;
    }
}

export function getFileList(): string[] | false {
    if (!isFullyKiosk()) {
        throw new Error("fully-kiosk API is not available");
    }

    const fileListStr = window.fully!.getFileList(MOVIES_PATH);
    if (!fileListStr) {
        return false;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(fileListStr);
    } catch {
        console.error("[fully-kiosk] Invalid JSON from getFileList");
        return false;
    }

    const result = FullyItemSchema.array()(parsed);
    if (result instanceof type.errors) {
        console.error("[fully-kiosk] getFileList response invalid:", result.summary);
        return false;
    }

    const mp4Files = result.filter(item => item.type === 'file' && item.name.endsWith('.mp4'));
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
