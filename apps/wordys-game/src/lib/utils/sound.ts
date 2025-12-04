// Sound utility using Web Audio API and SpeechSynthesis

let audioContext: AudioContext | null = null;

function getContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
}

export function speak(text: string) {
    if (!('speechSynthesis' in window)) return;

    // Cancel previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL'; // Hebrew
    utterance.rate = 0.9; // Slightly slower for clarity

    window.speechSynthesis.speak(utterance);
}

export function playSuccess() {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Nice major chord arpeggio (C5 - E5 - G5)
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
}

export function playError() {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now); // Low buzz
    osc.frequency.linearRampToValueAtTime(100, now + 0.2);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
}
