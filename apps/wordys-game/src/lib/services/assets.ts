import { dev } from '$app/environment';

// קונפיגורציה שניתן לשנות בעתיד בקלות
const STORAGE_CONFIG = {
    // בחר את הספק הרצוי. כרגע hardcoded ל-cloud, אבל אפשר לשנות ל-'local' לפיתוח אם רוצים
    // provider: 'local', 
    provider: 'cloudflare_r2',
    baseUrl: 'https://static.wordys-game.tzlev.ovh',
    localFallback: '/static'
};

/**
 * מחזיר את ה-URL המלא עבור נכס (תמונה, סאונד, וכו').
import { dev } from '$app/environment';

// קונפיגורציה שניתן לשנות בעתיד בקלות
const STORAGE_CONFIG = {
    // בחר את הספק הרצוי. כרגע hardcoded ל-cloud, אבל אפשר לשנות ל-'local' לפיתוח אם רוצים
    // provider: 'local', 
    provider: 'cloudflare_r2',
    baseUrl: 'https://static.wordys-game.tzlev.ovh',
    localFallback: '/static'
};

/**
 * מחזיר את ה-URL המלא עבור נכס (תמונה, סאונד, וכו').
 * מאפשר מעבר שקוף בין אחסון מקומי לענן.
 * 
 * @param path הנתיב היחסי של הקובץ (לדוגמה: 'images/dog.png' או 'sounds/wow.mp3')
 */
export function getAssetUrl(path: string): string {
    if (!path) return '';

    // אם הנתיב הוא כבר URL מלא (למשל מגיע ממקור חיצוני או כבר עובד), נחזיר אותו כמו שהוא
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // מנרמל את הנתיב (מסיר סלאש בהתחלה אם יש)
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // אם רוצים לחזור ללוקאלי בסביבת פיתוח, אפשר להסיר את ההערה:
    // if (dev) return `${STORAGE_CONFIG.localFallback}/${cleanPath}`;

    return `${STORAGE_CONFIG.baseUrl}/${cleanPath}`;
}
