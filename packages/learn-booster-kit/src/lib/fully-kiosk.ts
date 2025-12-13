import type { FullyItem, FullyKiosk } from '../types'
const MOVIES_PATH = '/sdcard/Movies/';
const BASE_URL = 'https://localhost';

export const isFullyKiosk = (): boolean => (!!window.fully)

declare global {
    interface Window {
        fully?: FullyKiosk;
    }
}

/**
 * מסנן רק קבצי MP4 מתוך רשימת הפריטים
 */
function filterMP4Files(items: FullyItem[]): FullyItem[] {
    return items.filter(item => item.type === 'file' && item.name.endsWith('.mp4'));
}

/**
 * מחזיר רשימה של כתובות URL לקבצי MP4 מתיקיית הסרטים
 * @returns מערך של כתובות URL או false אם אין גישה לרשימת הקבצים
 * @throws {Error} אם ה-API של Fully Kiosk לא זמין
 */
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

/**
 * יוצר כתובת URL מקומית לקובץ וידאו
 * @param videoUrl כתובת ה-URL של הוידאו
 * @returns כתובת URL מקומית לקובץ הבלוב
 * @throws {Error} אם יש בעיה בהורדת הוידאו או ביצירת ה-blob
 */
export async function getVideoBlob(videoUrl: string): Promise<string> {
    try {
        // בדיקת תקינות ה-URL
        if (!videoUrl.startsWith(BASE_URL)) {
            throw new Error('Invalid video URL');
        }

        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const videoBlob = await response.blob();
        const blobUrl = URL.createObjectURL(videoBlob);

        // ניקוי ה-URL כשהדף נסגר
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
