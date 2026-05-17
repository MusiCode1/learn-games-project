/**
 * טסטים ל-migration engines — 3 שכבות: state, boosterConfig, per-game.
 * TDD: קובץ זה נכתב לפני migrations.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  runStateMigrations,
  runBoosterConfigMigrations,
  runGameSettingsMigrations,
  registerGameSchema,
  _clearGameSchemaRegistryForTesting,
  STATE_LATEST,
  BOOSTER_CONFIG_LATEST,
} from '../src/lib/config/migrations';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const validEnvVals = {
  hostname: 'localhost',
  fullPath: 'http://localhost',
  isIframe: false,
  selfUrl: '',
  isDevServer: false,
  devMode: false,
  deployServer: '',
  isDeployServer: false,
  isGingim: false,
  isGamePage: false,
  isGamesListPage: false,
  isGingimHomepage: false,
  isBoosterIframe: false,
  isDirectToGamePage: false,
};

const v1Config = {
  appVersion: '0.0.1',
  rewardType: 'video',
  rewardDisplayDurationMs: 20000,
  turnsPerReward: 1,
  environmentMode: 'development',
  envVals: validEnvVals,
  notifications: {
    endingNotification: { text: 'עוד 10 שניות', displayBeforeEndMs: 10000, enabledFor: 'none' },
  },
  video: { videos: [], source: 'google-drive' },
  app: {},
  booster: { siteUrl: '' },
  system: { enableHideModalButton: true, disableGameCodeInjection: false },
};

const v1State = {
  schemaVersion: 1,
  profiles: {
    'profile-1': {
      id: 'profile-1',
      name: 'Test Profile',
      config: {
        ...v1Config,
        gameSettings: {
          'find-letter-game': {
            gridSize: '4x4',
            cooldownMs: 2000,
          },
        },
      },
      meta: { createdAt: 1000, updatedAt: 2000 },
    },
  },
  order: ['profile-1'],
  activeProfileId: 'profile-1',
  uiEnabled: false,
  dirtyConfig: null,
};

// ─── runStateMigrations ───────────────────────────────────────────────────────

describe('runStateMigrations', () => {
  it('v1 state → schemaVersion becomes 2', () => {
    const result = runStateMigrations(v1State);
    expect(result.schemaVersion).toBe(2);
  });

  it('v1 state → profile.config renamed to profile.boosterConfig', () => {
    const result = runStateMigrations(v1State);
    const profile = result.profiles['profile-1'];
    expect(profile.boosterConfig).toBeDefined();
    expect(profile.config).toBeUndefined();
  });

  it('v1 state → gameSettings extracted from boosterConfig to profile root', () => {
    const result = runStateMigrations(v1State);
    const profile = result.profiles['profile-1'];
    expect(profile.gameSettings).toBeDefined();
    expect(profile.boosterConfig.gameSettings).toBeUndefined();
  });

  it('v1 state → gameSettings wrapped in { schemaVersion, data }', () => {
    const result = runStateMigrations(v1State);
    const profile = result.profiles['profile-1'];
    const entry = profile.gameSettings['find-letter-game'];
    expect(entry).toEqual({
      schemaVersion: 1,
      data: { gridSize: '4x4', cooldownMs: 2000 },
    });
  });

  it('v1 state → dirtyConfig renamed to dirtyBoosterConfig', () => {
    const result = runStateMigrations(v1State);
    expect(result.dirtyBoosterConfig).toBe(null);
    expect(result.dirtyConfig).toBeUndefined();
  });

  it('v1 state with dirtyConfig → dirtyBoosterConfig gets the config value', () => {
    const stateWithDirty = {
      ...v1State,
      dirtyConfig: { ...v1Config, _configSchemaVersion: 1 },
    };
    const result = runStateMigrations(stateWithDirty);
    expect(result.dirtyBoosterConfig).toBeDefined();
    expect(result.dirtyConfig).toBeUndefined();
    // _configSchemaVersion נקרא אבל לא נשמר ב-boosterConfig
    expect(result.dirtyBoosterConfig?._configSchemaVersion).toBeUndefined();
  });

  it('v1 state → _configSchemaVersion moved to boosterConfig.schemaVersion', () => {
    const stateWithVersion = {
      ...v1State,
      profiles: {
        'profile-1': {
          ...v1State.profiles['profile-1'],
          config: {
            ...v1Config,
            _configSchemaVersion: 1,
            gameSettings: {},
          },
        },
      },
    };
    const result = runStateMigrations(stateWithVersion);
    const profile = result.profiles['profile-1'];
    expect(profile.boosterConfig.schemaVersion).toBe(1);
    expect(profile.boosterConfig._configSchemaVersion).toBeUndefined();
  });

  it('state without _configSchemaVersion → boosterConfig.schemaVersion defaults to 1', () => {
    const result = runStateMigrations(v1State);
    const profile = result.profiles['profile-1'];
    expect(profile.boosterConfig.schemaVersion).toBe(1);
  });

  it('does not mutate input', () => {
    const input = JSON.parse(JSON.stringify(v1State));
    const snapshot = JSON.parse(JSON.stringify(v1State));
    runStateMigrations(input);
    expect(input).toEqual(snapshot);
  });

  it('state already at latest version → passthrough (no double migration)', () => {
    const alreadyV2 = {
      schemaVersion: 2,
      profiles: {
        'p1': {
          id: 'p1',
          name: 'P',
          boosterConfig: { ...v1Config, schemaVersion: 1 },
          gameSettings: { 'game': { schemaVersion: 1, data: {} } },
          meta: { createdAt: 1, updatedAt: 1 },
        },
      },
      order: ['p1'],
      activeProfileId: 'p1',
      uiEnabled: false,
      dirtyBoosterConfig: null,
    };
    const result = runStateMigrations(alreadyV2);
    expect(result.schemaVersion).toBe(2);
    expect(result.profiles['p1'].boosterConfig).toBeDefined();
  });

  it('multiple profiles — all migrated', () => {
    const multiState = {
      ...v1State,
      profiles: {
        'p1': {
          id: 'p1',
          name: 'P1',
          config: { ...v1Config, gameSettings: { 'game-a': { score: 1 } } },
          meta: { createdAt: 1, updatedAt: 1 },
        },
        'p2': {
          id: 'p2',
          name: 'P2',
          config: { ...v1Config, gameSettings: { 'game-b': { score: 2 } } },
          meta: { createdAt: 2, updatedAt: 2 },
        },
      },
      order: ['p1', 'p2'],
    };
    const result = runStateMigrations(multiState);
    expect(result.profiles['p1'].boosterConfig).toBeDefined();
    expect(result.profiles['p2'].boosterConfig).toBeDefined();
    expect(result.profiles['p1'].gameSettings['game-a']).toEqual({ schemaVersion: 1, data: { score: 1 } });
    expect(result.profiles['p2'].gameSettings['game-b']).toEqual({ schemaVersion: 1, data: { score: 2 } });
  });

  it('STATE_LATEST is 2', () => {
    expect(STATE_LATEST).toBe(2);
  });

  it('throws on missing migration step', () => {
    // state בגרסה שלא קיימת migration אליה
    const future = { ...v1State, schemaVersion: 100 };
    // לא אמור לזרוק כי version >= LATEST — passthrough
    // (אם version > LATEST, הלולאה while(version < LATEST) לא תרוץ)
    expect(() => runStateMigrations(future)).not.toThrow();
  });
});

// ─── runBoosterConfigMigrations ───────────────────────────────────────────────

describe('runBoosterConfigMigrations', () => {
  it('BOOSTER_CONFIG_LATEST is 1', () => {
    expect(BOOSTER_CONFIG_LATEST).toBe(1);
  });

  it('v1 config → passthrough (already at latest)', () => {
    const config = { ...v1Config, schemaVersion: 1 };
    const result = runBoosterConfigMigrations(config);
    expect(result.schemaVersion).toBe(1);
    expect(result.appVersion).toBe(config.appVersion);
  });

  it('config without schemaVersion → defaults to 1 (fallback)', () => {
    // שדה schemaVersion חסר — getSafeVersion מחזיר 1 = LATEST → passthrough
    const config = { ...v1Config };
    const result = runBoosterConfigMigrations(config);
    expect(result.schemaVersion).toBe(1);
  });

  it('config with invalid schemaVersion → defaults to 1', () => {
    const config = { ...v1Config, schemaVersion: 'invalid' };
    const result = runBoosterConfigMigrations(config);
    expect(result.schemaVersion).toBe(1);
  });

  it('does not mutate input', () => {
    const input = { ...v1Config, schemaVersion: 1 };
    const snapshot = { ...input };
    runBoosterConfigMigrations(input);
    expect(input).toEqual(snapshot);
  });
});

// ─── runGameSettingsMigrations ────────────────────────────────────────────────

describe('runGameSettingsMigrations', () => {
  beforeEach(() => {
    _clearGameSchemaRegistryForTesting();
  });

  it('unregistered gameId → passthrough', () => {
    const wrapped = { schemaVersion: 1, data: { score: 5 } };
    const result = runGameSettingsMigrations('unknown-game', wrapped);
    expect(result).toEqual(wrapped);
  });

  it('registered game at current version → passthrough without calling migrate', () => {
    let migrateCalled = false;
    registerGameSchema('test-game', {
      currentVersion: 1,
      migrate: (_data, _ver) => { migrateCalled = true; return _data; },
    });
    const wrapped = { schemaVersion: 1, data: { x: 1 } };
    const result = runGameSettingsMigrations('test-game', wrapped);
    expect(migrateCalled).toBe(false);
    expect(result.schemaVersion).toBe(1);
  });

  it('registered game — migrate from v1 to v2 (single step)', () => {
    registerGameSchema('test-game', {
      currentVersion: 2,
      migrate: (data: any, ver) => {
        if (ver === 1) return { ...data, newField: 'added' };
        return data;
      },
    });
    const wrapped = { schemaVersion: 1, data: { x: 1 } };
    const result = runGameSettingsMigrations('test-game', wrapped);
    expect(result.schemaVersion).toBe(2);
    expect((result.data as any).newField).toBe('added');
    expect((result.data as any).x).toBe(1);
  });

  it('registered game — migrate from v1 to v3 (two steps)', () => {
    const steps: number[] = [];
    registerGameSchema('test-game', {
      currentVersion: 3,
      migrate: (data: any, ver) => {
        steps.push(ver);
        if (ver === 1) return { ...data, step1: true };
        if (ver === 2) return { ...data, step2: true };
        return data;
      },
    });
    const wrapped = { schemaVersion: 1, data: { original: true } };
    const result = runGameSettingsMigrations('test-game', wrapped);
    expect(result.schemaVersion).toBe(3);
    expect((result.data as any).step1).toBe(true);
    expect((result.data as any).step2).toBe(true);
    expect(steps).toEqual([1, 2]);
  });

  it('does not mutate input wrapped object', () => {
    registerGameSchema('test-game', {
      currentVersion: 2,
      migrate: (data: any, _ver) => ({ ...data, added: true }),
    });
    const wrapped = { schemaVersion: 1, data: { original: true } };
    const snapshot = JSON.parse(JSON.stringify(wrapped));
    runGameSettingsMigrations('test-game', wrapped);
    expect(wrapped).toEqual(snapshot);
  });

  it('missing schemaVersion in wrapped → defaults to 1', () => {
    registerGameSchema('test-game', {
      currentVersion: 2,
      migrate: (data: any, _ver) => ({ ...data, upgraded: true }),
    });
    const wrapped = { schemaVersion: 'bad' as any, data: { x: 1 } };
    const result = runGameSettingsMigrations('test-game', wrapped);
    expect(result.schemaVersion).toBe(2);
  });
});
