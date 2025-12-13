import type { Config, VideoItem, VideoList } from '../types';
import { extractGoogleDriveFolderId, getFolderVideosUrls } from './google-drive-video';
import { shuffleArray } from './utils/shuffle-array';
import { getFileList } from './fully-kiosk';
import { log } from "./logger.svelte";

const devMode = import.meta.env.DEV,
    selfUrl = import.meta.url;

/**
 * המרת רשימת URLs לרשימת פריטי וידאו
 * @param urls רשימת URLs של סרטונים
 * @param mimeType סוג MIME של הסרטונים (ברירת מחדל)
 * @returns רשימת פריטי וידאו
 */
export function urlsToVideoItems(urls: string[], defaultMimeType: string = 'video/mp4'): VideoList {
    return urls.map(url => {
        // ניסיון לזהות את סוג הקובץ לפי הסיומת
        let mimeType = defaultMimeType;
        const extension = url.split('.').pop()?.toLowerCase();

        if (extension) {
            switch (extension) {
                case 'mp4':
                    mimeType = 'video/mp4';
                    break;
                case 'webm':
                    mimeType = 'video/webm';
                    break;
                case 'ogg':
                case 'ogv':
                    mimeType = 'video/ogg';
                    break;
                case 'mov':
                    mimeType = 'video/quicktime';
                    break;
                case 'avi':
                    mimeType = 'video/x-msvideo';
                    break;
                case 'wmv':
                    mimeType = 'video/x-ms-wmv';
                    break;
                case 'flv':
                    mimeType = 'video/x-flv';
                    break;
                case 'm3u8':
                    mimeType = 'application/x-mpegURL';
                    break;
                case 'ts':
                    mimeType = 'video/MP2T';
                    break;
                case '3gp':
                    mimeType = 'video/3gpp';
                    break;
                case 'mkv':
                    mimeType = 'video/x-matroska';
                    break;
            }
        }

        return { url, mimeType };
    });
}

/**
 * יצירת פריט וידאו מקומי
 * @param selfUrl ה-URL של הסקריפט הנוכחי
 * @param devMode האם האפליקציה במצב פיתוח
 * @returns פריט וידאו
 */
export function createLocalVideoItem(): VideoItem {
    const baseUrl = (new URL(selfUrl).origin).toString();
    const localVideo = new URL('videos/video.webm', baseUrl).toString();
    const fallbackVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    const url = devMode ? localVideo : fallbackVideo;
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'webm' ? 'video/webm' : 'video/mp4';

    return { url, mimeType };
}

/**
 * טעינת סרטונים מגוגל דרייב
 * @param folderUrl כתובת URL של תיקיית גוגל דרייב
 * @returns רשימת פריטי וידאו
 */
export async function loadGoogleDriveVideos(folderUrl?: string): Promise<VideoList> {
    if (!folderUrl) {
        console.warn('לא סופקה כתובת URL של תיקיית גוגל דרייב');
        return [];
    }

    try {
        const googleDriveFolderId = extractGoogleDriveFolderId(folderUrl);
        const driveUrls = await getFolderVideosUrls(googleDriveFolderId);

        if (driveUrls.length > 0) {
            return urlsToVideoItems(driveUrls);
        } else {
            console.warn('לא נמצאו סרטונים בתיקיית גוגל דרייב');
            return [];
        }
    } catch (error) {
        console.error('שגיאה בקבלת סרטונים מגוגל דרייב:', error);
        return [];
    }
}

/**
 * טעינת סרטונים מתיקיית גוגל דרייב ברירת מחדל
 * @returns רשימת פריטי וידאו
 */
export async function loadDefaultGoogleDriveVideos(): Promise<VideoList> {
    try {
        const defaultFolderId = extractGoogleDriveFolderId(
            import.meta.env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER
        );
        const driveUrls = await getFolderVideosUrls(defaultFolderId);

        if (driveUrls.length > 0) {
            return urlsToVideoItems(driveUrls);
        } else {
            console.warn('לא נמצאו סרטונים בתיקיית גוגל דרייב ברירת המחדל');
            return [];
        }
    } catch (error) {
        console.error('שגיאה בקבלת סרטונים מתיקיית ברירת המחדל:', error);
        return [];
    }
}

/**
 * טעינת סרטונים מקומיים
 * @returns רשימת פריטי וידאו
 */
export async function loadLocalVideos(): Promise<VideoList> {
    try {
        if (window.fully) {
            const fileList = getFileList();
            if (fileList && fileList.length > 0) {
                return urlsToVideoItems(fileList);
            } else {
                console.warn('לא נמצאו סרטונים מקומיים ב-Fully Kiosk');
            }
        }

        // אם אין סרטונים מקומיים או שלא במצב Fully Kiosk, מחזירים סרטון ברירת מחדל
        return [createLocalVideoItem()];
    } catch (error) {
        console.error('שגיאה בטעינת סרטונים מקומיים:', error);
        // במקרה של שגיאה, מחזירים סרטון ברירת מחדל
        return [createLocalVideoItem()];
    }
}

/**
 * טעינת רשימת סרטונים בהתאם להגדרות
 * @param config הגדרות המערכת
 * @param selfUrl ה-URL של הסקריפט הנוכחי
 * @param devMode האם האפליקציה במצב פיתוח
 * @returns רשימת פריטי וידאו
 */
export async function loadVideoUrls(
    config: Config
): Promise<VideoList> {
    // בדיקה אם במצב וידאו
    if (config.rewardType !== 'video') {
        log('מצב אפליקציה, לא נטענים סרטונים');
        return [];
    }

    try {
        let videoList: VideoList = [];

        // טעינת סרטונים בהתאם למקור
        switch (config.video.source) {
            case 'google-drive':
                videoList = await loadGoogleDriveVideos(config.video.googleDriveFolderUrl);

                // אם לא נמצאו סרטונים, ננסה לטעון מתיקיית ברירת המחדל
                if (videoList.length === 0) {
                    log('מנסה לטעון סרטונים מתיקיית ברירת המחדל');
                    videoList = await loadDefaultGoogleDriveVideos();
                }
                break;

            case 'local':
                videoList = await loadLocalVideos();
                break;

            case 'youtube':
                console.warn('תמיכה ביוטיוב עדיין לא מומשה');
                break;

            default:
                console.warn(`מקור סרטונים לא ידוע: ${config.video.source}`);
                break;
        }

        // בדיקה אם נמצאו סרטונים
        if (videoList.length === 0) {
            console.warn('לא נמצאו סרטונים במקור שנבחר, מחזיר רשימה ריקה');
        } else {
            log(`נטענו ${videoList.length} סרטונים`);
        }

        // ערבוב הסרטונים
        return shuffleArray([...videoList]);
    } catch (error) {
        console.error('שגיאה כללית בטעינת סרטונים:', error);
        return [];
    }
}

/**
 * קבלת סרטון אקראי מהרשימה
 * @param videos רשימת הסרטונים
 * @returns סרטון אקראי או undefined אם הרשימה ריקה
 */
export function getRandomVideo(videos: VideoList): VideoItem | undefined {
    if (videos.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
}