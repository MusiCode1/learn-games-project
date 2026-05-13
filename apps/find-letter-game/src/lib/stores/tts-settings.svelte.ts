/**
 * הגדרות TTS — נשמרות ב-localStorage תחת `find-letter-tts-settings`.
 *
 * ה-providers הם בדיוק אלה שמופעלים בפרוקסי aac-proxy:
 *   - elevenlabs (איכות גבוהה, מומלץ)
 *   - gemini     (איכותי אבל מכסה חינם נמוכה)
 *
 * המשתמש יכול לבחור provider, voice, ו-model. ברירת המחדל היא
 * elevenlabs/Sarah/eleven_v3 (קול נשי בוגר ובהיר).
 */

const STORAGE_KEY = 'find-letter-tts-settings';

export type TtsProviderId = 'elevenlabs' | 'gemini';

export interface TtsSettings {
	provider: TtsProviderId;
	voiceId: string;
	modelId: string;
}

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
	provider: 'elevenlabs',
	voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
	modelId: 'eleven_v3'
};

/**
 * ברירות מחדל לכל provider, לשימוש כשהמשתמש מחליף ספק.
 */
export const PROVIDER_DEFAULTS: Record<TtsProviderId, { voiceId: string; modelId: string }> = {
	elevenlabs: { voiceId: 'EXAVITQu4vr4xnSDxMaL', modelId: 'eleven_v3' },
	gemini: { voiceId: 'Zephyr', modelId: 'gemini-3.1-flash-tts-preview' }
};

class TtsSettingsStore {
	provider = $state<TtsProviderId>(DEFAULT_TTS_SETTINGS.provider);
	voiceId = $state(DEFAULT_TTS_SETTINGS.voiceId);
	modelId = $state(DEFAULT_TTS_SETTINGS.modelId);

	constructor() {
		if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
			this.load();
		}
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
			const parsed = JSON.parse(saved) as Partial<TtsSettings>;
			if (parsed.provider) this.provider = parsed.provider;
			if (parsed.voiceId) this.voiceId = parsed.voiceId;
			if (parsed.modelId) this.modelId = parsed.modelId;
		} catch (e) {
			console.error('Failed to parse find-letter TTS settings', e);
		}
	}

	toJSON(): TtsSettings {
		return {
			provider: this.provider,
			voiceId: this.voiceId,
			modelId: this.modelId
		};
	}

	private save(): void {
		if (typeof window?.localStorage === 'undefined') return;
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
	}

	/**
	 * החלפת provider — מאפסת אוטומטית את ה-voice וה-model לברירות המחדל
	 * של ה-provider החדש כדי למנוע שילובים לא תקפים.
	 */
	setProvider(provider: TtsProviderId): void {
		this.provider = provider;
		const def = PROVIDER_DEFAULTS[provider];
		this.voiceId = def.voiceId;
		this.modelId = def.modelId;
	}

	reset(): void {
		this.provider = DEFAULT_TTS_SETTINGS.provider;
		this.voiceId = DEFAULT_TTS_SETTINGS.voiceId;
		this.modelId = DEFAULT_TTS_SETTINGS.modelId;
	}
}

export const ttsSettings = new TtsSettingsStore();
