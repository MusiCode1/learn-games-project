import successSound from '$lib/assets/sounds/success.mp3';
import errorSound from '$lib/assets/sounds/error.wav';
import winSound from '$lib/assets/sounds/win.mp3';
import cardFlipSound from '$lib/assets/sounds/card_flip.mp3';

type SoundType = 'success' | 'error' | 'win' | 'flip';

const sounds: Record<SoundType, HTMLAudioElement | null> = {
	success: null,
	error: null,
	win: null,
	flip: null
};

if (typeof window !== 'undefined') {
	sounds.success = new Audio(successSound);
	sounds.error = new Audio(errorSound);
	sounds.win = new Audio(winSound);
	sounds.flip = new Audio(cardFlipSound);
}

const play = (type: SoundType) => {
	const audio = sounds[type];
	if (audio) {
		audio.currentTime = 0;
		audio.play().catch((e) => console.warn(`Failed to play ${type} sound`, e));
	}
};

export const playSuccess = () => play('success');
export const playError = () => play('error');
export const playWin = () => play('win');
export const playCardFlip = () => play('flip');

export const speakLetter = (letter: string) => {
	if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
		window.speechSynthesis.cancel(); // Cancel potential previous utterances
		const utterance = new SpeechSynthesisUtterance(letter);
		utterance.lang = 'he-IL';
		window.speechSynthesis.speak(utterance);
	}
};
