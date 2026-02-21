import pkg from "../../../package.json" with { type: "json" };

import {
  getActiveProfile,
  initializeProfiles,
  saveActiveProfileConfig,
} from "./profile-manager";
import { getDefaultConfig } from "./default-config";
import { loadVideoUrls } from "../video/video-loader";

import type { Config } from "../../types";

const OLD_LOCAL_STORAGE_KEY = "gingim-booster-config";
const LOCAL_STORAGE_KEY = "learn-booster-config";

const GOOGLE_DRIVE_DEFAULT_FOLDER = import.meta.env
  .VITE_GOOGLE_DRIVE_DEFAULT_FOLDER;

const SITE_DEFAULT_URL = import.meta.env.VITE_SITE_DEFAULT_UTL;

type ConfigChangeListener = (config: Config) => void;
const listeners: ConfigChangeListener[] = [];

export const defaultConfig = getDefaultConfig();
import { writable } from 'svelte/store';
export const configStore = writable<Config>({ ...defaultConfig });

let isConfigInitialized = false;

let appConfig: Config = { ...defaultConfig };

export function addConfigListener(callback: ConfigChangeListener): () => void {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyConfigListeners(): void {
  const newConfig = { ...appConfig };
  listeners.forEach((listener) => listener(newConfig));
  configStore.set(newConfig);
}

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

function migrateConfigStorage(): void {
  try {
    const old = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
    if (old) {
      if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, old);
      }
      localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function loadConfigFromStorage(): boolean {
  migrateConfigStorage();
  try {
    const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedConfig) return false;

    const parsedConfig = JSON.parse(storedConfig);
    if (typeof parsedConfig !== "object" || parsedConfig === null) return false;

    appConfig = deepMerge({ ...defaultConfig }, parsedConfig);

    notifyConfigListeners();
    return true;
  } catch (error) {
    console.error("שגיאה בטעינת הגדרות מ-localStorage:", error);
    return false;
  }
}

export function saveConfigToStorage(): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appConfig));
    return true;
  } catch (error) {
    console.error("שגיאה בשמירת הגדרות ל-localStorage:", error);
    return false;
  }
}

export function resetConfig(): void {
  appConfig = { ...defaultConfig };
  notifyConfigListeners();
}

export async function initializeConfig(): Promise<Config> {
  resetConfig();
  loadConfigFromStorage();

  await initializeProfiles(appConfig);
  const activeProfile = getActiveProfile();
  if (activeProfile) {
    appConfig = cloneConfig(activeProfile.config);
  }

  if (appConfig.rewardType === "video") {
    await setVideosUrls(appConfig);
  }

  appConfig = {
    ...appConfig, appVersion: pkg.version, envVals: {
      ...getEnvVals()
    }
  };

  isConfigInitialized = true;

  syncActiveProfileSnapshot();
  notifyConfigListeners();

  return { ...appConfig };
}

export function getRandomVideo():
  | { url: string; mimeType: string }
  | undefined {
  const videos = appConfig.video.videos;
  if (videos.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
}

export function getAllConfig(): Readonly<Config> {
  if (!isConfigInitialized) {
    throw new Error(
      "מערכת ההגדרות לא אותחלה. יש לקרוא ל-initializeConfig לפני השימוש ב-getAllConfig",
    );
  }

  return Object.freeze(structuredClone(appConfig));
}

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

function getEnvVals() {
  const hostname = window.location.hostname,
    fullPath = window.location.href,
    isIframe = window.self !== window.top,
    selfUrl = import.meta.url,
    isDevServer = import.meta.env.DEV as boolean,
    devMode = import.meta.env.DEV,
    deployServer = import.meta.env.VITE_PRJ_DOMAIN as string,
    isDeployServer = (hostname === deployServer);

  return {
    hostname, fullPath, isIframe,
    selfUrl, isDevServer, devMode,
    deployServer, isDeployServer,
    /** @deprecated gingim-specific, always false */
    isDirectToGamePage: false,
    /** @deprecated gingim-specific, always false */
    isGingim: false,
    /** @deprecated gingim-specific, always false */
    isGamePage: false,
    /** @deprecated gingim-specific, always false */
    isBoosterIframe: false,
    /** @deprecated gingim-specific, always false */
    isGamesListPage: false,
    /** @deprecated gingim-specific, always false */
    isGingimHomepage: false,
  };
}
