import type { DriveFile } from "../../types";

const key = import.meta.env.VITE_GOOGLE_DRIVE_API_TOKEN;

if (!key) {
    console.error(
        '[learn-booster] VITE_GOOGLE_DRIVE_API_TOKEN חסר או לא מוגדר. ' +
        'קריאות ל-Google Drive API ייכשלו. הגדר את המשתנה בקובץ .env'
    );
}

const baseUrl = new URL('https://www.googleapis.com');

export const getVideoUrl = (fileId: string): string => {

    const url = new URL(baseUrl);

    url.pathname = '/drive/v3/files/' + fileId;

    url.searchParams.append('alt', 'media');
    url.searchParams.append('key', key);

    return url.toString();
};

export const getFilesFromGDrive = async (folderId: string): Promise<DriveFile[]> => {

    if (!folderId) {
        console.error('[learn-booster] getFilesFromGDrive: מזהה תיקייה ריק או חסר');
        return [];
    }

    const url = new URL(baseUrl);

    url.pathname = '/drive/v3/files';

    url.searchParams.append('key', key);
    url.searchParams.append('q', `'${folderId}' in parents and trashed = false and mimeType contains 'video/'`);

    const response = await fetch(url.toString());

    if (!response.ok) {
        switch (response.status) {
            case 400:
                console.error(
                    `[learn-booster] Google Drive API: בקשה שגויה (400). ` +
                    `בדוק שמזהה התיקייה תקין. folderId: "${folderId}"`
                );
                break;
            case 401:
                console.error(
                    '[learn-booster] Google Drive API: מפתח API לא תקין (401). ' +
                    'בדוק את ערך VITE_GOOGLE_DRIVE_API_TOKEN'
                );
                break;
            case 403:
                console.error(
                    '[learn-booster] Google Drive API: גישה נדחתה (403). ' +
                    'ייתכן שהמכסה חרגה, ה-API אינו מופעל בפרויקט, ' +
                    'או שאין הרשאות לתיקייה זו'
                );
                break;
            case 404:
                console.error(
                    `[learn-booster] Google Drive API: תיקייה לא נמצאה (404). ` +
                    `folderId: "${folderId}"`
                );
                break;
            default:
                console.error(
                    `[learn-booster] Google Drive API: שגיאה בקבלת קבצים (${response.status}): ` +
                    `${response.statusText}`
                );
        }
        return [];
    }

    const data = await response.json();
    return data.files;
};

export const getFolderVideosUrls = async (folderId: string): Promise<string[]> => {

    const files = await getFilesFromGDrive(folderId);
    return files.map(file => getVideoUrl(file.id));
};

export function extractGoogleDriveFolderId(url: string): string {
    if (!url) return url;

    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'drive.google.com') {
            const matches = url.match(/folders\/([a-zA-Z0-9-_]+)/);
            if (matches && matches[1]) {
                return matches[1];
            }
        }
    } catch {
        // אם ה-URL לא תקין, נחזיר את הערך המקורי
    }
    return url;
}
