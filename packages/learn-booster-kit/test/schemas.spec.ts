/**
 * בדיקות ArkType schemas — מאורגנות per-version.
 * כל גרסת Config schema מקבלת describe משלה.
 * כשמוסיפים ConfigSchemaV2 — מוסיפים כאן describe("ConfigSchemaV2", ...).
 */

import { describe, it, expect } from 'vitest';
import { type } from 'arktype';
import {
  ConfigSchemaV1,
  CONFIG_SCHEMA_VERSION,
  CONFIG_SCHEMA_REGISTRY,
  ProfileSchema,
  ProfilesStateSchema,
  ProfilesExportPayloadSchema,
  OldConfigSchema,
  VideoItemSchema,
  FullyItemSchema,
  AppListItemSchema,
} from '../src/schemas';
import {
  OverlayTimerSettingsSchema,
  MIN_SIZE_PX,
  MAX_SIZE_PX,
} from '../src/lib/overlay/overlay-settings';
import { TimerCommandSchema } from '../src/lib/overlay/overlay-channel';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const validEnvVals = {
  hostname: 'localhost',
  fullPath: 'http://localhost',
  isIframe: false,
  selfUrl: '',
  isDevServer: true,
  devMode: true,
  deployServer: '',
  isDeployServer: false,
  isGingim: false,
  isGamePage: false,
  isGamesListPage: false,
  isGingimHomepage: false,
  isBoosterIframe: false,
  isDirectToGamePage: false,
};

const validConfigV1 = {
  appVersion: '0.0.1',
  rewardType: 'video' as const,
  rewardDisplayDurationMs: 20000,
  turnsPerReward: 1,
  environmentMode: 'development' as const,
  notifications: {
    endingNotification: {
      text: 'עוד 10 שניות',
      displayBeforeEndMs: 10000,
      enabledFor: 'none' as const,
    },
  },
  video: {
    videos: [],
    source: 'google-drive' as const,
  },
  app: {},
  booster: { siteUrl: '' },
  system: {
    enableHideModalButton: true,
    disableGameCodeInjection: false,
  },
  envVals: validEnvVals,
};

const validProfile = {
  id: 'profile-1',
  name: 'פרופיל ראשון',
  config: validConfigV1,
  meta: { createdAt: 1000, updatedAt: 1000 },
};

// ─── VideoItemSchema ──────────────────────────────────────────────────────────

describe('VideoItemSchema', () => {
  it('מאמת פריט וידאו תקני', () => {
    expect(VideoItemSchema({ url: 'https://example.com/video.mp4', mimeType: 'video/mp4' }) instanceof type.errors).toBe(false);
  });

  it('דוחה פריט חסר mimeType', () => {
    expect(VideoItemSchema({ url: 'https://example.com/video.mp4' }) instanceof type.errors).toBe(true);
  });
});

// ─── ConfigSchemaV1 ───────────────────────────────────────────────────────────

describe('ConfigSchemaV1', () => {
  it('מאמת config תקני', () => {
    expect(ConfigSchemaV1(validConfigV1) instanceof type.errors).toBe(false);
  });

  it('דוחה rewardType לא חוקי', () => {
    expect(ConfigSchemaV1({ ...validConfigV1, rewardType: 'invalid' }) instanceof type.errors).toBe(true);
  });

  it('דוחה environmentMode לא חוקי', () => {
    expect(ConfigSchemaV1({ ...validConfigV1, environmentMode: 'staging' }) instanceof type.errors).toBe(true);
  });

  it('דוחה config ללא rewardDisplayDurationMs', () => {
    const { rewardDisplayDurationMs: _, ...rest } = validConfigV1;
    expect(ConfigSchemaV1(rest) instanceof type.errors).toBe(true);
  });

  it('מאפשר googleDriveFolderUrl אופציונלי', () => {
    const withFolder = { ...validConfigV1, video: { ...validConfigV1.video, googleDriveFolderUrl: 'https://drive.google.com/folder' } };
    expect(ConfigSchemaV1(withFolder) instanceof type.errors).toBe(false);
  });

  it('דוחה videos עם פריט שחסר url', () => {
    const withBadVideo = { ...validConfigV1, video: { ...validConfigV1.video, videos: [{ mimeType: 'video/mp4' }] } };
    expect(ConfigSchemaV1(withBadVideo) instanceof type.errors).toBe(true);
  });

  it('דוחה enabledFor לא חוקי', () => {
    const bad = {
      ...validConfigV1,
      notifications: { endingNotification: { ...validConfigV1.notifications.endingNotification, enabledFor: 'always' } },
    };
    expect(ConfigSchemaV1(bad) instanceof type.errors).toBe(true);
  });
});

// כשתתווסף V2: describe('ConfigSchemaV2', () => { ... })

// ─── CONFIG_SCHEMA_REGISTRY ───────────────────────────────────────────────────

describe('CONFIG_SCHEMA_REGISTRY', () => {
  it('מכיל ערך לגרסה הנוכחית', () => {
    expect(CONFIG_SCHEMA_REGISTRY[CONFIG_SCHEMA_VERSION]).toBeDefined();
  });

  it('גרסה נוכחית היא 1', () => {
    expect(CONFIG_SCHEMA_VERSION).toBe(1);
  });

  it('registry[1] זהה ל-ConfigSchemaV1', () => {
    expect(CONFIG_SCHEMA_REGISTRY[1]).toBe(ConfigSchemaV1);
  });
});

// ─── ProfileSchema ────────────────────────────────────────────────────────────

describe('ProfileSchema', () => {
  it('מאמת פרופיל תקני', () => {
    expect(ProfileSchema(validProfile) instanceof type.errors).toBe(false);
  });

  it('מאמת פרופיל עם color ו-tags', () => {
    const withExtras = { ...validProfile, color: '#ff0000', tags: ['tag1', 'tag2'] };
    expect(ProfileSchema(withExtras) instanceof type.errors).toBe(false);
  });

  it('דוחה פרופיל חסר id', () => {
    const { id: _, ...rest } = validProfile;
    expect(ProfileSchema(rest) instanceof type.errors).toBe(true);
  });
});

// ─── ProfilesStateSchema ─────────────────────────────────────────────────────

describe('ProfilesStateSchema', () => {
  it('מאמת state תקני', () => {
    const validState = {
      schemaVersion: 1,
      profiles: { 'profile-1': validProfile },
      order: ['profile-1'],
      activeProfileId: 'profile-1',
      uiEnabled: false,
      dirtyConfig: null,
    };
    expect(ProfilesStateSchema(validState) instanceof type.errors).toBe(false);
  });

  it('מאמת state עם activeProfileId=null', () => {
    const emptyState = {
      schemaVersion: 1,
      profiles: {},
      order: [],
      activeProfileId: null,
      uiEnabled: false,
      dirtyConfig: null,
    };
    expect(ProfilesStateSchema(emptyState) instanceof type.errors).toBe(false);
  });
});

// ─── ProfilesExportPayloadSchema ─────────────────────────────────────────────

describe('ProfilesExportPayloadSchema', () => {
  it('מאמת payload תקני', () => {
    const payload = {
      schemaVersion: 1,
      profiles: [validProfile],
      activeProfileId: 'profile-1',
      uiEnabled: false,
    };
    expect(ProfilesExportPayloadSchema(payload) instanceof type.errors).toBe(false);
  });

  it('דוחה payload חסר schemaVersion', () => {
    const { schemaVersion: _, ...rest } = {
      schemaVersion: 1,
      profiles: [validProfile],
      activeProfileId: null,
      uiEnabled: false,
    };
    expect(ProfilesExportPayloadSchema(rest) instanceof type.errors).toBe(true);
  });
});

// ─── OverlayTimerSettingsSchema ───────────────────────────────────────────────

describe('OverlayTimerSettingsSchema', () => {
  it('מאמת הגדרות תקניות', () => {
    expect(OverlayTimerSettingsSchema({ enabled: true, xPercent: 6, yPercent: 50, sizePx: 140 }) instanceof type.errors).toBe(false);
  });

  it('דוחה xPercent מחוץ לתחום 0-100', () => {
    expect(OverlayTimerSettingsSchema({ enabled: true, xPercent: 150, yPercent: 50, sizePx: 140 }) instanceof type.errors).toBe(true);
  });

  it('דוחה yPercent שלילי', () => {
    expect(OverlayTimerSettingsSchema({ enabled: true, xPercent: 50, yPercent: -1, sizePx: 140 }) instanceof type.errors).toBe(true);
  });

  it(`דוחה sizePx מתחת ל-${MIN_SIZE_PX}`, () => {
    expect(OverlayTimerSettingsSchema({ enabled: true, xPercent: 50, yPercent: 50, sizePx: MIN_SIZE_PX - 1 }) instanceof type.errors).toBe(true);
  });

  it(`דוחה sizePx מעל ל-${MAX_SIZE_PX}`, () => {
    expect(OverlayTimerSettingsSchema({ enabled: true, xPercent: 50, yPercent: 50, sizePx: MAX_SIZE_PX + 1 }) instanceof type.errors).toBe(true);
  });
});

// ─── TimerCommandSchema ───────────────────────────────────────────────────────

describe('TimerCommandSchema', () => {
  it('מאמת פקודת start תקנית', () => {
    expect(TimerCommandSchema({ type: 'start', durationMs: 5000, startedAtMs: 1000000 }) instanceof type.errors).toBe(false);
  });

  it('מאמת פקודת stop תקנית', () => {
    expect(TimerCommandSchema({ type: 'stop', durationMs: 0, startedAtMs: 0 }) instanceof type.errors).toBe(false);
  });

  it('דוחה type לא חוקי', () => {
    expect(TimerCommandSchema({ type: 'pause', durationMs: 5000, startedAtMs: 1000000 }) instanceof type.errors).toBe(true);
  });

  it('דוחה פקודה חסרת durationMs', () => {
    expect(TimerCommandSchema({ type: 'start', startedAtMs: 1000000 }) instanceof type.errors).toBe(true);
  });
});

// ─── OldConfigSchema ──────────────────────────────────────────────────────────

const validOldConfig = {
  videoDisplayTimeInMS: 20000,
  videoUrls: ['https://example.com/video.mp4'],
  type: 'video',
  mode: 'video' as const,
  videoSource: 'google-drive' as const,
  turnsPerVideo: 1,
  systemConfig: {
    enableHideModalButton: true,
    disableGameCodeInjection: false,
  },
};

describe('OldConfigSchema', () => {
  it('מאמת OldConfig תקני', () => {
    expect(OldConfigSchema(validOldConfig) instanceof type.errors).toBe(false);
  });

  it('מאמת OldConfig עם שדות אופציונליים', () => {
    const withOptionals = {
      ...validOldConfig,
      googleDriveFolderUrl: 'https://drive.google.com/folder',
      hideVideoProgress: true,
      appName: 'com.example.app',
    };
    expect(OldConfigSchema(withOptionals) instanceof type.errors).toBe(false);
  });

  it('דוחה mode לא חוקי', () => {
    expect(OldConfigSchema({ ...validOldConfig, mode: 'site' }) instanceof type.errors).toBe(true);
  });

  it('דוחה OldConfig חסר systemConfig', () => {
    const { systemConfig: _, ...rest } = validOldConfig;
    expect(OldConfigSchema(rest) instanceof type.errors).toBe(true);
  });

  it('דוחה videoUrls שאינו מערך strings', () => {
    expect(OldConfigSchema({ ...validOldConfig, videoUrls: [123] }) instanceof type.errors).toBe(true);
  });
});

// ─── FullyItemSchema ──────────────────────────────────────────────────────────

describe('FullyItemSchema', () => {
  const validItem = {
    canRead: true,
    canWrite: false,
    isHidden: false,
    lastModified: 1700000000000,
    name: 'video.mp4',
    size: 1024,
    type: 'file' as const,
  };

  it('מאמת פריט קובץ תקני', () => {
    expect(FullyItemSchema(validItem) instanceof type.errors).toBe(false);
  });

  it('מאמת פריט תיקייה', () => {
    expect(FullyItemSchema({ ...validItem, type: 'folder' }) instanceof type.errors).toBe(false);
  });

  it('דוחה type לא חוקי', () => {
    expect(FullyItemSchema({ ...validItem, type: 'link' }) instanceof type.errors).toBe(true);
  });

  it('דוחה פריט חסר name', () => {
    const { name: _, ...rest } = validItem;
    expect(FullyItemSchema(rest) instanceof type.errors).toBe(true);
  });

  it('מאמת מערך פריטים', () => {
    expect(FullyItemSchema.array()([validItem, { ...validItem, name: 'other.mp4' }]) instanceof type.errors).toBe(false);
  });
});

// ─── AppListItemSchema ────────────────────────────────────────────────────────

describe('AppListItemSchema', () => {
  const validApp = {
    icon: 'base64encodedstring',
    label: 'YouTube',
    package: 'com.google.android.youtube',
    version: '18.0.0',
    versionCode: 1800000,
  };

  it('מאמת פריט אפליקציה תקני', () => {
    expect(AppListItemSchema(validApp) instanceof type.errors).toBe(false);
  });

  it('דוחה פריט חסר package', () => {
    const { package: _, ...rest } = validApp;
    expect(AppListItemSchema(rest) instanceof type.errors).toBe(true);
  });

  it('דוחה versionCode שאינו מספר', () => {
    expect(AppListItemSchema({ ...validApp, versionCode: '1800000' }) instanceof type.errors).toBe(true);
  });

  it('מאמת מערך אפליקציות', () => {
    expect(AppListItemSchema.array()([validApp]) instanceof type.errors).toBe(false);
  });
});
