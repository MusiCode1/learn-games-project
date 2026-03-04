/**
 * CDN base URL — static.tzlev.ovh bucket
 * נתיב בסיס לכל הקבצים הסטטיים (תמונות, צלילים)
 */
export const STATIC_BASE_URL = "https://static.tzlev.ovh";

/** גרסת assets — שנה בעת עדכון קבצים כדי לנקות cache */
export const ASSETS_VERSION = "v1";

/** נתיב בסיס לקבצים משותפים */
export const SHARED_URL = `${STATIC_BASE_URL}/shared`;

/** נתיב בסיס לקבצים של jigsaw-puzzle-game */
export const APP_ASSETS_URL = `${STATIC_BASE_URL}/apps/learn-games/jigsaw-puzzle-game`;

/** הוספת cache-bust parameter לנתיב */
export const asset = (url: string) => `${url}?${ASSETS_VERSION}`;
