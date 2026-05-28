# Migration System — Spec לבנייה

> מסמך מפרט מלא לרפקטור מערכת ה-state-schema של `learn-booster-kit`.
> **קהל יעד:** Sonnet executor + verifier agents.
> **מתודולוגיה:** Planner-Executor pattern. קרא את כולו לפני שאתה מתחיל.

---

## 1. Goal + Non-goals

### Goal

מערכת מיגרציה ברורה ל-3 שכבות נפרדות של state-schema:
1. **State (wrapper)** — `ProfilesState` כולו (profiles map, order, activeProfileId, uiEnabled).
2. **Booster Config** — הגדרות המחזק בלבד (video, app, booster, system, notifications, envVals).
3. **Per-Game Settings** — לכל משחק, schema-version וdata משלו.

בנוסף:
‏- שינוי שם `config` ל-`boosterConfig` ברמת ה-Profile (Strangler — לא alias, full rename עם migration אוטומטי).
‏- העברת `gameSettings` מתוך `boosterConfig` החוצה לרמת ה-Profile.
‏- הסרת `_configSchemaVersion` מתוך ה-config — מוחלף ב-`boosterConfig.schemaVersion` (שדה לגיטימי, לא prefix של underscore).

### Non-goals

‏- **לא** לגעת במשחק `find-letter-game` עצמו. הוא ירוץ אחר כך כ-slice נפרד.
‏- **לא** להמציא migrations חדשים ל-boosterConfig (אין כרגע — current=v1, latest=v1).
‏- **לא** ליצור registration API מפורט ל-`gameId`. רק data structure + helpers בסיסיים.
‏- **לא** לעדכן apps אחרים. רק `learn-booster-kit`. סוף.

---

## 2. Current state — מה יש היום

### Storage location

```
localStorage["learn-booster-profiles:v1"]   ← ProfilesState (כל ה-profiles + active)
localStorage["learn-booster-config"]        ← snapshot של appConfig (legacy של config-manager)
```

### Current shape — `ProfilesState v1`

ראה: `packages/learn-booster-kit/test/fixtures/profiles-state/v01.json`.

זהו **fixture אנונימי** של מצב נוכחי שנלקח מ-baseline אמיתי (`docs/private-docs/live-snapshots/profiles-state-baseline.json`). אנונימיזציה: UUID → `00000000-...0001`, video URLs → `https://example.com/...`, hostname → `localhost`.

### Current shape — `Config v1` (השמור בתוך profile.config)

‏Schema ב-`packages/learn-booster-kit/src/schemas.ts:38` (`ConfigSchemaV1`). השדות:
‏- `appVersion`, `rewardType`, `rewardDisplayDurationMs`, `turnsPerReward`, `environmentMode`
‏- `envVals`
‏- `notifications`, `video`, `app`, `booster`, `system`
‏- `gameSettings?` — map `gameId → unknown` (כל משחק שולח flat data שלו)

### Problems with current shape

1. ‏`gameSettings` חיים **בתוך** `config` — schema migration ל-config יכפה migration על game settings.
2. ‏`_configSchemaVersion` נכתב ל-localStorage **רק** ב-`saveConfigToStorage` (`config-manager.ts:160`) — לא ב-`profile.config`. כשטוענים פרופיל ישן, אין דרך לדעת איזו schema-version זה.
3. השם `config` גנרי מדי. בפועל הוא **הגדרות המחזק**.
4. אין schema-version per-game.

### Critical files (file:line)

| מטרה | קובץ | שורות |
|------|------|--------|
| ConfigSchemaV1 | `src/schemas.ts` | 38–73 |
| `gameSettings?` field ב-ConfigSchema | `src/schemas.ts` | 72 |
| ProfileSchema | `src/schemas.ts` | 89–99 |
| ProfilesStateSchema | `src/schemas.ts` | 104–112 |
| ProfilesExportPayloadSchema | `src/schemas.ts` | 116–122 |
| `_configSchemaVersion` קריאה | `src/lib/config/config-manager.ts` | 131, 132 |
| `_configSchemaVersion` כתיבה | `src/lib/config/config-manager.ts` | 160 |
| `getGameSettings` | `src/lib/config/config-manager.ts` | 248–252 |
| `updateGameSettings` | `src/lib/config/config-manager.ts` | 273–301 |
| `subscribeGameSettings` | `src/lib/config/config-manager.ts` | 309–325 |
| `gameSettings: {}` ב-default | `src/lib/config/default-config.ts` | 63–65 |
| `SCHEMA_VERSION = 1` של ProfilesState | `src/lib/config/profile-manager.ts` | 15 |
| `loadFromStorage` | `src/lib/config/profile-manager.ts` | 326–346 |
| `normalizeState` | `src/lib/config/profile-manager.ts` | 348–393 |
| ‏API public export | `src/index.ts` | 12, 13 |

### Single caller of game-settings API

`apps/find-letter-game/src/lib/stores/settings.svelte.ts:209,223` — `updateGameSettings(GAME_ID, snap)` ו-`subscribeGameSettings(GAME_ID, ...)`. **לא לגעת בקובץ זה** — ה-API החדש חייב להיות compatible (הם משתמשים ב-`<FindLetterSettings>` flat).

---

## 3. Target state — מה צריך להיות

### Target shape — `ProfilesState v2`

מה שצריך להיווצר אחרי `migrate(fixture v01)`:

```json
{
  "schemaVersion": 2,
  "profiles": {
    "00000000-0000-0000-0000-000000000001": {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Default Profile",
      "boosterConfig": {
        "schemaVersion": 1,
        "appVersion": "0.0.1",
        "rewardType": "video",
        "rewardDisplayDurationMs": 20000,
        "turnsPerReward": 1,
        "environmentMode": "development",
        "envVals": { ... כל ה-envVals ... },
        "notifications": { ... },
        "video": { ... },
        "app": { ... },
        "booster": { ... },
        "system": { ... }
      },
      "gameSettings": {
        "find-letter-game": {
          "schemaVersion": 1,
          "data": {
            "gridSize": "4x4",
            "autoSpeakOnNewRound": true,
            ... כל ה-flat data כפי שהיה ב-config.gameSettings["find-letter-game"]
          }
        }
      },
      "meta": {
        "createdAt": 1779019113848,
        "updatedAt": 1779022230167
      }
    }
  },
  "order": ["00000000-0000-0000-0000-000000000001"],
  "activeProfileId": "00000000-0000-0000-0000-000000000001",
  "uiEnabled": false,
  "dirtyBoosterConfig": null
}
```

### השוואת השמות

| ‏Old (v1) | ‏New (v2) | הערה |
|-----------|-----------|-------|
| `state.dirtyConfig` | `state.dirtyBoosterConfig` | שינוי שם — ברור יותר |
| `profile.config` | `profile.boosterConfig` | rename + הוצאת `gameSettings` החוצה |
| `profile.config.gameSettings` | `profile.gameSettings` | move out of boosterConfig |
| `profile.config.gameSettings[id]` (flat) | `profile.gameSettings[id] = { schemaVersion, data }` | wrap |
| `profile.config._configSchemaVersion` (אם קיים) | `profile.boosterConfig.schemaVersion` | clean field, no underscore |

### Schema versions אחרי הרפקטור

| שכבה | Const | Value |
|------|-------|--------|
| Wrapper | `STATE_SCHEMA_VERSION` | `2` |
| ‏BoosterConfig | `BOOSTER_CONFIG_SCHEMA_VERSION` | `1` |
| ‏Per-game (find-letter) | (registered by game) | `1` |

---

## 4. Anti-patterns ידועים — אל תעשה

### ❌ TDD ירוק על unit migration לבד
טסט יחיד ש"מ-v1 ל-v2 משנה שדה X" יכול לעבור גם כשהפלט שגוי במקום אחר.
✅ **חובה integration test** — fixture v01 כתוב → `runStateMigrations` → JSON deep-equal לתוצאה הצפויה (fixture-לbe-created `v01.expected.json` או inline במבחן).

### ❌ צנרת שבורה בין שכבות מיגרציה
3 שכבות migration נפרדות → צריך להפעיל את כולן ב-`loadFromStorage` בסדר הנכון:
1. ‏State migration — מעלה את ה-wrapper, ובתוכו מעדכן את structure של profile (boosterConfig + gameSettings).
2. ‏BoosterConfig migration — לכל `profile.boosterConfig` מריץ את ה-booster migrations.
3. ‏Per-game migration — לכל `profile.gameSettings[gameId]` מריץ migrations לפי registry של המשחק.

✅ **טסט שעובר על כל הצינור** עם fixture שיש לו את כל 3 השכבות "ישנות".

### ❌ Refactor חלקי — שכחת לעדכן את `defaultConfig`
‏`default-config.ts:63-65` מכיל `gameSettings: {}` ב-config. בעולם החדש הוא לא מקום שם.
‏✅ עדכן את `default-config.ts` — מחזיר `BoosterConfig` (בלי gameSettings).

### ❌ Hardcoded `null` כפלייסהולדר ל-id ש"נמלא אחר כך"
‏אם `subscribeGameSettings` משתנה ל-`activeProfile.gameSettings`, ויש מצב שבו `activeProfile` עדיין null (loading) — אל תקרא ל-`callback(null)`. **קרא ל-`callback(undefined)`** או דחה עד שיש פרופיל.

### ❌ Migrate שלא משאיר `schemaVersion` מעודכן
‏לולאת `while (version < LATEST)` עם migration שלא מעדכן את `state.schemaVersion = N+1` → infinite loop. בכל migration function — בסוף לעדכן את `schemaVersion` לערך החדש.

### ❌ הסרת `_configSchemaVersion` בלי לקרוא אותו קודם ב-migration
‏אם קיים `profile.config._configSchemaVersion` ב-fixture — צריך לקרוא אותו, להעביר ל-`profile.boosterConfig.schemaVersion`, ורק אז למחוק. אם פשוט מוחקים — נאבד גרסה.

### ❌ Refactor של `index.ts` שמשבר את `apps/find-letter-game`
‏ב-`index.ts:13` יש `export * as configManager from "./lib/config/config-manager";` — `apps/find-letter-game/src/lib/stores/settings.svelte.ts` משתמש ב-`configManager.updateGameSettings(GAME_ID, snap)` ו-`configManager.subscribeGameSettings(...)`.

‏✅ **שמור על אותם שמות הפונקציות** (`getGameSettings`, `updateGameSettings`, `subscribeGameSettings`) ועל אותה חתימה. רק ה-internal storage path משתנה.

### ❌ Mock-based unit tests שלא מעבירים שכבה
‏אם אתה בודק `runBoosterMigrations` עם mock של ה-state, ו-`loadFromStorage` עם mock של ה-fixture — אף טסט לא מאשר ש-`loadFromStorage` באמת קורא ל-`runBoosterMigrations`.
‏✅ Integration test שטוען fixture מ-disk → קורא ל-`loadFromStorage` → בודק את ה-state בזיכרון.

---

## 5. ‏Data Flow Bridges

לכל זוג (Producer, Consumer) — מנגנון מפורש:

| Producer | Consumer | Data | Mechanism | קובץ:שורה (מצופה) |
|----------|----------|------|-----------|--------------------|
| `localStorage["learn-booster-profiles:v1"]` | `profile-manager` | ‏Raw JSON | `loadFromStorage` → `runAllMigrations(parsed)` → `normalizeState` | profile-manager.ts |
| ‏Wrapper migration (state v1→v2) | `profile.boosterConfig` | rename `config` + extract gameSettings + extract `_configSchemaVersion` | inside `migrateStateToV2(state)` | migrations.ts |
| ‏Per-profile booster migration | `profile.boosterConfig` (final) | full migration loop | `runBoosterMigrations(boosterConfig)` קוראים אחרי state migration | profile-manager.ts loadFromStorage |
| ‏Per-game migration | `profile.gameSettings[gameId]` | `{ schemaVersion, data }` עובר migrations של המשחק | `runGameSettingsMigrations(gameId, wrapped)` — אם המשחק רשם migrations; אחרת passthrough | profile-manager.ts loadFromStorage |
| `updateGameSettings(gameId, data)` | `localStorage` | wrap data → `{ schemaVersion: LATEST, data }` ב-`activeProfile.gameSettings[gameId]` | קורא ל-`saveActiveProfileBoosterConfig` או similar — לא דרך deepMerge | config-manager.ts |
| `getGameSettings<T>(gameId)` | caller (find-letter store) | unwrap `data` field | `activeProfile.gameSettings[gameId]?.data as T \| undefined` | config-manager.ts |
| `subscribeGameSettings<T>` | callback | unwrap `data` field, fire on change | listen to profile-state changes, compare wrapped reference | config-manager.ts |

**Critical bridge:** `updateGameSettings` כרגע (line 273–301) משתמש ב-`appConfig.gameSettings`. אחרי הרפקטור — `appConfig` כבר לא מחזיק `gameSettings`. המקור הוא `getActiveProfile().gameSettings`. **חובה לעדכן את כל 3 ה-helpers**.

---

## 6. ‏API Public — חתימות חדשות (compatible)

ה-API החיצוני **לא משתנה ביותר ממה שמוכרח**:

```ts
// אלה לא משתנים בחתימה — רק במימוש פנימי:
export function getGameSettings<T = unknown>(gameId: string): T | undefined;
export async function updateGameSettings<T = unknown>(
  gameId: string,
  settings: T,
): Promise<Result<BoosterConfig, ValidationError>>;
//                                ^^^^^^^^^^^^^^ שינוי: Config → BoosterConfig
export function subscribeGameSettings<T = unknown>(
  gameId: string,
  callback: (settings: T | undefined) => void,
): () => void;

// חדש (לא הכרחי בשלב זה, אבל מקום שמור):
export function registerGameSchema(gameId: string, options: {
  currentVersion: number;
  migrate: (oldData: unknown, oldVersion: number) => unknown;
}): void;
```

**הערה לגבי `Config` → `BoosterConfig`:**
ה-`Result<Config, ...>` ב-`updateGameSettings` הופך ל-`Result<BoosterConfig, ...>`. find-letter store לא משתמש ב-value הזה (רק בודק `result.success`), אז זה לא יישבר. אבל זה breaking change ב-types. **תיעד ב-walkthrough**.

---

## 7. ‏Phases — חלוקה לקומיטים

חמישה phases, כל אחד עם DoD ייעודי. **כל phase = קומיט אחד** (אלא אם הוראה אחרת).

### Phase 1 — Schemas + Types

**מטרה:** הגדרת השכבות החדשות ב-`schemas.ts` ו-`types.ts`, בלי לגעת ב-runtime.

**שינויים:**
1. ב-`schemas.ts`:
   ‏- מ-`ConfigSchemaV1` הסר את `gameSettings?` (שורה 72).
   ‏- שנה שם: `ConfigSchemaV1` → `BoosterConfigSchemaV1`, `ConfigSchema` → `BoosterConfigSchema`, `Config` (type) → `BoosterConfig`, `CONFIG_SCHEMA_VERSION` → `BOOSTER_CONFIG_SCHEMA_VERSION`, `CONFIG_SCHEMA_REGISTRY` → `BOOSTER_CONFIG_SCHEMA_REGISTRY`.
   ‏- הוסף שדה `schemaVersion: "number"` ל-`BoosterConfigSchemaV1` (טוב לאמת שזה תמיד יוכלל ב-state).
   ‏- הגדר `GameSettingsEntrySchema = type({ schemaVersion: "number", data: "unknown" })`.
   ‏- עדכן `ProfileSchema`:
     ```
     ProfileSchema = type({
       id: "string",
       name: "string",
       "color?": "string",
       "tags?": "string[]",
       boosterConfig: BoosterConfigSchema,
       "gameSettings?": type({ "[string]": GameSettingsEntrySchema }),
       meta: { createdAt: "number", updatedAt: "number" },
     });
     ```
   ‏- עדכן `ProfilesStateSchema`: `dirtyConfig` → `dirtyBoosterConfig` (אותו union: `[BoosterConfigSchema, "|", "null"]`).
   ‏- עדכן `ProfilesExportPayloadSchema`: עכשיו מכיל profiles עם boosterConfig + gameSettings (סוף הצורה החדשה).
2. ב-`types.ts`: הוסף `export type { BoosterConfig, GameSettingsEntry }` (אם לא נחשפים מ-schemas via type-of-infer).
3. הוסף `STATE_SCHEMA_VERSION = 2 as const`.

**אסור:** לגעת ב-`config-manager.ts` או `profile-manager.ts` ב-phase זה — רק schemas + types. הרבה errors יתקבלו בקוד שמשתמש ב-`Config`. **זה תקין** — phase 4 יתקן.

**DoD Phase 1:**
‏- ‏`bun run --filter learn-booster-kit check` — מצופה errors ב-config-manager/profile-manager (לא קשור ל-schemas). schemas עצמם — 0 errors.
‏- ‏`bun run --filter learn-booster-kit test test/schemas.spec.ts` — אם נשבר, עדכן את ה-test לקבל את הצורה החדשה.
‏- ‏commit: `refactor(kit): schemas — BoosterConfig + Profile עם gameSettings ברמת root`

### Phase 2 — Migration Engines

**מטרה:** קובץ חדש `src/lib/config/migrations.ts` עם 3 פונקציות מקבילות לפי תבנית daily-schedule.

**מבנה:**

```ts
// migrations.ts
import { BoosterConfigSchemaV1, /* etc */ } from "../../schemas";

function cloneForMigration<T>(input: T): T {
  if (typeof structuredClone === "function") return structuredClone(input);
  return JSON.parse(JSON.stringify(input));
}

function getSafeVersion(value: unknown, fallback = 1): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

// ========== STATE (wrapper) MIGRATIONS ==========
type AnyState = any;
export const STATE_LATEST = 2;

function migrateStateToV2(state: AnyState): AnyState {
  // לכל profile:
  //   הוצאת gameSettings מתוך config → profile.gameSettings (עטוף ב-{schemaVersion:1, data})
  //   קריאת _configSchemaVersion (fallback 1) → profile.boosterConfig.schemaVersion
  //   שינוי שם: profile.config → profile.boosterConfig (אחרי שהוצאנו הכל)
  //   מחיקת _configSchemaVersion מתוך boosterConfig
  // dirtyConfig → dirtyBoosterConfig
  // state.schemaVersion = 2
  return state;
}

export const STATE_MIGRATIONS: Record<number, (s: AnyState) => AnyState> = {
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

// ========== BOOSTER CONFIG MIGRATIONS ==========
type AnyBoosterConfig = any;
export const BOOSTER_CONFIG_LATEST = 1;

export const BOOSTER_CONFIG_MIGRATIONS: Record<number, (b: AnyBoosterConfig) => AnyBoosterConfig> = {
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

// ========== GAME SETTINGS MIGRATIONS ==========
// Registry per gameId. ריק כברירת מחדל. המשחק רושם בעצמו דרך registerGameSchema.

export interface GameSchemaEntry {
  currentVersion: number;
  migrate: (oldData: unknown, oldVersion: number) => unknown;
}

const GAME_SCHEMA_REGISTRY: Map<string, GameSchemaEntry> = new Map();

export function registerGameSchema(gameId: string, entry: GameSchemaEntry): void {
  GAME_SCHEMA_REGISTRY.set(gameId, entry);
}

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
    if (import.meta.env?.DEV) {
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
```

**טסטים ל-phase זה (`test/migrations.spec.ts`):**
‏- `runStateMigrations`: state v1 (fixture inline או מ-disk) → v2 + שדות זזו כצפוי.
‏- `runBoosterConfigMigrations`: passthrough כי v1=latest. בדיקה שלא קורס על input חסר `schemaVersion`.
‏- `runGameSettingsMigrations`: 
  ‏- ‏gameId שלא רשום → passthrough.
  ‏- ‏gameId רשום עם migrate function — בדיקה שמיגרציה מ-v1 ל-v3 רצה שני שלבים.
  ‏- `cloneForMigration` — input לא מתשנה.

**DoD Phase 2:**
‏- כל הטסטים החדשים ירוקים.
‏- ‏`bun run --filter learn-booster-kit test test/migrations.spec.ts` עובר.
‏- ‏commit: `feat(kit): מנוע migrations לשלוש שכבות — state, boosterConfig, per-game`

### Phase 3 — Fixtures + Integration Test

**מטרה:** וודא ש-`runStateMigrations(fixture v01)` מייצר את ה-target shape **בדיוק**.

**שינויים:**
1. ‏Fixture `v01.json` כבר קיים ב-`test/fixtures/profiles-state/v01.json` (אני הכנתי).
2. צור `test/fixtures/profiles-state/v01.expected.json` — התוצאה הצפויה (target shape — סעיף 3 ב-spec).
3. צור `test/state-migration.spec.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { runStateMigrations } from "../src/lib/config/migrations";

const FIXTURES = path.resolve(__dirname, "fixtures/profiles-state");

describe("ProfilesState migrations — fixtures", () => {
  it("v01 → migrated == v01.expected", () => {
    const input = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.json"), "utf8"));
    const expected = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.expected.json"), "utf8"));
    const actual = runStateMigrations(input);
    expect(actual).toEqual(expected);
  });

  it("does not mutate input", () => {
    const input = JSON.parse(fs.readFileSync(path.join(FIXTURES, "v01.json"), "utf8"));
    const snapshot = JSON.parse(JSON.stringify(input));
    runStateMigrations(input);
    expect(input).toEqual(snapshot);
  });
});
```

4. צור `test/state-migration.live.spec.ts` (live snapshot test, `it.skip` אם הקובץ חסר):

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { runStateMigrations } from "../src/lib/config/migrations";

const LIVE = path.resolve(
  __dirname,
  "../../../docs/private-docs/live-snapshots/profiles-state-baseline.json",
);

describe("Live snapshot migration (local only)", () => {
  const run = fs.existsSync(LIVE) ? it : it.skip;
  run("baseline → migrates to latest shape", () => {
    const input = JSON.parse(fs.readFileSync(LIVE, "utf8"));
    const out = runStateMigrations(input);
    expect(out.schemaVersion).toBe(2);
    expect(typeof out.profiles).toBe("object");
    // לכל פרופיל: יש boosterConfig עם schemaVersion, אין config
    for (const p of Object.values(out.profiles) as any[]) {
      expect(p.boosterConfig).toBeDefined();
      expect(typeof p.boosterConfig.schemaVersion).toBe("number");
      expect(p.config).toBeUndefined();
      if (p.gameSettings) {
        for (const entry of Object.values(p.gameSettings) as any[]) {
          expect(typeof entry.schemaVersion).toBe("number");
          expect(entry.data).toBeDefined();
        }
      }
    }
    expect(out.dirtyConfig).toBeUndefined();
  });
});
```

**DoD Phase 3:**
‏- ‏`bun run --filter learn-booster-kit test test/state-migration.spec.ts` — עובר.
‏- אצלי על המחשב, `bun run --filter learn-booster-kit test test/state-migration.live.spec.ts` ירוץ ויעבור (כי הקובץ הפרטי קיים). ב-CI הוא ידולג.
‏- ‏commit: `test(kit): fixtures v01 + integration tests למיגרציות state`

### Phase 4 — Wire Up to profile-manager + config-manager

**מטרה:** חיבור ה-migration engines ל-runtime. **ה-phase הקריטי ביותר. צפויה תקלת צנרת.**

**שינויים ב-`profile-manager.ts`:**

1. עדכן `SCHEMA_VERSION = 1` → `STATE_SCHEMA_VERSION = 2` (ייבא מ-migrations).
2. `loadFromStorage` (שורות 326–346):
   ```ts
   function loadFromStorage(): void {
     migrateProfilesStorage();
     if (!isStorageAvailable()) return;
     try {
       const raw = localStorage.getItem(STORAGE_KEY);
       if (!raw) return;
       const parsed: unknown = JSON.parse(raw);
       if (!parsed) return;

       // === MIGRATION CHAIN ===
       // 1. State migration (wrapper)
       const stateMigrated = runStateMigrations(parsed);

       // 2. Per-profile booster-config migration + per-game migration
       for (const profile of Object.values(stateMigrated.profiles ?? {}) as any[]) {
         if (profile.boosterConfig) {
           profile.boosterConfig = runBoosterConfigMigrations(profile.boosterConfig);
         }
         if (profile.gameSettings) {
           for (const [gameId, wrapped] of Object.entries(profile.gameSettings) as [string, any][]) {
             profile.gameSettings[gameId] = runGameSettingsMigrations(gameId, wrapped);
           }
         }
       }

       // 3. Schema validation (after all migrations)
       const result = ProfilesStateSchema(stateMigrated);
       if (result instanceof type.errors) {
         console.warn("Profiles storage has validation issues after migration:", result.summary);
         state = normalizeState(stateMigrated as Partial<ProfilesState>);
       } else {
         state = normalizeState(result);
       }
     } catch (error) {
       console.error("Failed to load profiles from storage:", error);
       state = createEmptyState();
     }
   }
   ```

3. `normalizeState` (שורות 348–393): עדכן את הלוגיקה לטפל ב-`boosterConfig` במקום `config`, ו-`gameSettings` ברמת ה-profile. הקריאה ל-`buildProfile` תקבל `boosterConfig` ו-`gameSettings`.

4. `buildProfile` (שורות 408–431): חתימה חדשה:
   ```ts
   function buildProfile(options: {
     id?: string;
     name: string;
     boosterConfig: BoosterConfig;
     gameSettings?: Record<string, { schemaVersion: number; data: unknown }>;
     color?: string;
     tags?: string[];
     createdAt?: number;
     updatedAt?: number;
   }): Profile {
     // ...
   }
   ```

5. `cloneProfile` (שורות 433–451): עדכן ל-`boosterConfig` ול-`gameSettings`.

6. `saveActiveProfileConfig` (שורות 198–215): שנה שם ל-`saveActiveProfileBoosterConfig`, וקבל `BoosterConfig`. עדכן את ה-export ב-`index.ts` בהתאם.

7. `markDirtyConfig` / `clearDirtyConfig`: שינוי שם ל-`markDirtyBoosterConfig` / `clearDirtyBoosterConfig`. עדכן את `state.dirtyConfig` → `state.dirtyBoosterConfig`.

8. הוסף helpers חדשים פנימיים:
   ```ts
   export function getActiveProfileGameSettings(gameId: string): { schemaVersion: number; data: unknown } | undefined;
   export function setActiveProfileGameSettings(gameId: string, wrapped: { schemaVersion: number; data: unknown }): Profile;
   ```

**שינויים ב-`config-manager.ts`:**

1. שורות 131-133, 160: **מחק** את ההתייחסות ל-`_configSchemaVersion`. ב-`saveConfigToStorage` חדש (אם נשאר) — שמור את `appConfig` כ-`BoosterConfig` עם `schemaVersion` (לא underscore).
2. שורות 248-252 (`getGameSettings`):
   ```ts
   export function getGameSettings<T = unknown>(gameId: string): T | undefined {
     const wrapped = getActiveProfileGameSettings(gameId);
     return wrapped?.data as T | undefined;
   }
   ```
3. שורות 273-301 (`updateGameSettings`):
   ```ts
   export async function updateGameSettings<T = unknown>(
     gameId: string,
     settings: T,
   ): Promise<Result<BoosterConfig, ValidationError>> {
     // אורז ב-{ schemaVersion: currentVersion, data: settings }
     // בקריאה ל-setActiveProfileGameSettings(gameId, wrapped)
     // (validation על הצורה של wrapped — לא על ה-data עצמו; data is unknown)
     // notifyConfigListeners כדי שsubscribers ירגישו
     // מחזיר ok(appConfig) — BoosterConfig של הפרופיל הפעיל
   }
   ```
4. שורות 309-325 (`subscribeGameSettings`):
   ```ts
   export function subscribeGameSettings<T = unknown>(
     gameId: string,
     callback: (settings: T | undefined) => void,
   ): () => void {
     let last: T | undefined = getGameSettings<T>(gameId);
     callback(last);
     // listen to profile-manager state changes (not config listeners)
     // when activeProfileId changes or activeProfile.gameSettings[gameId] changes
     // → re-fire if data is different
   }
   ```

**שינויים ב-`default-config.ts`:**
‏- ‏`getDefaultConfig` → `getDefaultBoosterConfig` (חתימה: מחזיר `BoosterConfig` בלי `gameSettings`).
‏- הוסף שדה `schemaVersion: BOOSTER_CONFIG_SCHEMA_VERSION` בקבוע.
‏- מחק `gameSettings: {}` (שורות 63-65).

**שינויים ב-`index.ts`:**
‏- ‏Re-export החדש: `BoosterConfig` (type), `BOOSTER_CONFIG_SCHEMA_VERSION`, `STATE_SCHEMA_VERSION`.
‏- ‏`registerGameSchema` מ-migrations.
‏- שמור על `export * as configManager` — הוא יחשוף את כל הפונקציות הפנימיות החדשות.

**DoD Phase 4:**
‏- ‏`bun run --filter learn-booster-kit check` — 0 errors.
‏- ‏`bun run --filter learn-booster-kit test` — כל הטסטים ירוקים, כולל `state-migration.live.spec.ts`.
‏- **חובה verifier-phase כאן** (ראה סעיף 9). אי אפשר להמשיך ל-phase 5 בלי שהבדיקות החיות עוברות.
‏- ‏commit: `refactor(kit): חיבור migrations ל-profile-manager + config-manager`

### Phase 5 — Mockup Compliance Audit + JSON Shape Verification

**מטרה:** וודא שהמעבר עובד מקצה לקצה — לא רק טסטים יחידים.

**משימות:**

1. ‏**JSON shape audit** — בדיקה ידנית באמצעות Node REPL:
   ```ts
   import fs from "node:fs";
   const baseline = JSON.parse(fs.readFileSync("docs/private-docs/live-snapshots/profiles-state-baseline.json", "utf8"));
   const expected = JSON.parse(fs.readFileSync("packages/learn-booster-kit/test/fixtures/profiles-state/v01.expected.json", "utf8"));
   import { runStateMigrations } from "./packages/learn-booster-kit/src/lib/config/migrations";
   const actual = runStateMigrations(baseline);
   // השווה — צריך להיות זהה ל-expected למעט: UUID, hostname, video URLs, createdAt/updatedAt
   ```

2. **‏Live integration check** (אופציונלי, מומלץ): פתח את `https://musicode-find-letter-exp.nue.tuns.sh/settings` ב-linux-gui. וודא שה-settings נטענים (הם ייעברו את ה-migration ברגע הראשון). שנה משהו (cooldownMs). אזור עם `localStorage.getItem("learn-booster-profiles:v1")` ובדוק שה-shape חדש (יש `boosterConfig`, אין `config`).

3. ‏**Walkthrough update** — הוסף entry מקיף ל-`packages/learn-booster-kit/docs/walkthrough.md` המתעד את הרפקטור: למה, מה, ההגירה האוטומטית.

4. ‏**אסור לדלג על verifier-slice** — קרא לו אחרי קומיט phase 5.

**DoD Phase 5:**
‏- ‏`bun run --filter learn-booster-kit check && bun run --filter learn-booster-kit test` — שניהם ירוקים.
‏- ‏`grep -r "_configSchemaVersion" packages/learn-booster-kit/src/` — אפס תוצאות.
‏- ‏`grep -r "config.gameSettings\b" packages/learn-booster-kit/src/` — אפס תוצאות.
‏- ‏`grep -rn "profile.config\b\|\.config:" packages/learn-booster-kit/src/lib/config/` — אפס תוצאות (חוץ מ-migration.ts שכן מתייחס ל-`profile.config` הישן).
‏- `docs/walkthrough.md` מעודכן.
‏- ‏commit: `chore(kit): cleanup + walkthrough למיגרציות 3 שכבות`

---

## 8. ‏Critical Delete Instructions

### Delete ב-`src/schemas.ts`

| מיקום | מה למחוק |
|--------|-----------|
| שורה 72 | `"gameSettings?": type({ "[string]": "unknown" }),` |

### Delete ב-`src/lib/config/config-manager.ts`

| מיקום | מה למחוק |
|--------|-----------|
| שורות 131-133 | בלוק קריאה של `_configSchemaVersion` (מחליפים בקריאה של `boosterConfig.schemaVersion`) |
| שורה 160 | `_configSchemaVersion: CONFIG_SCHEMA_VERSION,` בתוך `saveConfigToStorage` |
| שורות 249, 278, 317 | `appConfig.gameSettings` — מוחלף בקריאה ל-active profile |

### Delete ב-`src/lib/config/default-config.ts`

| מיקום | מה למחוק |
|--------|-----------|
| שורות 63-65 | `// game-specific settings...` + `gameSettings: {},` |

### Rename ב-`src/lib/config/profile-manager.ts`

| ‏Old | ‏New |
|------|------|
| ‏`saveActiveProfileConfig` | `saveActiveProfileBoosterConfig` |
| ‏`markDirtyConfig` | `markDirtyBoosterConfig` |
| ‏`clearDirtyConfig` | `clearDirtyBoosterConfig` |
| ‏`state.dirtyConfig` | `state.dirtyBoosterConfig` |

---

## 9. ‏Verifier Calls — חובה

אחרי Phase 4 — `verifier-phase` (חובה):

```
Task(subagent_type="verifier-phase", prompt="""
מקור: docs/migration-system-spec.md
‏Phase: 4 — Wire Up to profile-manager + config-manager
Commit hash: <ה-hash של הקומיט שזה עתה ביצעת>
‏Environment: localhost. אין dev server רץ אבל יש tunnel ב-musicode-find-letter-exp.nue.tuns.sh.

בדוק:
1. כל הטסטים ירוקים: bun run --filter learn-booster-kit check && bun run --filter learn-booster-kit test
2. state-migration.live.spec.ts עובר (לא דילוג) — הקובץ docs/private-docs/live-snapshots/profiles-state-baseline.json קיים.
3. Sanity ידני: node -e שטוען את ה-fixture, מריץ runStateMigrations, מדפיס את ה-shape הסופי. וודא שיש boosterConfig (לא config), gameSettings ברמת profile, schemaVersion: 2.
4. הסטור הקיים של find-letter (apps/find-letter-game/src/lib/stores/settings.svelte.ts) — עובר check. הוא עצמו לא נגעו בו, אבל ה-API השתנה בחתימת ה-return-type של updateGameSettings (Config → BoosterConfig). וודא שזה לא שובר.

דווח:
- DoD items: ✅/⚠️/❌ לכל אחד.
- בעיות שמצאת (אם יש).
- האם בטוח להמשיך ל-Phase 5.
""")
```

אחרי Phase 5 — `verifier-slice` (חובה):

```
Task(subagent_type="verifier-slice", prompt="""
מקור: docs/migration-system-spec.md
‏Base commit: <ה-hash לפני Phase 1>
Slice: Migration System refactor (3-layer schemas + boosterConfig rename).
‏Environment: linux-gui browser דרך pw-clean.sh על http://musicode-find-letter-exp.nue.tuns.sh.

עבור על כל ה-DoD items בסעיף 7 (Phases 1-5) ובסעיף 8 (Delete Instructions).
ספציפית:
1. ‏`bun run --filter learn-booster-kit check` — 0 errors? צרף output.
2. ‏`bun run --filter learn-booster-kit test` — צרף שורת ה-summary.
3. ‏Greps של Phase 5 DoD — צרף תוצאות.
4. JSON shape: טען את baseline + הרץ runStateMigrations + השווה ל-v01.expected.json (התעלם מ-UUID, hostname, video URLs, timestamps). דווח על delta.
5. ‏Live UI: פתח את https://musicode-find-letter-exp.nue.tuns.sh/settings ב-linux-gui. בדוק:
   - הדף נטען בלי errors ב-console
   - localStorage["learn-booster-profiles:v1"] — שאל בצורה הקיימת (יש boosterConfig + gameSettings? יש schemaVersion: 2?)
   - שינוי הגדרה (למשל cooldownMs) — נשמרת? אחרי refresh — נשמרה?
6. ‏Regressions: כל פעולה ב-/settings עדיין עובדת (toggle, slider, checkbox).

כתוב דוח ל-docs/migration-system-verification-report.md.
""")
```

---

## 10. ‏Checklist סופי לפני סיום

לפני שאתה (Sonnet executor) מצהיר שסיימת — וודא:

‏- [ ] 5 קומיטים בעברית בפורמט `(scope): כותרת`
‏- [ ] כל phase עם `walkthrough.md` entry
‏- [ ] ‏`bun run --filter learn-booster-kit check` — 0 errors
‏- [ ] ‏`bun run --filter learn-booster-kit test` — כל הטסטים ירוקים
‏- [ ] ‏Fixture `v01.json` ו-`v01.expected.json` ב-test/fixtures/profiles-state/
‏- [ ] live-snapshot test קיים (it.skip אם אין קובץ פרטי)
‏- [ ] ‏`verifier-phase` רץ אחרי Phase 4
‏- [ ] ‏`verifier-slice` רץ אחרי Phase 5
‏- [ ] grep מאשר אפס שימושים ב-`_configSchemaVersion`, `appConfig.gameSettings`, `state.dirtyConfig`
‏- [ ] ‏`apps/find-letter-game` — `bun run --filter find-letter-game check` עדיין עובר (כי ה-API מבחינת call-sites לא השתנה)

---

## 11. הערות סופיות

‏- ‏אישור-קומיטים: **אוטונומי**. אל תעצור אחרי כל קומיט — קמט רציף לפי הסדר. רק עצור ב-(א) verifier-phase דורש תיקון, או (ב) אתה רואה משהו שמסכן את ההמשך ולא מתואם עם ה-spec.
‏- ‏הודעות עברית: `(scope): כותרת` בעברית. שורות גוף — אנגלית מותר.
‏- ‏`git add` סלקטיבי, פקודות git בנפרד (לא `&&`).
‏- אם נתקלת בבעיה לא צפויה — **תעצור ותדווח**. אל תפרסם תיקון "יצירתי" שלא תואם ל-spec.
‏- ‏סקילים לטעון: `commit`, `update-walkthrough`, `Svelte-MCP` (אם נדרש), `tdd`.
