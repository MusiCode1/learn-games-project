import type { BoosterConfig } from "../../types";
import { BOOSTER_CONFIG_SCHEMA_VERSION } from "../../schemas";
import { env } from "./env";

const GOOGLE_DRIVE_DEFAULT_FOLDER = env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER;
const SITE_DEFAULT_URL = env.VITE_SITE_DEFAULT_UTL ?? "";

const DEFAULT_APP_PACKAGE = env.VITE_DEFAULT_APP_PACKAGE;

const defaultBoosterConfig: BoosterConfig = {
  schemaVersion: BOOSTER_CONFIG_SCHEMA_VERSION,
  appVersion: "0.0.1",
  rewardType: "video",
  rewardDisplayDurationMs: 20 * 1000,
  turnsPerReward: 1,
  environmentMode: "development",
  envVals: {
    hostname: "localhost",
    fullPath: "http://localhost",
    isIframe: false,
    selfUrl: "",
    isDevServer: true,
    devMode: true,
    deployServer: "",
    isDeployServer: false,
    isDirectToGamePage: false,
    isGingim: false,
    isGamePage: false,
    isBoosterIframe: false,
    isGamesListPage: false,
    isGingimHomepage: false,
  },

  notifications: {
    endingNotification: {
      text: "המחזק יסתיים בעוד 10 שניות",
      displayBeforeEndMs: 10 * 1000,
      enabledFor: "none",
    },
  },

  video: {
    videos: [],
    source: "google-drive",
    googleDriveFolderUrl: GOOGLE_DRIVE_DEFAULT_FOLDER?? "https://drive.google.com/drive/u/0/folders/1G3cbW10H6Oe-5VFBJtjJn7okuA3vHaUA",
    hideProgressBar: false,
  },

  app: {
    packageName: DEFAULT_APP_PACKAGE ?? "com.google.android.youtube",
  },

  booster: {
    siteUrl: SITE_DEFAULT_URL ?? "",
  },

  system: {
    enableHideModalButton: true,
    disableGameCodeInjection: false,
  },
};

export function getDefaultBoosterConfig(): BoosterConfig {
  return { ...defaultBoosterConfig };
}

// alias לתאימות לאחור — יוסר כשכל callers יועברו ל-getDefaultBoosterConfig
export const getDefaultConfig = getDefaultBoosterConfig;
