/**
 * שליפת רשימת קולות מהפרוקסי aac-proxy.
 * הפרוקסי חושף `GET /v1/voices/:provider` שמחזיר { voices: [{ id, name }] }.
 */

import type { TtsProviderId } from '../stores/tts-settings.svelte';

export interface Voice {
	id: string;
	name: string;
	lang?: string;
}

const cache = new Map<TtsProviderId, Voice[]>();

function getProxyUrl(): string {
	return import.meta.env?.VITE_PROXY_URL || '';
}

/**
 * מחזיר את רשימת הקולות הזמינים ל-provider.
 * תוצאה ראשונה נשמרת בזיכרון לכל סשן.
 */
export async function fetchVoices(provider: TtsProviderId): Promise<Voice[]> {
	const cached = cache.get(provider);
	if (cached) return cached;

	const proxyUrl = getProxyUrl();
	if (!proxyUrl) return [];

	try {
		const res = await fetch(`${proxyUrl}/v1/voices/${provider}`);
		if (!res.ok) return [];
		const data = (await res.json()) as { voices: Voice[] };
		const voices = data.voices ?? [];
		cache.set(provider, voices);
		return voices;
	} catch (e) {
		console.warn(`[voices] failed to fetch for ${provider}`, e);
		return [];
	}
}

/**
 * מודלים זמינים לכל ספק. כרגע מקודד-קשיח, כי הפרוקסי לא חושף endpoint
 * נפרד למודלים — הוא משתמש בערכי ברירת מחדל פנימיים.
 */
export const MODELS_BY_PROVIDER: Record<TtsProviderId, { id: string; label: string }[]> = {
	elevenlabs: [
		{ id: 'eleven_v3', label: 'Eleven v3 (איכות גבוהה)' },
		{ id: 'eleven_multilingual_v2', label: 'Multilingual v2' },
		{ id: 'eleven_turbo_v2_5', label: 'Turbo v2.5 (מהיר)' }
	],
	gemini: [
		{ id: 'gemini-3.1-flash-tts-preview', label: 'Gemini 3.1 Flash TTS' },
		{ id: 'gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro TTS' }
	]
};
