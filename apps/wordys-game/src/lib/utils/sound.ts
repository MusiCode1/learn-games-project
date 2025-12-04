// Sound utility using Web Audio API and SpeechSynthesis

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
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.warn('Audio play failed (user interaction needed?):', e));
    } catch (e) {
        console.error('Error playing success sound:', e);
    }
}

export function playError() {
    try {
        const audio = new Audio('/sounds/error.wav');
        audio.volume = 0.3;
        audio.play().catch(e => console.warn('Audio play failed (user interaction needed?):', e));
    } catch (e) {
        console.error('Error playing error sound:', e);
    }
}
