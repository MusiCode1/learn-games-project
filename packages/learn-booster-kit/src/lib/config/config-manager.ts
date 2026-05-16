import pkg from "../../../package.json" with { type: "json" };

import {
  getActiveProfile,
  initializeProfiles,
  saveActiveProfileConfig,
} from "./profile-manager";
import { getDefaultConfig } from "./default-config";
import { loadVideoUrls } from "../video/video-loader";
import { CONFIG_SCHEMA_REGISTRY, CONFIG_SCHEMA_VERSION, ConfigSchema, OldConfigSchema } from "../../schemas";
import { type } from "arktype";
import { env } from "./env";
import { ok, err, type Result, type ValidationError } from "../result";

import type { Config, OldConfig } from "../../types";

const OLD_LOCAL_STORAGE_KEY = "gingim-booster-config";
const LOCAL_STORAGE_KEY = "learn-booster-config";

const GOOGLE_DRIVE_DEFAULT_FOLDER = env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER ?? "";

const SITE_DEFAULT_URL = env.VITE_SITE_DEFAULT_UTL ?? "";

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

  const candidate = deepMerge({ ...appConfig }, updates);

  // validation לפני שמירה — חוסם נתונים לא תקינים מהטופס או מקוד חיצוני
  const result = ConfigSchema(candidate);
  if (result instanceof type.errors) {
    console.error("updateConfig: config לא תקין, לא נשמר:", result.summary);
    throw new Error(`Invalid config: ${result.summary}`);
  }

  appConfig = result;

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

    const parsed = JSON.parse(storedConfig) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) return false;

    // קריאת גרסת schema — ברירת מחדל 1 לנתונים ישנים שאין להם שדה זה
    const version = typeof parsed._configSchemaVersion === "number"
      ? parsed._configSchemaVersion
      : 1;

    const schema = CONFIG_SCHEMA_REGISTRY[version as keyof typeof CONFIG_SCHEMA_REGISTRY];
    if (!schema) {
      console.warn(`Config: גרסת schema לא מוכרת: ${version}, מתעלם מהנתונים השמורים`);
      return false;
    }

    // partial() כי storage שומר רק overrides, לא config מלא
    const result = schema.partial()(parsed);
    if (result instanceof type.errors) {
      console.warn("Config from storage failed validation:", result.summary);
      return false;
    }

    appConfig = deepMerge({ ...defaultConfig }, result);
    notifyConfigListeners();
    return true;
  } catch (error) {
    console.error("שגיאה בטעינת הגדרות מ-localStorage:", error);
    return false;
  }
}

export function saveConfigToStorage(): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      _configSchemaVersion: CONFIG_SCHEMA_VERSION,
      ...appConfig,
    }));
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

  // migration מ-OldConfig אם window.config מכיל פורמט ישן
  if (window.config) {
    const oldResult = OldConfigSchema(window.config);
    if (!(oldResult instanceof type.errors)) {
      const migrated = migrateOldConfig(oldResult);
      appConfig = deepMerge({ ...appConfig }, migrated);
    }
  }

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

// === Game Settings API ===
//
// helpers נוחים לקריאה ושמירה של הגדרות-משחק תחת `config.gameSettings`.
// כל משחק מקבל namespace משלו לפי `gameId`, והקיט שומר את התוכן כ-`unknown`.
// המשחק עצמו אחראי על schema/validation של ההגדרות שלו.
//
// הסיבה שב-`updateGameSettings` אין שימוש ב-`updateConfig`/`deepMerge`:
// ה-`deepMerge` ימזג רקורסיבית את ה-`gameSettings[gameId]` הישן עם החדש,
// כך שמפתחות שהוסרו מ-schema של המשחק יישארו. במקום זה אנו עושים
// **החלפה מלאה** של גוש ההגדרות-משחק ותוך כדי שומרים על ההגדרות של
// שאר המשחקים.

/**
 * מחזיר את ההגדרות של משחק מסוים מתוך ה-config הפעיל,
 * או `undefined` אם אין הגדרות שמורות עבור `gameId` זה (פרופיל חדש או משחק חדש).
 */
export function getGameSettings<T = unknown>(gameId: string): T | undefined {
  const all = appConfig.gameSettings;
  if (!all) return undefined;
  return all[gameId] as T | undefined;
}

/**
 * שומר הגדרות-משחק תחת `gameId`. החלפה מלאה (לא merge עומק) — כך
 * שמפתחות ישנים שלא נמצאים ב-`settings` החדשות נמחקים. שאר ההגדרות של
 * שאר המשחקים נשמרות כמובן. עובר validation מלא של ה-`ConfigSchema`,
 * נשמר ל-`localStorage`, ומסונכרן לפרופיל הפעיל.
 *
 * מחזיר `Result<Config, ValidationError>` — לא זורק. ראה כללי הקוד
 * ב-`docs/functional-programming.md`.
 *
 * @example
 * ```ts
 * const result = await updateGameSettings('find-letter-game', { cooldownMs: 3000 });
 * if (!result.success) {
 *   console.error(result.error.summary);
 *   return;
 * }
 * // result.value הוא Config מעודכן
 * ```
 */
export async function updateGameSettings<T = unknown>(
  gameId: string,
  settings: T,
): Promise<Result<Config, ValidationError>> {
  const newGameSettings: Record<string, unknown> = {
    ...(appConfig.gameSettings ?? {}),
    [gameId]: settings,
  };

  const candidate: Config = {
    ...appConfig,
    gameSettings: newGameSettings,
  };

  const validated = ConfigSchema(candidate);
  if (validated instanceof type.errors) {
    console.error("updateGameSettings: config לא תקין, לא נשמר:", validated.summary);
    return err<ValidationError>({
      kind: "validation",
      summary: validated.summary,
    });
  }

  appConfig = validated;
  saveConfigToStorage();
  syncActiveProfileSnapshot();
  notifyConfigListeners();
  return ok(appConfig);
}

/**
 * נרשם לשינויים בהגדרות-משחק ספציפי. מחזיר callback unsubscribe.
 * ה-callback נקרא מיד עם הערך הנוכחי, ובכל פעם שהוא משתנה (כולל החלפת פרופיל).
 * השינוי מזוהה ב-reference comparison; משחקים שרוצים לתפוס שינוי בעומק
 * צריכים לעבור structure-aware comparison בצד שלהם.
 */
export function subscribeGameSettings<T = unknown>(
  gameId: string,
  callback: (settings: T | undefined) => void,
): () => void {
  let last: T | undefined = getGameSettings<T>(gameId);
  callback(last);

  const unsub = addConfigListener((config) => {
    const current = config.gameSettings?.[gameId] as T | undefined;
    if (current !== last) {
      last = current;
      callback(current);
    }
  });

  return unsub;
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
    deployServer = env.VITE_PRJ_DOMAIN ?? "",
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

function migrateOldConfig(old: OldConfig): Partial<Config> {
  return {
    rewardType: old.mode === "app" ? "app" : "video",
    rewardDisplayDurationMs: old.videoDisplayTimeInMS,
    turnsPerReward: old.turnsPerVideo,
    video: {
      videos: old.videoUrls.map(url => ({ url, mimeType: "video/mp4" })),
      source: old.videoSource,
      googleDriveFolderUrl: old.googleDriveFolderUrl,
      hideProgressBar: old.hideVideoProgress,
    },
    app: { packageName: old.appName },
    system: old.systemConfig,
  };
}
