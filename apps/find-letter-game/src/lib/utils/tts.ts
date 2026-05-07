/**
 * שירות TTS — מתחבר ל-aac-proxy (Gemini) עם cache ב-IndexedDB,
 * ועם fallback ל-Web Speech API במקרה של כישלון.
 *
 * ה-proxy: https://aac-proxy.aybritman.workers.dev
 *   POST /v1/tts        — בקשת סינתזה, מחזיר { hash, mimeType, cached }
 *   GET  /v1/tts/:hash  — הורדת ה-blob
 *
 * הפלואו זהה לזה של AAC Board: hash דטרמיניסטי על
 * provider|voiceId|modelId|text.trim().normalize('NFC') (16 hex).
 */

import { get, set, createStore } from 'idb-keyval';
import { ttsSettings } from '../stores/tts-settings.svelte';

// ===== הגדרות קבועות =====

// ה-provider/voice/model נשלפים מה-store (ניתנים לשינוי דרך מסך ההגדרות).
// ערכי ברירת מחדל: elevenlabs / Sarah / eleven_v3.
const LANG = 'he-IL';
const CACHE_PREFIX = 'audio:';

interface TtsRequest {
	text: string;
	provider: 'elevenlabs' | 'gemini';
	voiceId: string;
	modelId: string;
	lang?: string;
}

// ===== Cache (IndexedDB) =====

let _store: ReturnType<typeof createStore> | undefined;
function getStore() {
	if (!_store) _store = createStore('find-letter-tts-cache', 'keyval');
	return _store;
}

function getProxyUrl(): string {
	return import.meta.env?.VITE_PROXY_URL || '';
}

// ===== Hash דטרמיניסטי (זהה ל-aac-board) =====

async function ttsHash(req: TtsRequest): Promise<string> {
	const normalized = [
		req.provider,
		req.voiceId,
		req.modelId,
		req.text.trim().normalize('NFC')
	].join('|');
	const buf = new TextEncoder().encode(normalized);
	const digest = await crypto.subtle.digest('SHA-256', buf);
	return Array.from(new Uint8Array(digest))
		.slice(0, 8)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ===== שליפת/יצירת אודיו דרך ה-proxy =====

async function getOrCreateAudio(req: TtsRequest): Promise<Blob> {
	const proxyUrl = getProxyUrl();
	if (!proxyUrl) throw new Error('VITE_PROXY_URL is not configured');

	const store = getStore();
	const hash = await ttsHash(req);
	const cacheKey = CACHE_PREFIX + hash;

	// L1 hit מתוך IndexedDB
	const cached = await get<Blob>(cacheKey, store);
	if (cached) return cached;

	// L1 miss — בקשת סינתזה מהפרוקסי
	const postRes = await fetch(`${proxyUrl}/v1/tts`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(req)
	});
	if (!postRes.ok) {
		const text = await postRes.text().catch(() => '');
		throw new Error(`Proxy POST failed ${postRes.status}: ${text}`);
	}
	await postRes.json();

	// הורדת ה-blob
	const getRes = await fetch(`${proxyUrl}/v1/tts/${hash}`);
	if (!getRes.ok) {
		const text = await getRes.text().catch(() => '');
		throw new Error(`Proxy GET ${hash} failed ${getRes.status}: ${text}`);
	}
	const blob = await getRes.blob();

	// שמירה ב-cache לפעמים הבאות
	await set(cacheKey, blob, store);

	return blob;
}

// ===== ניגון =====

let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio(): void {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio = null;
	}
}

async function playAudioBlob(blob: Blob): Promise<void> {
	stopCurrentAudio();
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	currentAudio = audio;

	return new Promise<void>((resolve) => {
		const cleanup = () => {
			URL.revokeObjectURL(url);
			if (currentAudio === audio) currentAudio = null;
			resolve();
		};
		audio.onended = cleanup;
		audio.onerror = cleanup;
		audio.play().catch(cleanup);
	});
}

// ===== Web Speech fallback =====

/**
 * Fully Kiosk חושף `window.fully.textToSpeech` — מסוג מוגדר ע"י החבילה
 * `fully-kiosk-js` (transitive dep של learn-booster-kit). אין צורך להצהיר כאן.
 */

function speakWebSpeech(text: string): void {
	// Fully Kiosk מקבל עדיפות
	if (typeof window !== 'undefined' && (window as { fully?: { textToSpeech: (t: string) => void } }).fully) {
		(window as { fully: { textToSpeech: (t: string) => void } }).fully.textToSpeech(text);
		return;
	}
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.lang = LANG;
	u.rate = 0.85;
	u.pitch = 1.05;
	window.speechSynthesis.speak(u);
}

// ===== API ציבורי =====

/**
 * השמעת טקסט בעברית: מנסה את ה-provider שנבחר דרך ה-proxy, ובכישלון נופל
 * ל-Web Speech API של הדפדפן.
 */
export async function speak(text: string): Promise<void> {
	if (typeof window === 'undefined') return;

	const trimmed = text.trim();
	if (!trimmed) return;

	try {
		const blob = await getOrCreateAudio({
			text: trimmed,
			provider: ttsSettings.provider,
			voiceId: ttsSettings.voiceId,
			modelId: ttsSettings.modelId,
			lang: LANG
		});
		await playAudioBlob(blob);
	} catch (e) {
		console.warn('[tts] proxy failed — falling back to Web Speech', e);
		speakWebSpeech(trimmed);
	}
}

/**
 * האם TTS נתמך בכלל (יש או proxy או Web Speech)
 */
export function ttsSupported(): boolean {
	if (typeof window === 'undefined') return false;
	return Boolean(getProxyUrl()) || 'speechSynthesis' in window;
}
