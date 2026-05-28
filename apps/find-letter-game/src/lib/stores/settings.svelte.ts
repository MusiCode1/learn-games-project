// apps/find-letter-game/src/lib/stores/settings.svelte.ts

import { configManager } from 'learn-booster-kit';
import { DEFAULT_LETTER_IDS } from '../utils/letters';
import type { VowelCode } from '../data/vowels';
import { migrateSettings } from './settings-migration';

const LEGACY_KEY = 'find-letter-game-settings';
const PROFILES_KEY = 'learn-booster-profiles:v1';
const GAME_ID = 'find-letter-game';

// Detailed tracing — להפעיל ידנית בעת דיבוג
const TRACE = false;
const log = (msg: string, data?: unknown) => {
	if (!TRACE) return;
	const ts = new Date().toISOString().slice(11, 23);
	if (data !== undefined) console.log(`%c[settings ${ts}] ${msg}`, 'color:#0891b2', data);
	else console.log(`%c[settings ${ts}] ${msg}`, 'color:#0891b2');
};

export type GridSize = '2x3' | '3x3' | '3x4' | '4x4';

// =============================================================
// Single source of truth — defaults factory; type derived from it
// =============================================================
function makeDefaults() {
	return {
		schemaVersion: 5 as number,
		gridSize: '3x4' as GridSize,
		autoSpeakOnNewRound: true,
		voiceEnabled: true,
		boosterEnabled: true,
		selectedLetterIds: [...DEFAULT_LETTER_IDS] as string[],
		selectedVowels: ['patah'] as VowelCode[],
		avoidSimilar: true,
		cooldownMs: 2000,
		questionsPerBoard: 0,
		boardsPerSet: 1,
	};
}

export type FindLetterSettings = ReturnType<typeof makeDefaults>;
const DATA_KEYS = Object.keys(makeDefaults()) as (keyof FindLetterSettings)[];

// =============================================================
// Pure helpers
// =============================================================
export function gridDims(size: GridSize) {
	const [rows, cols] = size.split('x').map(Number);
	return { rows, cols };
}
export function gridCellCount(size: GridSize) {
	const { rows, cols } = gridDims(size);
	return rows * cols;
}
export function gridColumns(size: GridSize) {
	return gridDims(size).cols;
}
export function gridRows(size: GridSize) {
	return gridDims(size).rows;
}

// =============================================================
// The reactive store — data + reactive derivations (NO toJSON method!)
// toJSON על $state object literal לא נקלט נכון ב-$state.snapshot —
// גורם ל-state_snapshot_uncloneable וה-snap המוחזר עם הfunction פנימה
// גורם ל-DataCloneError ב-cloneConfig של הקיט (structuredClone). במקום
// זאת — helper dataSnapshot() למטה.
// =============================================================
export const settings = $state({
	...makeDefaults(),

	// Reactive derivations — accessible as settings.x
	get totalCellsInGrid(): number {
		return gridCellCount(this.gridSize);
	},
	get effectiveQuestionsPerBoard(): number {
		const total = this.totalCellsInGrid;
		const r = this.questionsPerBoard;
		return !r || r <= 0 ? total : Math.min(r, total);
	},
	get totalQuestionsPerSet(): number {
		return this.effectiveQuestionsPerBoard * Math.max(1, this.boardsPerSet);
	},
});

/**
 * בונה plain object מ-DATA_KEYS — בלי proxies, בלי getters, בלי methods.
 * בטוח להעבר ל-structuredClone (שמשמש את הקיט ב-cloneConfig).
 * הקריאה ל-settings[k] מסומנת כתלות ב-$effect — לכן השימוש בתוך $effect
 * עוקב נכון אחר שינויים בכל השדות.
 *
 * חשוף `export` כדי לאפשר טסט רגרסיה — אסור שיחזור tojson method על
 * ה-$state object או להשתמש ב-$state.snapshot (שני אלה דרכים מוכרות
 * לשבור את structuredClone ב-cloneConfig).
 */
export function dataSnapshot(): FindLetterSettings {
	const out: Record<string, unknown> = {};
	for (const k of DATA_KEYS) {
		const v = settings[k];
		// Deep-copy arrays כדי לפרק את ה-$state proxy
		out[k] = Array.isArray(v) ? [...v] : v;
	}
	return out as FindLetterSettings;
}

export function resetSettings(): void {
	Object.assign(settings, makeDefaults());
}

// Backwards-compat — קוד legacy אולי מייבא את זה
export const DEFAULT_SETTINGS = makeDefaults();

/**
 * Fast-path: קריאה ישירה מ-localStorage של הפרופיל הפעיל בלי לחכות
 * ל-`boosterService.init()` (איטי בגלל טעינת videos מ-Google Drive).
 *
 * ⚠️ Coupling: יודע את ה-storage format של profile-manager
 * (`learn-booster-profiles:v1`). אם הקיט יחליף format, צריך לעדכן.
 * זה pragmatic — fallback בטוח לקריאה איטית דרך configManager.
 */
function readActiveProfileGameSettings(): FindLetterSettings | undefined {
	if (typeof window === 'undefined') {
		log('fast-path: SSR (no window) — skip');
		return undefined;
	}
	try {
		const raw = window.localStorage.getItem(PROFILES_KEY);
		if (!raw) {
			log(`fast-path: no '${PROFILES_KEY}' key in localStorage`);
			return undefined;
		}
		const data = JSON.parse(raw) as {
			activeProfileId?: string;
			profiles?: Record<string, { config?: { gameSettings?: Record<string, unknown> } }>;
		};
		const activeId = data?.activeProfileId;
		if (!activeId) {
			log('fast-path: no activeProfileId in profiles data', data);
			return undefined;
		}
		const profile = data?.profiles?.[activeId];
		if (!profile) {
			log(`fast-path: profile '${activeId}' not found`, data);
			return undefined;
		}
		const gameSettings = profile?.config?.gameSettings?.[GAME_ID] as
			| FindLetterSettings
			| undefined;
		if (!gameSettings) {
			log(`fast-path: profile '${activeId}' has no gameSettings.${GAME_ID}`, {
				profileKeys: Object.keys(profile?.config ?? {}),
				gameSettingsKeys: Object.keys(profile?.config?.gameSettings ?? {}),
			});
			return undefined;
		}
		log(`fast-path: loaded gameSettings from profile '${activeId}'`, gameSettings);
		return gameSettings;
	} catch (e) {
		console.warn('[find-letter] fast-path profile load failed', e);
		return undefined;
	}
}

// =============================================================
// Sync with configManager (browser-only)
// =============================================================
if (typeof window !== 'undefined') {
	log('module init — running browser side-effects');
	let lastSyncedJson = '';

	// 1. Legacy migration (one-time)
	try {
		const legacy = window.localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			log(`legacy: found '${LEGACY_KEY}' — migrating`, JSON.parse(legacy));
			Object.assign(settings, migrateSettings(JSON.parse(legacy)));
			window.localStorage.removeItem(LEGACY_KEY);
			log('legacy: applied + removed legacy key');
		} else {
			log(`legacy: no '${LEGACY_KEY}' — skipping migration`);
		}
	} catch (e) {
		console.error('[find-letter] legacy migration failed', e);
	}

	// 2. Fast-path: קריאה ישירה מ-localStorage לפני boosterService.init
	const saved = readActiveProfileGameSettings();
	if (saved) {
		Object.assign(settings, saved);
		lastSyncedJson = JSON.stringify(saved);
		log('fast-path: applied to $state', { gridSize: settings.gridSize, lastSyncedJson });
	} else {
		log('fast-path: no saved settings, settings = defaults', {
			gridSize: settings.gridSize,
		});
	}

	$effect.root(() => {
		log('$effect.root: starting');

		// 3. local change → configManager
		$effect(() => {
			const snap = dataSnapshot();
			const json = JSON.stringify(snap);
			if (json === lastSyncedJson) {
				log('$effect: skip (json matches lastSyncedJson)');
				return;
			}
			log('$effect: writing to configManager', { snap, prev: lastSyncedJson.slice(0, 60) });
			lastSyncedJson = json;
			void configManager.updateGameSettings(GAME_ID, snap);
		});

		// 4. configManager → local (profile switch / late init)
		// ה-kit מודיע מספר פעמים במהלך init:
		// (א) sync initial — s=undefined לפני init
		// (ב) loadConfigFromStorage — s מ-`learn-booster-config` (cache, עלול להיות STALE)
		// (ג) appConfig=activeProfile.config — s מהפרופיל (source of truth)
		//
		// אנחנו רוצים רק את (ג). הקריטריון: רק להחיל ערך שתואם את
		// `learn-booster-profiles:v1` באותו רגע. הקאש (learn-booster-config)
		// יכול להיות stale (מכתיבות $effect שרצו לפני שהקיט אותחל
		// בריצות קודמות) — נתעלם ממנו.
		log('subscribe: registering callback (will fire synchronously now)');
		return configManager.subscribeGameSettings<FindLetterSettings>(GAME_ID, (s) => {
			if (s) {
				const json = JSON.stringify(s);
				if (json === lastSyncedJson) {
					log('subscribe: skip (matches lastSyncedJson)', { gridSize: s.gridSize });
					return;
				}

				// אם מה שיש לנו כבר תואם לפרופיל — והערך הנכנס לא תואם —
				// סביר ש-s הוא stale מ-learn-booster-config. התעלם.
				const profileNow = readActiveProfileGameSettings();
				const profileJson = profileNow ? JSON.stringify(profileNow) : '';
				if (lastSyncedJson === profileJson && json !== profileJson) {
					log('subscribe: IGNORE intermediate (we have profile, kit sent stale)', {
						kitValue_questionsPerBoard: s.questionsPerBoard,
						profile_questionsPerBoard: profileNow?.questionsPerBoard,
					});
					return;
				}

				log('subscribe: applying to $state', {
					new_questionsPerBoard: s.questionsPerBoard,
					prev_questionsPerBoard: settings.questionsPerBoard,
				});
				Object.assign(settings, s);
				lastSyncedJson = json;
			} else if (lastSyncedJson === '') {
				lastSyncedJson = JSON.stringify(dataSnapshot());
				log('subscribe: callback s=undefined, init baseline lastSyncedJson');
			} else {
				log('subscribe: callback s=undefined — no-op (baseline already set)');
			}
		});
	});
}
