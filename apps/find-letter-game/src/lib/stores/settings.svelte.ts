/**
 * הגדרות משחק עם שמירה ב-localStorage
 */

import type { LetterGroup } from '../utils/letters';

const STORAGE_KEY = 'find-letter-game-settings';
const CURRENT_VERSION = 2;

export type GridSize = '2x3' | '3x3' | '3x4' | '4x4';

export interface FindLetterSettings {
	gridSize: GridSize;
	autoSpeakOnNewRound: boolean;
	voiceEnabled: boolean;
	/** האם להפעיל את מנגנון ה-Booster (חיזוקים אחרי N הצלחות) */
	boosterEnabled: boolean;
	/** קבוצות אותיות פעילות (מקור הכרטיסים ללוח) */
	activeGroups: LetterGroup[];
	/** האם להימנע משני כרטיסים "דומים" באותו לוח (לפי SIMILARITY_PAIRS) */
	avoidSimilar: boolean;
	/** משך עונש מילישניות אחרי לחיצה שגויה — בזמן הזה הלוח נעול */
	cooldownMs: number;
}

export const DEFAULT_SETTINGS: FindLetterSettings = {
	gridSize: '3x4',
	autoSpeakOnNewRound: true,
	voiceEnabled: true,
	boosterEnabled: true,
	activeGroups: ['base', 'confusing', 'rafe'],
	avoidSimilar: true,
	cooldownMs: 2000
};

/**
 * פירוק גודל לוח לשורות ועמודות.
 * הפורמט: 'ROWSxCOLS' — לדוגמה '3x4' = 3 שורות, 4 עמודות.
 */
export function gridDims(size: GridSize): { rows: number; cols: number } {
	const [rows, cols] = size.split('x').map(Number);
	return { rows, cols };
}

/**
 * חישוב מספר התאים לפי גודל הלוח
 */
export function gridCellCount(size: GridSize): number {
	const { rows, cols } = gridDims(size);
	return rows * cols;
}

/**
 * חישוב מספר עמודות (לשימוש בגריד CSS)
 */
export function gridColumns(size: GridSize): number {
	return gridDims(size).cols;
}

/**
 * חישוב מספר שורות (לשימוש בגריד CSS)
 */
export function gridRows(size: GridSize): number {
	return gridDims(size).rows;
}

class SettingsStore {
	gridSize = $state<GridSize>(DEFAULT_SETTINGS.gridSize);
	autoSpeakOnNewRound = $state(DEFAULT_SETTINGS.autoSpeakOnNewRound);
	voiceEnabled = $state(DEFAULT_SETTINGS.voiceEnabled);
	boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);
	activeGroups = $state<LetterGroup[]>([...DEFAULT_SETTINGS.activeGroups]);
	avoidSimilar = $state(DEFAULT_SETTINGS.avoidSimilar);
	cooldownMs = $state(DEFAULT_SETTINGS.cooldownMs);

	constructor() {
		// טעינה רק בצד הדפדפן (window אמיתי, לא ב-SSR)
		if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
			this.load();
		}

		// שמירה אוטומטית בכל שינוי
		$effect.root(() => {
			$effect(() => {
				this.toJSON();
				this.save();
			});
		});
	}

	private load(): void {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY);
			if (!saved) return;
			const parsed = JSON.parse(saved);
			this.gridSize = parsed.gridSize ?? DEFAULT_SETTINGS.gridSize;
			this.autoSpeakOnNewRound =
				parsed.autoSpeakOnNewRound ?? DEFAULT_SETTINGS.autoSpeakOnNewRound;
			this.voiceEnabled = parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
			this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
			this.activeGroups = Array.isArray(parsed.activeGroups)
				? parsed.activeGroups
				: [...DEFAULT_SETTINGS.activeGroups];
			this.avoidSimilar = parsed.avoidSimilar ?? DEFAULT_SETTINGS.avoidSimilar;
			this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
		} catch (e) {
			console.error('Failed to parse find-letter-game settings', e);
		}
	}

	toJSON(): FindLetterSettings & { schemaVersion: number } {
		return {
			schemaVersion: CURRENT_VERSION,
			gridSize: this.gridSize,
			autoSpeakOnNewRound: this.autoSpeakOnNewRound,
			voiceEnabled: this.voiceEnabled,
			boosterEnabled: this.boosterEnabled,
			activeGroups: [...this.activeGroups],
			avoidSimilar: this.avoidSimilar,
			cooldownMs: this.cooldownMs
		};
	}

	private save(): void {
		if (typeof window?.localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
	}

	reset(): void {
		this.gridSize = DEFAULT_SETTINGS.gridSize;
		this.autoSpeakOnNewRound = DEFAULT_SETTINGS.autoSpeakOnNewRound;
		this.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
		this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
		this.activeGroups = [...DEFAULT_SETTINGS.activeGroups];
		this.avoidSimilar = DEFAULT_SETTINGS.avoidSimilar;
		this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
	}
}

export const settings = new SettingsStore();
