/**
 * בדיקות ArkType schemas — מאורגנות per-version.
 * כל גרסת BoosterConfig schema מקבלת describe משלה.
 * כשמוסיפים BoosterConfigSchemaV2 — מוסיפים כאן describe("BoosterConfigSchemaV2", ...).
 */

import { describe, it, expect } from 'vitest';
import { type } from 'arktype';
import {
  BoosterConfigSchemaV1,
  BOOSTER_CONFIG_SCHEMA_VERSION,
  BOOSTER_CONFIG_SCHEMA_REGISTRY,
  ProfileSchema,
  ProfilesStateSchema,
  ProfilesExportPayloadSchema,
  OldConfigSchema,
  VideoItemSchema,
  FullyItemSchema,
  AppListItemSchema,
  STATE_SCHEMA_VERSION,
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

const validBoosterConfigV1 = {
  schemaVersion: 1,
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
  boosterConfig: validBoosterConfigV1,
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

// ─── BoosterConfigSchemaV1 ────────────────────────────────────────────────────

describe('BoosterConfigSchemaV1', () => {
  it('מאמת boosterConfig תקני', () => {
    expect(BoosterConfigSchemaV1(validBoosterConfigV1) instanceof type.errors).toBe(false);
  });

  it('דוחה rewardType לא חוקי', () => {
    expect(BoosterConfigSchemaV1({ ...validBoosterConfigV1, rewardType: 'invalid' }) instanceof type.errors).toBe(true);
  });

  it('דוחה environmentMode לא חוקי', () => {
    expect(BoosterConfigSchemaV1({ ...validBoosterConfigV1, environmentMode: 'staging' }) instanceof type.errors).toBe(true);
  });

  it('דוחה config ללא rewardDisplayDurationMs', () => {
    const { rewardDisplayDurationMs: _, ...rest } = validBoosterConfigV1;
    expect(BoosterConfigSchemaV1(rest) instanceof type.errors).toBe(true);
  });

  it('מאפשר googleDriveFolderUrl אופציונלי', () => {
    const withFolder = { ...validBoosterConfigV1, video: { ...validBoosterConfigV1.video, googleDriveFolderUrl: 'https://drive.google.com/folder' } };
    expect(BoosterConfigSchemaV1(withFolder) instanceof type.errors).toBe(false);
  });

  it('דוחה videos עם פריט שחסר url', () => {
    const withBadVideo = { ...validBoosterConfigV1, video: { ...validBoosterConfigV1.video, videos: [{ mimeType: 'video/mp4' }] } };
    expect(BoosterConfigSchemaV1(withBadVideo) instanceof type.errors).toBe(true);
  });

  it('דוחה enabledFor לא חוקי', () => {
    const bad = {
      ...validBoosterConfigV1,
      notifications: { endingNotification: { ...validBoosterConfigV1.notifications.endingNotification, enabledFor: 'always' } },
    };
    expect(BoosterConfigSchemaV1(bad) instanceof type.errors).toBe(true);
  });

  it('מאמת boosterConfig ללא gameSettings (gameSettings הוצא לרמת ה-Profile)', () => {
    // וידוא שהשדה gameSettings לא קיים יותר ב-BoosterConfig
    const withGameSettings = { ...validBoosterConfigV1, gameSettings: { 'find-letter-game': {} } };
    // אם יש שדות נוספים, ArkType מתעלם מהם — הטסט בודק שהוא עדיין תקין (לא נדחה)
    expect(BoosterConfigSchemaV1(withGameSettings) instanceof type.errors).toBe(false);
  });
});

// כשתתווסף V2: describe('BoosterConfigSchemaV2', () => { ... })

// ─── BOOSTER_CONFIG_SCHEMA_REGISTRY ──────────────────────────────────────────

describe('BOOSTER_CONFIG_SCHEMA_REGISTRY', () => {
  it('מכיל ערך לגרסה הנוכחית', () => {
    expect(BOOSTER_CONFIG_SCHEMA_REGISTRY[BOOSTER_CONFIG_SCHEMA_VERSION]).toBeDefined();
  });

  it('גרסה נוכחית היא 1', () => {
    expect(BOOSTER_CONFIG_SCHEMA_VERSION).toBe(1);
  });

  it('registry[1] זהה ל-BoosterConfigSchemaV1', () => {
    expect(BOOSTER_CONFIG_SCHEMA_REGISTRY[1]).toBe(BoosterConfigSchemaV1);
  });
});

// ─── STATE_SCHEMA_VERSION ─────────────────────────────────────────────────────

describe('STATE_SCHEMA_VERSION', () => {
  it('גרסת ה-state wrapper היא 2', () => {
    expect(STATE_SCHEMA_VERSION).toBe(2);
  });
});

// ─── ProfileSchema ────────────────────────────────────────────────────────────

describe('ProfileSchema', () => {
  it('מאמת פרופיל תקני עם boosterConfig', () => {
    expect(ProfileSchema(validProfile) instanceof type.errors).toBe(false);
  });

  it('מאמת פרופיל עם color ו-tags', () => {
    const withExtras = { ...validProfile, color: '#ff0000', tags: ['tag1', 'tag2'] };
    expect(ProfileSchema(withExtras) instanceof type.errors).toBe(false);
  });

  it('מאמת פרופיל עם gameSettings', () => {
    const withGameSettings = {
      ...validProfile,
      gameSettings: {
        'find-letter-game': { schemaVersion: 1, data: { gridSize: '4x4' } },
      },
    };
    expect(ProfileSchema(withGameSettings) instanceof type.errors).toBe(false);
  });

  it('דוחה פרופיל חסר id', () => {
    const { id: _, ...rest } = validProfile;
    expect(ProfileSchema(rest) instanceof type.errors).toBe(true);
  });

  it('דוחה פרופיל עם config במקום boosterConfig', () => {
    const withOldConfig = { id: 'p1', name: 'test', config: validBoosterConfigV1, meta: { createdAt: 1, updatedAt: 1 } };
    expect(ProfileSchema(withOldConfig) instanceof type.errors).toBe(true);
  });
});

// ─── ProfilesStateSchema ─────────────────────────────────────────────────────

describe('ProfilesStateSchema', () => {
  it('מאמת state תקני עם dirtyBoosterConfig=null', () => {
    const validState = {
      schemaVersion: 2,
      profiles: { 'profile-1': validProfile },
      order: ['profile-1'],
      activeProfileId: 'profile-1',
      uiEnabled: false,
      dirtyBoosterConfig: null,
    };
    expect(ProfilesStateSchema(validState) instanceof type.errors).toBe(false);
  });

  it('מאמת state עם activeProfileId=null', () => {
    const emptyState = {
      schemaVersion: 2,
      profiles: {},
      order: [],
      activeProfileId: null,
      uiEnabled: false,
      dirtyBoosterConfig: null,
    };
    expect(ProfilesStateSchema(emptyState) instanceof type.errors).toBe(false);
  });

  it('דוחה state עם dirtyConfig (שם ישן) ולא dirtyBoosterConfig', () => {
    const oldState = {
      schemaVersion: 2,
      profiles: {},
      order: [],
      activeProfileId: null,
      uiEnabled: false,
      dirtyConfig: null, // שם ישן — לא מוכר
    };
    expect(ProfilesStateSchema(oldState) instanceof type.errors).toBe(true);
  });
});

// ─── ProfilesExportPayloadSchema ─────────────────────────────────────────────

describe('ProfilesExportPayloadSchema', () => {
  it('מאמת payload תקני', () => {
    const payload = {
      schemaVersion: 2,
      profiles: [validProfile],
      activeProfileId: 'profile-1',
      uiEnabled: false,
    };
    expect(ProfilesExportPayloadSchema(payload) instanceof type.errors).toBe(false);
  });

  it('דוחה payload חסר schemaVersion', () => {
    const { schemaVersion: _, ...rest } = {
      schemaVersion: 2,
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
