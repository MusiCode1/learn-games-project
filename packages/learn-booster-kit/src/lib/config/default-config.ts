import type { Config } from "../../types";

const GOOGLE_DRIVE_DEFAULT_FOLDER = import.meta.env
  .VITE_GOOGLE_DRIVE_DEFAULT_FOLDER;
const SITE_DEFAULT_URL = import.meta.env.VITE_SITE_DEFAULT_UTL;

const defaultConfig: Config = {
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
    googleDriveFolderUrl: GOOGLE_DRIVE_DEFAULT_FOLDER,
    hideProgressBar: false,
  },

  app: {
    packageName: "com.google.android.youtube",
  },

  booster: {
    siteUrl: SITE_DEFAULT_URL ?? "",
  },

  system: {
    enableHideModalButton: true,
    disableGameCodeInjection: false,
  },
};

export function getDefaultConfig(): Config {
  return { ...defaultConfig };
}
