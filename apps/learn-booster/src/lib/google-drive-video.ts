import type { DriveFile } from "../types";

const key = import.meta.env.VITE_GOOGLE_DRIVE_API_TOKEN;

const baseUrl = new URL('https://www.googleapis.com');

export const getVideoUrl = (fileId: string): string => {

    const url = new URL(baseUrl);

    url.pathname = '/drive/v3/files/' + fileId;

    url.searchParams.append('alt', 'media');
    url.searchParams.append('key', key);

    return url.toString();
};

export const getFilesFromGDrive = async (folderId: string): Promise<DriveFile[]> => {

    const url = new URL(baseUrl);

    url.pathname = '/drive/v3/files';

    url.searchParams.append('key', key);
    url.searchParams.append('q', `'${folderId}' in parents and trashed = false`);

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`שגיאה בקבלת קבצים מתיקייה: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files;
};

export const getFolderVideosUrls = async (folderId: string): Promise<string[]> => {

    const files = await getFilesFromGDrive(folderId);
    return files.map(file => getVideoUrl(file.id));
};

/**
 * מחלץ את מזהה התיקייה מתוך כתובת URL של גוגל דרייב
 * @param url כתובת URL של תיקיית גוגל דרייב
 * @returns מזהה התיקייה או את ה-URL המקורי אם לא נמצא מזהה
 */
export function extractGoogleDriveFolderId(url: string): string {
    if (!url) return url;
    
    try {
        const urlObj = new URL(url);
        // בדיקה אם זה URL של גוגל דרייב
        if (urlObj.hostname === 'drive.google.com') {
            // חילוץ ה-ID מה-URL
            const matches = url.match(/folders\/([a-zA-Z0-9-_]+)/);
            if (matches && matches[1]) {
                return matches[1];
            }
        }
    } catch (e) {
        // אם ה-URL לא תקין, נחזיר את הערך המקורי
        console.error('URL לא תקין:', e);
    }
    
    return url;
}
