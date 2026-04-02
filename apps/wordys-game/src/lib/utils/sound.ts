import { getAssetUrl } from '$lib/services/assets';

const HEBREW_LETTER_NAMES: Record<string, string> = {
	'א': 'אָלֶף', 'ב': 'בֵּית', 'ג': 'גִּימֶל', 'ד': 'דָּלֶת',
	'ה': 'הֵא', 'ו': 'וָו', 'ז': 'זַיִן', 'ח': 'חֵית',
	'ט': 'טֵית', 'י': 'יוֹד', 'כ': 'כָּף', 'ך': 'כָּף סוֹפִית',
	'ל': 'לָמֶד', 'מ': 'מֵם', 'ם': 'מֵם סוֹפִית',
	'נ': 'נוּן', 'ן': 'נוּן סוֹפִית', 'ס': 'סָמֶך',
	'ע': 'עַיִן', 'פ': 'פֵּא', 'ף': 'פֵּא סוֹפִית',
	'צ': 'צָדִי', 'ץ': 'צָדִי סוֹפִית', 'ק': 'קוֹף',
	'ר': 'רֵישׁ', 'ש': 'שִׁין', 'ת': 'תָּו',
};

/**
 * הקראת שם האות בעברית (אָלֶף, בֵּית...)
 */
export function speakLetter(char: string): void {
	const name = HEBREW_LETTER_NAMES[char] ?? char;
	speak(name, true);
}

export function speak(text: string, interrupt = true): Promise<void> {
	return new Promise((resolve) => {
		if (!('speechSynthesis' in window)) {
			resolve();
			return;
		}

		if (interrupt) {
			window.speechSynthesis.cancel();
		}

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'he-IL'; // Hebrew
		utterance.rate = 0.9; // Slightly slower for clarity

		utterance.onend = () => resolve();
		utterance.onerror = (e) => {
			console.warn('Speech synthesis error:', e);
			resolve();
		};

		window.speechSynthesis.speak(utterance);
	});
}

export function playSuccess() {
	try {
		// Here we rely on the centralized assets service which knows about available-assets.json
		// The path 'ui_sounds/success.mp3' is checked there.
		const url = getAssetUrl('ui_sounds/success.mp3');
		if (!url) {
			console.warn('Success sound not found in manifest');
			return;
		}

		const audio = new Audio(url);
		audio.volume = 0.5;
		audio.play().catch((e) => console.warn('Audio play failed (user interaction needed?):', e));
	} catch (e) {
		console.error('Error playing success sound:', e);
	}
}

export function playError() {
	try {
		const url = getAssetUrl('ui_sounds/error.wav');
		if (!url) {
			console.warn('Error sound not found in manifest');
			return;
		}

		const audio = new Audio(url);
		audio.volume = 0.3;
		audio.play().catch((e) => console.warn('Audio play failed (user interaction needed?):', e));
	} catch (e) {
		console.error('Error playing error sound:', e);
	}
}
export function playAudio(url: string): Promise<void> {
	return new Promise((resolve) => {
		try {
			const audio = new Audio(url);
			audio.volume = 1.0;

			audio.onended = () => resolve();
			audio.onerror = (e) => {
				console.warn('Audio playback failed:', e);
				resolve(); // Resolve anyway to not block flow
			};

			audio.play().catch((e) => {
				console.warn('Audio play failed (user interaction needed?):', e);
				resolve();
			});
		} catch (e) {
			console.error('Error in playAudio:', e);
			resolve();
		}
	});
}
