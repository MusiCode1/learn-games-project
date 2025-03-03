import type { Config, OldConfig, VideoList } from '../types';
import { loadVideoUrls } from './video-loader';

// מפתח לשמירה ב-localStorage
const LOCAL_STORAGE_KEY = 'gingim-booster-config';
const GOOGLE_DRIVE_DEFAULT_FOLDER =
    import.meta.env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER

// רשימת מאזינים לשינויים בקונפיגורציה
type ConfigChangeListener = (config: Config) => void;
const listeners: ConfigChangeListener[] = [];


/**
 * ערכי ברירת מחדל של התצורה
 */
const defaultConfig: Config = {
    // הגדרות כלליות
    rewardType: 'video',
    rewardDisplayDurationMs: 20 * 1000,
    turnsPerReward: 1,

    // הגדרות הודעות ותזכורות
    notifications: {
        endingNotification: {
            text: 'המחזק יסתיים בעוד 10 שניות',
            displayBeforeEndMs: 10 * 1000,
            enabledFor: 'none',
        },
    },

    // הגדרות וידאו
    video: {
        videos: [],
        source: 'google-drive',
        googleDriveFolderUrl: GOOGLE_DRIVE_DEFAULT_FOLDER,
        hideProgressBar: false,
    },

    // הגדרות אפליקציה
    app: {
        packageName: 'com.edujoy.fidget.pop.it',
    },

    // הגדרות מערכת
    system: {
        enableHideModalButton: true,
        disableGameCodeInjection: false,
    },
};

/**
 * דגל המציין האם מערכת ההגדרות אותחלה
 */
let isConfigInitialized = false;

/**
 * אובייקט גלובלי המחזיק את ההגדרות הנוכחיות
 */
let appConfig: Config = { ...defaultConfig };

/**
 * הוספת מאזין לשינויים בקונפיגורציה
 * @param callback פונקציה שתקרא בכל שינוי בקונפיגורציה
 * @returns פונקציה להסרת המאזין
 */
export function addConfigListener(callback: ConfigChangeListener): () => void {
    listeners.push(callback);
    return () => {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    };
}

/**
 * הודעה לכל המאזינים על שינוי בקונפיגורציה
 */
function notifyConfigListeners(): void {
    listeners.forEach(listener => listener({ ...appConfig }));
}

/**
 * עדכון הגדרות המערכת
 * @param updates עדכונים להגדרות
 */
export function updateConfig(updates: Partial<Config>): void {
    // עדכון רקורסיבי שמשמר את המבנה של תתי-אובייקטים
    function deepMerge(target: any, source: any): any {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    appConfig = deepMerge({ ...appConfig }, updates);
    notifyConfigListeners();
}

/**
 * טעינת הקונפיגורציה מ-localStorage
 * @returns האם הטעינה הצליחה
 */
export function loadConfigFromStorage(): boolean {
    try {
        const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!storedConfig) return false;

        const parsedConfig = JSON.parse(storedConfig);
        if (typeof parsedConfig !== 'object' || parsedConfig === null) return false;

        // בדיקה אם זה מבנה ישן או חדש
        if ('mode' in parsedConfig) {
            // המרה ממבנה ישן לחדש
            const newConfig = convertOldConfigToNew(parsedConfig as OldConfig);
            appConfig = { ...defaultConfig, ...newConfig };
        } else {
            // מיזוג עם ברירת המחדל
            appConfig = { ...defaultConfig, ...parsedConfig };
        }

        notifyConfigListeners();
        return true;
    } catch (error) {
        console.error('שגיאה בטעינת הגדרות מ-localStorage:', error);
        return false;
    }
}

/**
 * שמירת הקונפיגורציה ל-localStorage
 * @returns האם השמירה הצליחה
 */
export function saveConfigToStorage(): boolean {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appConfig));
        return true;
    } catch (error) {
        console.error('שגיאה בשמירת הגדרות ל-localStorage:', error);
        return false;
    }
}

/**
 * איפוס הגדרות לברירת המחדל
 */
export function resetConfig(): void {
    appConfig = { ...defaultConfig };
    notifyConfigListeners();
}

/**
 * המרת קונפיגורציה ישנה לחדשה
 * @param oldConfig הקונפיגורציה הישנה
 * @returns קונפיגורציה חדשה
 */
export function convertOldConfigToNew(oldConfig: OldConfig): Partial<Config> {
    return {
        rewardType: oldConfig.mode,
        rewardDisplayDurationMs: oldConfig.videoDisplayTimeInMS,
        turnsPerReward: oldConfig.turnsPerVideo,

        notifications: {
            endingNotification: {
                text: 'הסרטון יסתיים בקרוב',
                displayBeforeEndMs: 3000,
                enabledFor: 'none',
            },
        },

        video: {
            videos: oldConfig.videoUrls.map(url => ({
                url,
                mimeType: oldConfig.type || 'video/mp4',
            })),
            source: oldConfig.videoSource,
            googleDriveFolderUrl: oldConfig.googleDriveFolderUrl,
            hideProgressBar: oldConfig.hideVideoProgress,
        },

        app: {
            packageName: oldConfig.appName,
        },

        system: oldConfig.systemConfig,
    };
}

/**
 * המרת קונפיגורציה חדשה לישנה (לתמיכה בקוד קיים)
 * @param newConfig הקונפיגורציה החדשה
 * @returns קונפיגורציה ישנה
 */
export function convertNewConfigToOld(newConfig: Config): OldConfig {
    return {
        mode: newConfig.rewardType,
        videoDisplayTimeInMS: newConfig.rewardDisplayDurationMs,
        turnsPerVideo: newConfig.turnsPerReward,
        videoUrls: newConfig.video.videos.map(video => video.url),
        type: newConfig.video.videos[0]?.mimeType || 'video/mp4',
        videoSource: newConfig.video.source,
        googleDriveFolderUrl: newConfig.video.googleDriveFolderUrl,
        hideVideoProgress: newConfig.video.hideProgressBar,
        appName: newConfig.app.packageName,
        systemConfig: newConfig.system,
    };
}


/**
 * אתחול מערכת ההגדרות
 * @param windowConfig הגדרות מ-window.config (אם קיים)
 * @param selfUrl ה-URL של הסקריפט הנוכחי
 * @param devMode האם האפליקציה במצב פיתוח
 */
export async function initializeConfig(
    windowConfig?: any,
    selfUrl?: string,
    devMode?: boolean
): Promise<Config> {
    // איפוס למצב ברירת המחדל
    resetConfig();

    // טעינה מ-localStorage
    loadConfigFromStorage();

    // שילוב עם הגדרות מ-window.config אם קיים
    if (windowConfig) {
        if ('mode' in windowConfig) {
            // המרה ממבנה ישן לחדש
            const newConfig = convertOldConfigToNew(windowConfig as OldConfig);
            updateConfig(newConfig);
        } else {
            updateConfig(windowConfig);
        }
    }

    // טעינת רשימת סרטונים אם במצב וידאו וסופקו הפרמטרים הנדרשים
    if (appConfig.rewardType === 'video' && selfUrl) {
        const videos = await loadVideoUrls(appConfig, selfUrl, !!devMode);
        // עדכון רשימת הסרטונים בקונפיג
        updateConfig({
            video: {
                ...appConfig.video,
                videos
            }
        });
    }

    // סימון שמערכת ההגדרות אותחלה
    isConfigInitialized = true;

    return { ...appConfig };
}


/**
 * קבלת סרטון אקראי מהרשימה
 */
export function getRandomVideo(): { url: string; mimeType: string } | undefined {
    const videos = appConfig.video.videos;
    if (videos.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
}

/**
 * קבלת כל ההגדרות לקריאה בלבד
 * @returns עותק של כל ההגדרות הנוכחיות
 * @throws {Error} אם מערכת ההגדרות לא אותחלה
 */
export function getAllConfig(): Readonly<Config> {
    // בדיקה אם מערכת ההגדרות אותחלה
    if (!isConfigInitialized) {
        throw new Error('מערכת ההגדרות לא אותחלה. יש לקרוא ל-initializeConfig לפני השימוש ב-getAllConfig');
    }
    
    // יצירת עותק עמוק של ההגדרות
    return Object.freeze(structuredClone(appConfig));
}