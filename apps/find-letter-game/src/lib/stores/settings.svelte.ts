// apps/find-letter-game/src/lib/stores/settings.svelte.ts

import { configManager } from 'learn-booster-kit';
import { DEFAULT_LETTER_IDS } from '../utils/letters';
import { migrateSettings } from './settings-migration';

const LEGACY_KEY = 'find-letter-game-settings';
const GAME_ID = 'find-letter-game';

export type GridSize = '2x3' | '3x3' | '3x4' | '4x4';

// =============================================================
// Single source of truth — defaults factory; type derived from it
// =============================================================
function makeDefaults() {
	return {
		gridSize: '3x4' as GridSize,
		autoSpeakOnNewRound: true,
		voiceEnabled: true,
		boosterEnabled: true,
		selectedLetterIds: [...DEFAULT_LETTER_IDS] as string[],
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
// The reactive store — data + reactive derivations + toJSON filter
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

	// Filters snapshot — getters excluded, only data fields
	toJSON(): FindLetterSettings {
		const out = {} as FindLetterSettings;
		for (const k of DATA_KEYS) (out as Record<string, unknown>)[k] = this[k];
		return out;
	},
});

export function resetSettings(): void {
	Object.assign(settings, makeDefaults());
}

// Backwards-compat — קוד legacy אולי מייבא את זה
export const DEFAULT_SETTINGS = makeDefaults();

// =============================================================
// Sync with configManager (browser-only)
// =============================================================
if (typeof window !== 'undefined') {
	let lastSyncedJson = '';

	// 1. Legacy migration (one-time)
	try {
		const legacy = window.localStorage.getItem(LEGACY_KEY);
		if (legacy) {
			Object.assign(settings, migrateSettings(JSON.parse(legacy)));
			window.localStorage.removeItem(LEGACY_KEY);
		}
	} catch (e) {
		console.error('[find-letter] legacy migration failed', e);
	}

	// 2. Initial load from active profile
	const saved = configManager.getGameSettings<FindLetterSettings>(GAME_ID);
	if (saved) {
		Object.assign(settings, saved);
		lastSyncedJson = JSON.stringify(saved);
	}

	$effect.root(() => {
		// 3. local change → configManager
		$effect(() => {
			const snap = $state.snapshot(settings); // uses toJSON internally
			const json = JSON.stringify(snap);
			if (json === lastSyncedJson) return;
			lastSyncedJson = json;
			void configManager.updateGameSettings(GAME_ID, snap);
		});

		// 4. configManager → local (profile switch / late init)
		return configManager.subscribeGameSettings<FindLetterSettings>(GAME_ID, (s) => {
			if (!s) return;
			const json = JSON.stringify(s);
			if (json === lastSyncedJson) return;
			lastSyncedJson = json;
			Object.assign(settings, s);
		});
	});
}
