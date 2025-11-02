import pkg from "../../package.json" with { type: "json" };

import {
  getActiveProfile,
  initializeProfiles,
  saveActiveProfileConfig,
} from "./profile-manager";
import { getDefaultConfig } from "./default-config";
import { loadVideoUrls } from "./video-loader";

import type { Config } from "../types";

// מפתח לשמירה ב-localStorage
const LOCAL_STORAGE_KEY = "gingim-booster-config";

const GOOGLE_DRIVE_DEFAULT_FOLDER = import.meta.env
  .VITE_GOOGLE_DRIVE_DEFAULT_FOLDER;

const SITE_DEFAULT_URL = import.meta.env.VITE_SITE_DEFAULT_UTL;

// רשימת מאזינים לשינויים בקונפיגורציה
type ConfigChangeListener = (config: Config) => void;
const listeners: ConfigChangeListener[] = [];

export const defaultConfig = getDefaultConfig();

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
  listeners.forEach((listener) => listener({ ...appConfig }));
}

/**
 * עדכון הגדרות המערכת
 * @param updates עדכונים להגדרות
 */
export async function updateConfig(updates: Partial<Config>): Promise<Config> {
  if (updates.video) {
    if (updates.video.googleDriveFolderUrl === "") {
      updates.video.googleDriveFolderUrl = GOOGLE_DRIVE_DEFAULT_FOLDER;
    }
  }

  appConfig = deepMerge({ ...appConfig }, updates);

  if (appConfig.rewardType === "video") {
    await setVideosUrls(appConfig);
  }

  saveConfigToStorage();
  syncActiveProfileSnapshot();
  notifyConfigListeners();

  return appConfig;
}

export async function tempConfig(updates: Partial<Config>) {
  if (updates.video) {
    if (updates.video.googleDriveFolderUrl === "") {
      updates.video.googleDriveFolderUrl = GOOGLE_DRIVE_DEFAULT_FOLDER;
    }
  }

  if (updates.booster) {
    if (updates.booster.siteUrl === "") {
      updates.booster.siteUrl = SITE_DEFAULT_URL;
    }
  }

  const tempConfig = deepMerge({ ...appConfig }, updates);

  if (appConfig.rewardType === "video") {
    await setVideosUrls(appConfig);
  }

  return tempConfig;
}

async function setVideosUrls(systemConfig: Config) {
  const videos = await loadVideoUrls(systemConfig);

  appConfig.video.videos = videos;
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
    if (typeof parsedConfig !== "object" || parsedConfig === null) return false;

    // מיזוג עם ברירת המחדל
    appConfig = { ...defaultConfig, ...parsedConfig };

    notifyConfigListeners();
    return true;
  } catch (error) {
    console.error("שגיאה בטעינת הגדרות מ-localStorage:", error);
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
    console.error("שגיאה בשמירת הגדרות ל-localStorage:", error);
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

export async function initializeConfig(): Promise<Config> {
  // איפוס למצב ברירת המחדל
  resetConfig();

  // טעינה מ-localStorage
  loadConfigFromStorage();

  await initializeProfiles(appConfig);
  const activeProfile = getActiveProfile();
  if (activeProfile) {
    appConfig = cloneConfig(activeProfile.config);
  }

  // טעינת רשימת סרטונים אם במצב וידאו וסופקו הפרמטרים הנדרשים
  if (appConfig.rewardType === "video") {
    // עדכון רשימת הסרטונים בקונפיג
    await setVideosUrls(appConfig);
  }

  appConfig = {
    ...appConfig, appVersion: pkg.version, envVals: {
      ...getEnvVals()
    }
  };

  // סימון שמערכת ההגדרות אותחלה
  isConfigInitialized = true;

  syncActiveProfileSnapshot();
  notifyConfigListeners();

  return { ...appConfig };
}

/**
 * קבלת סרטון אקראי מהרשימה
 */
export function getRandomVideo():
  | { url: string; mimeType: string }
  | undefined {
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
    throw new Error(
      "מערכת ההגדרות לא אותחלה. יש לקרוא ל-initializeConfig לפני השימוש ב-getAllConfig",
    );
  }

  // יצירת עותק עמוק של ההגדרות
  return Object.freeze(structuredClone(appConfig));
}

// עדכון רקורסיבי שמשמר את המבנה של תתי-אובייקטים
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      key in target
    ) {
      deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else if (typeof target === "object" && target !== null) {
      target[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }
  return target;
}

function cloneConfig(config: Config): Config {
  return typeof structuredClone === "function"
    ? structuredClone(config)
    : JSON.parse(JSON.stringify(config));
}

function syncActiveProfileSnapshot(): void {
  try {
    saveActiveProfileConfig(appConfig);
  } catch (error) {
    console.warn("Unable to sync active profile config:", error);
  }
}

const DEV_SERVER_HOSTNAME = 'dev-server.dev',
  GAME_PAGE_URL = '/wp-content/uploads/new_games/';

function getEnvVals() {
  const thisUrl = new URL(window.location.href),
    hostname = window.location.hostname,
    fullPath = window.location.href,
    isIframe = window.self !== window.top,
    selfUrl = import.meta.url,
    isDevServer = (hostname === DEV_SERVER_HOSTNAME),
    devMode = import.meta.env.DEV,
    deployServer = import.meta.env.VITE_PRJ_DOMAIN as string,
    isDeployServer = (hostname === deployServer),
    isGingim = (hostname === 'gingim.net'),
    isGamesListPage = (thisUrl.pathname.startsWith('/games')),
    isGamePage = (fullPath.includes(GAME_PAGE_URL)),
    isGingimHomepage = (isGingim && thisUrl.pathname === '/'),
    isBoosterIframe = isIframe && (window.name === "booster-iframe" || (window.frameElement as HTMLElement)?.dataset?.owner === "booster-iframe");

  return {
    hostname, fullPath, isIframe,
    selfUrl, isDevServer, devMode,
    deployServer, isDeployServer,
    isGingim, isGamePage,
    isGamesListPage,
    isGingimHomepage,
    isBoosterIframe
  };
}