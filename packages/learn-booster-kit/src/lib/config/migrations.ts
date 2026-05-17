/**
 * Migration engines — 3 שכבות:
 * 1. State (wrapper) — ProfilesState v1 → v2
 * 2. BoosterConfig — loop לפי schemaVersion
 * 3. Per-game settings — registry per gameId
 *
 * כל migration function חייב לעדכן את schemaVersion בסוף ← חשוב למנוע infinite loop.
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function cloneForMigration<T>(input: T): T {
  if (typeof structuredClone === "function") return structuredClone(input);
  return JSON.parse(JSON.stringify(input));
}

function getSafeVersion(value: unknown, fallback = 1): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

// ─── STATE (wrapper) MIGRATIONS ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyState = any;

export const STATE_LATEST = 2;

/**
 * v1 → v2:
 * - profile.config → profile.boosterConfig
 * - profile.config.gameSettings → profile.gameSettings (wrapped in { schemaVersion, data })
 * - profile.config._configSchemaVersion → profile.boosterConfig.schemaVersion (fallback 1)
 * - state.dirtyConfig → state.dirtyBoosterConfig
 * - state.schemaVersion = 2
 */
function migrateStateToV2(state: AnyState): AnyState {
  const profiles = state.profiles ?? {};

  for (const profileId of Object.keys(profiles)) {
    const profile = profiles[profileId];
    if (!profile) continue;

    const oldConfig = profile.config ?? {};

    // קריאת _configSchemaVersion (fallback 1)
    const configSchemaVersion = getSafeVersion(oldConfig._configSchemaVersion);

    // הוצאת gameSettings מתוך config → profile.gameSettings
    const rawGameSettings: Record<string, unknown> = oldConfig.gameSettings ?? {};
    const wrappedGameSettings: Record<string, { schemaVersion: number; data: unknown }> = {};
    for (const [gameId, gameData] of Object.entries(rawGameSettings)) {
      wrappedGameSettings[gameId] = { schemaVersion: 1, data: gameData };
    }

    // בניית boosterConfig — בלי gameSettings ובלי _configSchemaVersion
    const { gameSettings: _gs, _configSchemaVersion: _csv, ...restConfig } = oldConfig;
    const boosterConfig = {
      ...restConfig,
      schemaVersion: configSchemaVersion,
    };

    // עדכון ה-profile
    profile.boosterConfig = boosterConfig;
    delete profile.config;

    if (Object.keys(wrappedGameSettings).length > 0) {
      profile.gameSettings = wrappedGameSettings;
    }
  }

  // dirtyConfig → dirtyBoosterConfig
  if ('dirtyConfig' in state) {
    const dirty = state.dirtyConfig;
    if (dirty !== null && dirty !== undefined) {
      // נקה _configSchemaVersion מה-dirty config גם כן
      const { _configSchemaVersion: _csv, gameSettings: _gs, ...restDirty } = dirty;
      state.dirtyBoosterConfig = {
        ...restDirty,
        schemaVersion: getSafeVersion(dirty._configSchemaVersion),
      };
    } else {
      state.dirtyBoosterConfig = null;
    }
    delete state.dirtyConfig;
  }

  state.schemaVersion = 2;
  return state;
}

const STATE_MIGRATIONS: Record<number, (s: AnyState) => AnyState> = {
  2: migrateStateToV2,
};

export function runStateMigrations(input: AnyState): AnyState {
  const state = cloneForMigration(input);
  state.schemaVersion = getSafeVersion(state.schemaVersion);
  while (state.schemaVersion < STATE_LATEST) {
    const target = state.schemaVersion + 1;
    const fn = STATE_MIGRATIONS[target];
    if (!fn) throw new Error(`Missing state migration to v${target}`);
    fn(state);
  }
  return state;
}

// ─── BOOSTER CONFIG MIGRATIONS ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBoosterConfig = any;

export const BOOSTER_CONFIG_LATEST = 1;

const BOOSTER_CONFIG_MIGRATIONS: Record<number, (b: AnyBoosterConfig) => AnyBoosterConfig> = {
  // 2: migrateBoosterConfigToV2,   // ← להוסיף כאן בעתיד
};

export function runBoosterConfigMigrations(input: AnyBoosterConfig): AnyBoosterConfig {
  const config = cloneForMigration(input);
  config.schemaVersion = getSafeVersion(config.schemaVersion);
  while (config.schemaVersion < BOOSTER_CONFIG_LATEST) {
    const target = config.schemaVersion + 1;
    const fn = BOOSTER_CONFIG_MIGRATIONS[target];
    if (!fn) throw new Error(`Missing booster-config migration to v${target}`);
    fn(config);
  }
  return config;
}

// ─── GAME SETTINGS MIGRATIONS ─────────────────────────────────────────────────

export interface GameSchemaEntry {
  currentVersion: number;
  migrate: (oldData: unknown, oldVersion: number) => unknown;
}

const GAME_SCHEMA_REGISTRY: Map<string, GameSchemaEntry> = new Map();

export function registerGameSchema(gameId: string, entry: GameSchemaEntry): void {
  GAME_SCHEMA_REGISTRY.set(gameId, entry);
}

/** TEST-ONLY — מנקה את ה-registry בין טסטים */
export function _clearGameSchemaRegistryForTesting(): void {
  GAME_SCHEMA_REGISTRY.clear();
}

export function runGameSettingsMigrations(
  gameId: string,
  wrapped: { schemaVersion: number; data: unknown },
): { schemaVersion: number; data: unknown } {
  const entry = GAME_SCHEMA_REGISTRY.get(gameId);
  if (!entry) {
    // לא רשום → passthrough (warning בdev mode)
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.warn(`[migrations] No schema registered for game "${gameId}", passing through.`);
    }
    return wrapped;
  }

  let { schemaVersion, data } = cloneForMigration(wrapped);
  schemaVersion = getSafeVersion(schemaVersion);

  while (schemaVersion < entry.currentVersion) {
    data = entry.migrate(data, schemaVersion);
    schemaVersion += 1;
  }

  return { schemaVersion, data };
}
