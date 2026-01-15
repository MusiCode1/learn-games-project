import { browser } from '$app/environment';
import { contentRegistry } from '$lib/content';

const STORAGE_KEY = 'lotto-game-settings';
const CURRENT_VERSION = 2; // גרסה 2 - מודולרי

export const DEFAULT_SETTINGS = {
	schemaVersion: CURRENT_VERSION,
	// הגדרות משחק
	pairCount: 10,
	
	// הגדרות תוכן - מודולרי
	contentProviderId: 'letters',
	contentSettings: {} as Record<string, unknown>,

	// הגדרות לולאה
	loopMode: 'finite' as 'finite' | 'infinite',
	totalRounds: 1,

	// הגדרות מחזק
	boosterEnabled: true,
	autoBooster: true,

	// הגדרות משחקיות
	enableDeselect: true,
	hideMatchedCards: false
};

export type LottoSettings = typeof DEFAULT_SETTINGS;

class SettingsStore {
	pairCount = $state(DEFAULT_SETTINGS.pairCount);
	contentProviderId = $state(DEFAULT_SETTINGS.contentProviderId);
	contentSettings = $state<Record<string, unknown>>({});
	loopMode = $state<'finite' | 'infinite'>(DEFAULT_SETTINGS.loopMode);
	totalRounds = $state(DEFAULT_SETTINGS.totalRounds);
	boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);
	autoBooster = $state(DEFAULT_SETTINGS.autoBooster);
	enableDeselect = $state(DEFAULT_SETTINGS.enableDeselect);
	hideMatchedCards = $state(DEFAULT_SETTINGS.hideMatchedCards);

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

	/**
	 * שליפת ההגדרות הספציפיות ל-provider הנוכחי
	 */
	getCurrentProviderSettings<T = unknown>(): T {
		const provider = contentRegistry.get(this.contentProviderId);
		const defaults = provider.getDefaultSettings() as Record<string, unknown>;
		
		// מיזוג ההגדרות השמורות עם ברירות המחדל
		return { ...defaults, ...this.contentSettings } as T;
	}

	/**
	 * עדכון הגדרות ה-provider הנוכחי
	 */
	updateProviderSettings(settings: Record<string, unknown>) {
		this.contentSettings = { ...this.contentSettings, ...settings };
	}

	/**
	 * החלפת provider
	 */
	setProvider(providerId: string) {
		if (this.contentProviderId !== providerId) {
			this.contentProviderId = providerId;
			// טעינת ההגדרות השמורות או ברירת מחדל
			const provider = contentRegistry.get(providerId);
			this.contentSettings = this.contentSettings[providerId] 
				? (this.contentSettings[providerId] as Record<string, unknown>)
				: (provider.getDefaultSettings() as Record<string, unknown>);
		}
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
		} else {
			// אם אין הגדרות שמורות, טען ברירות מחדל מה-provider
			const provider = contentRegistry.get(this.contentProviderId);
			this.contentSettings = provider.getDefaultSettings() as Record<string, unknown>;
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
			contentProviderId: this.contentProviderId,
			contentSettings: this.contentSettings,
			loopMode: this.loopMode,
			totalRounds: this.totalRounds,
			boosterEnabled: this.boosterEnabled,
			autoBooster: this.autoBooster,
			enableDeselect: this.enableDeselect,
			hideMatchedCards: this.hideMatchedCards
		};
	}

	private migrate(parsed: any) {
		const version = parsed.schemaVersion ?? 0;

		if (version === 0 || version === 1) {
			// מיגרציה מגרסה ישנה (contentType, selectedLetters, selectedShapes)
			this.migrateFromV1(parsed);
		} else {
			// גרסה 2 - מבנה חדש
			this.pairCount = parsed.pairCount ?? DEFAULT_SETTINGS.pairCount;
			this.contentProviderId = parsed.contentProviderId ?? DEFAULT_SETTINGS.contentProviderId;
			this.contentSettings = parsed.contentSettings ?? {};
			this.loopMode = parsed.loopMode ?? DEFAULT_SETTINGS.loopMode;
			this.totalRounds = parsed.totalRounds ?? DEFAULT_SETTINGS.totalRounds;
			this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
			this.autoBooster = parsed.autoBooster ?? DEFAULT_SETTINGS.autoBooster;
			this.enableDeselect = parsed.enableDeselect ?? DEFAULT_SETTINGS.enableDeselect;
			this.hideMatchedCards = parsed.hideMatchedCards ?? DEFAULT_SETTINGS.hideMatchedCards;
		}
	}

	private migrateFromV1(parsed: any) {
		// מיגרציה מהמבנה הישן
		this.pairCount = parsed.pairCount ?? DEFAULT_SETTINGS.pairCount;
		this.loopMode = parsed.loopMode ?? DEFAULT_SETTINGS.loopMode;
		this.totalRounds = parsed.totalRounds ?? DEFAULT_SETTINGS.totalRounds;
		this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
		this.autoBooster = parsed.autoBooster ?? DEFAULT_SETTINGS.autoBooster;
		this.enableDeselect = parsed.enableDeselect ?? DEFAULT_SETTINGS.enableDeselect;
		this.hideMatchedCards = parsed.hideMatchedCards ?? DEFAULT_SETTINGS.hideMatchedCards;

		// המרת contentType הישן ל-provider ID
		const oldContentType = parsed.contentType ?? 'letters';
		this.contentProviderId = oldContentType === 'letters' ? 'letters' : 'shapes';

		// המרת ההגדרות הישנות למבנה החדש
		if (oldContentType === 'letters') {
			this.contentSettings = {
				selectedLetters: parsed.selectedLetters ?? []
			};
		} else {
			this.contentSettings = {
				selectedShapes: parsed.selectedShapes ?? [],
				colorMode: parsed.colorMode ?? 'random'
			};
		}
	}

	reset() {
		const provider = contentRegistry.get(this.contentProviderId);
		this.pairCount = DEFAULT_SETTINGS.pairCount;
		this.contentSettings = provider.getDefaultSettings() as Record<string, unknown>;
		this.loopMode = DEFAULT_SETTINGS.loopMode;
		this.totalRounds = DEFAULT_SETTINGS.totalRounds;
		this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
		this.autoBooster = DEFAULT_SETTINGS.autoBooster;
		this.enableDeselect = DEFAULT_SETTINGS.enableDeselect;
		this.hideMatchedCards = DEFAULT_SETTINGS.hideMatchedCards;
	}
}

export const settings = new SettingsStore();
