/**
 * הגדרות משחק עם שמירה ב-localStorage
 */

import { DEFAULT_LETTER_IDS } from '../utils/letters';
import { migrateSettings } from './settings-migration';

const STORAGE_KEY = 'find-letter-game-settings';
const CURRENT_VERSION = 3;

export type GridSize = '2x3' | '3x3' | '3x4' | '4x4';

export interface FindLetterSettings {
	gridSize: GridSize;
	autoSpeakOnNewRound: boolean;
	voiceEnabled: boolean;
	/** האם להפעיל את מנגנון ה-Booster (חיזוקים אחרי N הצלחות) */
	boosterEnabled: boolean;
	/** מזהי האותיות הנבחרות להצגה בלוח */
	selectedLetterIds: string[];
	/** האם להימנע משני כרטיסים "דומים" באותו לוח (לפי SIMILARITY_PAIRS) */
	avoidSimilar: boolean;
	/** משך עונש מילישניות אחרי לחיצה שגויה — בזמן הזה הלוח נעול */
	cooldownMs: number;
	/**
	 * כמה שאלות לשאול בכל לוח (לפני שמוחלף).
	 * 0 = לשאול על כל הכרטיסים שעל הלוח (לפי gridSize).
	 */
	questionsPerBoard: number;
	/**
	 * כמה לוחות יש בסבב לפני שניתן פרס (turn = סבב).
	 * סך התשובות הנכונות לפרס: `boardsPerSet * questionsPerBoard`
	 * (אם questionsPerBoard=0 — sizeOfGrid במקום).
	 */
	boardsPerSet: number;
}

export const DEFAULT_SETTINGS: FindLetterSettings = {
	gridSize: '3x4',
	autoSpeakOnNewRound: true,
	voiceEnabled: true,
	boosterEnabled: true,
	selectedLetterIds: [...DEFAULT_LETTER_IDS],
	avoidSimilar: true,
	cooldownMs: 2000,
	questionsPerBoard: 0, // 0 = כל הכרטיסים בלוח
	boardsPerSet: 1
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
	selectedLetterIds = $state<string[]>([...DEFAULT_SETTINGS.selectedLetterIds]);
	avoidSimilar = $state(DEFAULT_SETTINGS.avoidSimilar);
	cooldownMs = $state(DEFAULT_SETTINGS.cooldownMs);
	questionsPerBoard = $state(DEFAULT_SETTINGS.questionsPerBoard);
	boardsPerSet = $state(DEFAULT_SETTINGS.boardsPerSet);

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
			// migrateSettings מטפל גם ב-v2 (activeGroups) וגם ב-v3 (selectedLetterIds)
			const parsed = migrateSettings(JSON.parse(saved));
			this.gridSize = parsed.gridSize ?? DEFAULT_SETTINGS.gridSize;
			this.autoSpeakOnNewRound =
				parsed.autoSpeakOnNewRound ?? DEFAULT_SETTINGS.autoSpeakOnNewRound;
			this.voiceEnabled = parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
			this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
			this.selectedLetterIds = Array.isArray(parsed.selectedLetterIds)
				? parsed.selectedLetterIds
				: [...DEFAULT_SETTINGS.selectedLetterIds];
			this.avoidSimilar = parsed.avoidSimilar ?? DEFAULT_SETTINGS.avoidSimilar;
			this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
			this.questionsPerBoard =
				parsed.questionsPerBoard ?? DEFAULT_SETTINGS.questionsPerBoard;
			this.boardsPerSet = parsed.boardsPerSet ?? DEFAULT_SETTINGS.boardsPerSet;
		} catch (e) {
			console.error('שגיאה בטעינת הגדרות משחק', e);
		}
	}

	toJSON(): FindLetterSettings & { schemaVersion: number } {
		return {
			schemaVersion: CURRENT_VERSION,
			gridSize: this.gridSize,
			autoSpeakOnNewRound: this.autoSpeakOnNewRound,
			voiceEnabled: this.voiceEnabled,
			boosterEnabled: this.boosterEnabled,
			selectedLetterIds: [...this.selectedLetterIds],
			avoidSimilar: this.avoidSimilar,
			cooldownMs: this.cooldownMs,
			questionsPerBoard: this.questionsPerBoard,
			boardsPerSet: this.boardsPerSet
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
		this.selectedLetterIds = [...DEFAULT_SETTINGS.selectedLetterIds];
		this.avoidSimilar = DEFAULT_SETTINGS.avoidSimilar;
		this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
		this.questionsPerBoard = DEFAULT_SETTINGS.questionsPerBoard;
		this.boardsPerSet = DEFAULT_SETTINGS.boardsPerSet;
	}

	/** סך התאים על הלוח (לפי gridSize) — לדוגמה 3x4 = 12. */
	get totalCellsInGrid(): number {
		return gridCellCount(this.gridSize);
	}

	/**
	 * מחשב את מספר השאלות בלוח הנוכחי לפי ההגדרה.
	 * 0 = כל הכרטיסים.
	 */
	get effectiveQuestionsPerBoard(): number {
		const total = this.totalCellsInGrid;
		const requested = this.questionsPerBoard;
		if (!requested || requested <= 0) return total;
		return Math.min(requested, total);
	}

	/** סך התשובות הנכונות הנדרשות לסבב שלם (לפני פרס). */
	get totalQuestionsPerSet(): number {
		return this.effectiveQuestionsPerBoard * Math.max(1, this.boardsPerSet);
	}
}

export const settings = new SettingsStore();
