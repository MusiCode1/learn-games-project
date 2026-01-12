import { browser } from '$app/environment';
import { LETTERS, SHAPES, type ContentType, type ColorMode } from '$lib/utils/gameLogic';

const STORAGE_KEY = 'lotto-game-settings';
const CURRENT_VERSION = 1;

export const DEFAULT_SETTINGS = {
	schemaVersion: CURRENT_VERSION,
	// הגדרות משחק
	pairCount: 10,
	contentType: 'letters' as ContentType,
	selectedLetters: [...LETTERS],
	selectedShapes: SHAPES.map((s) => s.id),
	colorMode: 'random' as ColorMode,

	// הגדרות לולאה
	loopMode: 'finite' as 'finite' | 'infinite',
	totalRounds: 1,

	// הגדרות מחזק
	boosterEnabled: true,
	autoBooster: true,

	// הגדרות משחקיות
	enableDeselect: true
};

export type LottoSettings = typeof DEFAULT_SETTINGS;

class SettingsStore {
	pairCount = $state(DEFAULT_SETTINGS.pairCount);
	contentType = $state<ContentType>(DEFAULT_SETTINGS.contentType);
	selectedLetters = $state<string[]>([...DEFAULT_SETTINGS.selectedLetters]);
	selectedShapes = $state<string[]>([...DEFAULT_SETTINGS.selectedShapes]);
	colorMode = $state<ColorMode>(DEFAULT_SETTINGS.colorMode);
	loopMode = $state<'finite' | 'infinite'>(DEFAULT_SETTINGS.loopMode);
	totalRounds = $state(DEFAULT_SETTINGS.totalRounds);
	boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);
	autoBooster = $state(DEFAULT_SETTINGS.autoBooster);
	enableDeselect = $state(DEFAULT_SETTINGS.enableDeselect);

	constructor() {
		if (browser) {
			this.load();
		}

		$effect.root(() => {
			$effect(() => {
				this.toJSON(); // Track dependencies
				this.save();
			});
		});
	}

	private load() {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				this.migrate(parsed);
			} catch (e) {
				console.error('Failed to parse settings', e);
			}
		}
	}

	private save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
	}

	toJSON() {
		return {
			schemaVersion: CURRENT_VERSION,
			pairCount: this.pairCount,
			contentType: this.contentType,
			selectedLetters: this.selectedLetters,
			selectedShapes: this.selectedShapes,
			colorMode: this.colorMode,
			loopMode: this.loopMode,
			totalRounds: this.totalRounds,
			boosterEnabled: this.boosterEnabled,
			autoBooster: this.autoBooster,
			enableDeselect: this.enableDeselect
		};
	}

	private migrate(parsed: any) {
		const version = parsed.schemaVersion ?? 0;

		// עדכון שדות פשוטים
		this.pairCount = parsed.pairCount ?? DEFAULT_SETTINGS.pairCount;
		this.contentType = parsed.contentType ?? DEFAULT_SETTINGS.contentType;
		this.selectedLetters = parsed.selectedLetters ?? [...DEFAULT_SETTINGS.selectedLetters];
		this.selectedShapes = parsed.selectedShapes ?? [...DEFAULT_SETTINGS.selectedShapes];
		this.colorMode = parsed.colorMode ?? DEFAULT_SETTINGS.colorMode;
		this.loopMode = parsed.loopMode ?? DEFAULT_SETTINGS.loopMode;
		this.totalRounds = parsed.totalRounds ?? DEFAULT_SETTINGS.totalRounds;
		this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
		this.autoBooster = parsed.autoBooster ?? DEFAULT_SETTINGS.autoBooster;
		this.enableDeselect = parsed.enableDeselect ?? DEFAULT_SETTINGS.enableDeselect;
	}

	reset() {
		this.migrate(DEFAULT_SETTINGS);
	}
}

export const settings = new SettingsStore();
