/**
 * מייצג פריט (קובץ או תיקייה) במערכת הקבצים של Fully Kiosk
 */
interface FullyItem {
    canRead: boolean;
    canWrite: boolean;
    isHidden: boolean;
    lastModified: number;
    name: string;
    size: number;
    type: "file" | "folder";
}

const MOVIES_PATH = '/sdcard/Movies/';
const BASE_URL = 'https://localhost';

/**
 * מערבב מערך באופן אקראי באמצעות אלגוריתם Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
    if (!window.fully) {
        throw new Error("fully-kiosk API is not available");
    }

    const fileListStr = window.fully.getFileList(MOVIES_PATH);
    if (!fileListStr) {
        return false;
    }

    const fileList = JSON.parse(fileListStr) as FullyItem[];
    const mp4Files = filterMP4Files(fileList);
    const shuffledFiles = shuffleArray(mp4Files);
    
    return shuffledFiles.map(item => BASE_URL + MOVIES_PATH + item.name);
}
