/**
 * ArkType schemas — מקור האמת לטיפוסי הנתונים של הספרייה.
 * טיפוסי runtime (VideoController, TimerController וכו') נשארים ב-types.ts.
 */

import { type } from "arktype";

// ─── VideoItem ────────────────────────────────────────────────────────────────

export const VideoItemSchema = type({
  url: "string",
  mimeType: "string",
});
export type VideoItem = typeof VideoItemSchema.infer;

// ─── EnvVals ──────────────────────────────────────────────────────────────────

export const EnvValsSchema = type({
  hostname: "string",
  fullPath: "string",
  isIframe: "boolean",
  selfUrl: "string",
  isDevServer: "boolean",
  devMode: "boolean",
  deployServer: "string",
  isDeployServer: "boolean",
  isGingim: "boolean",
  isGamePage: "boolean",
  isGamesListPage: "boolean",
  isGingimHomepage: "boolean",
  isBoosterIframe: "boolean",
  isDirectToGamePage: "boolean",
});

// ─── BoosterConfig V1 ─────────────────────────────────────────────────────────
// כשמוסיפים גרסה חדשה: שנה שם ל-BoosterConfigSchemaV2, עדכן BOOSTER_CONFIG_SCHEMA_VERSION ל-2
// שימו לב: gameSettings הוצא לרמת ה-Profile (לא חי כאן יותר)

export const BoosterConfigSchemaV1 = type({
  schemaVersion: "number",
  appVersion: "string",
  rewardType: "'video' | 'app' | 'site'",
  rewardDisplayDurationMs: "number",
  turnsPerReward: "number",
  environmentMode: "'production' | 'development' | 'preview'",
  notifications: {
    endingNotification: {
      text: "string",
      displayBeforeEndMs: "number",
      enabledFor: "'video' | 'app' | 'both' | 'none'",
    },
  },
  video: {
    videos: VideoItemSchema.array(),
    source: "'local' | 'google-drive' | 'youtube'",
    "googleDriveFolderUrl?": "string",
    "hideProgressBar?": "boolean",
  },
  app: {
    "packageName?": "string",
  },
  booster: {
    siteUrl: "string",
  },
  system: {
    enableHideModalButton: "boolean",
    disableGameCodeInjection: "boolean",
  },
  envVals: EnvValsSchema,
});
export type BoosterConfigV1 = typeof BoosterConfigSchemaV1.infer;

// גרסה נוכחית — עדכן כאן בלבד כשמגיעה גרסה חדשה
export const BOOSTER_CONFIG_SCHEMA_VERSION = 1 as const;
export const BoosterConfigSchema = BoosterConfigSchemaV1;
export type BoosterConfig = BoosterConfigV1;

// registry — מאפשר load/migration לפי גרסה
export const BOOSTER_CONFIG_SCHEMA_REGISTRY = {
  1: BoosterConfigSchemaV1,
  // 2: BoosterConfigSchemaV2,  // ← להוסיף כאן בעתיד
} as const satisfies Record<number, typeof BoosterConfigSchemaV1>;

// ─── GameSettingsEntry ────────────────────────────────────────────────────────
// עטיפה לכל הגדרות-משחק: schemaVersion + data (unknown — המשחק אחראי על schema)

export const GameSettingsEntrySchema = type({ schemaVersion: "number", data: "unknown" });
export type GameSettingsEntry = typeof GameSettingsEntrySchema.infer;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const ProfileSchema = type({
  id: "string",
  name: "string",
  "color?": "string",
  "tags?": "string[]",
  boosterConfig: BoosterConfigSchema,
  "gameSettings?": type({ "[string]": GameSettingsEntrySchema }),
  meta: {
    createdAt: "number",
    updatedAt: "number",
  },
});
export type Profile = typeof ProfileSchema.infer;

// ─── ProfilesState ────────────────────────────────────────────────────────────

export const STATE_SCHEMA_VERSION = 2 as const;

export const ProfilesStateSchema = type({
  schemaVersion: "number",
  profiles: type({ "[string]": ProfileSchema }),
  order: "string[]",
  activeProfileId: "string | null",
  uiEnabled: "boolean",
  dirtyBoosterConfig: [BoosterConfigSchema, "|", "null"],
});
export type ProfilesState = typeof ProfilesStateSchema.infer;

// ─── ProfilesExportPayload ────────────────────────────────────────────────────

export const ProfilesExportPayloadSchema = type({
  schemaVersion: "number",
  profiles: ProfileSchema.array(),
  activeProfileId: "string | null",
  uiEnabled: "boolean",
});
export type ProfilesExportPayload = typeof ProfilesExportPayloadSchema.infer;

// ─── OldConfig ────────────────────────────────────────────────────────────────
// פורמט config ישן — משמש ל-migration מ-window.config

export const OldConfigSchema = type({
  videoDisplayTimeInMS: "number",
  videoUrls: "string[]",
  type: "string",
  mode: "'video' | 'app'",
  videoSource: "'local' | 'google-drive' | 'youtube'",
  "googleDriveFolderUrl?": "string",
  "hideVideoProgress?": "boolean",
  turnsPerVideo: "number",
  "appName?": "string",
  systemConfig: {
    enableHideModalButton: "boolean",
    disableGameCodeInjection: "boolean",
  },
});
export type OldConfig = typeof OldConfigSchema.infer;

// ─── FullyItem ────────────────────────────────────────────────────────────────
// פריט קובץ/תיקייה מ-Fully Kiosk getFileList API

export const FullyItemSchema = type({
  canRead: "boolean",
  canWrite: "boolean",
  isHidden: "boolean",
  lastModified: "number",
  name: "string",
  size: "number",
  type: "'file' | 'folder'",
});
export type FullyItem = typeof FullyItemSchema.infer;

// ─── AppListItem ──────────────────────────────────────────────────────────────
// פריט אפליקציה מ-Fully Kiosk remote admin API

export const AppListItemSchema = type({
  icon: "string",
  label: "string",
  package: "string",
  version: "string",
  versionCode: "number",
});
export type AppListItem = typeof AppListItemSchema.infer;
