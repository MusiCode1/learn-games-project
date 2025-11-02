import type { Config } from '../types';

const GOOGLE_DRIVE_DEFAULT_FOLDER =
    import.meta.env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER

/**
 * ערכי ברירת מחדל של התצורה
 */
const defaultConfig: Config = {
    appVersion: '0.0.1',
    // הגדרות כלליות
    rewardType: 'video',
    rewardDisplayDurationMs: 20 * 1000,
    turnsPerReward: 1,
    environmentMode: 'development',


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
        packageName: 'com.google.android.youtube',
    },

    // הגדרות מחזק אתר
    booster: {
        siteUrl: '',
    },

    // הגדרות מערכת
    system: {
        enableHideModalButton: true,
        disableGameCodeInjection: false,
    },
};

export function getDefaultConfig(): Config {
    return { ...defaultConfig };
}
