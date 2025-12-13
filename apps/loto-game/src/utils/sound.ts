// Simple sound synthesizer using Web Audio API

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
};

export const playSuccess = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Create oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Nice major arpeggio (C5, E5, G5, C6)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
    } catch (e) {
        console.error('Audio play failed', e);
    }
};

export const playError = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Low buzzing sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);

        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.error('Audio play failed', e);
    }
};
export const playWin = () => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Fanfare melody: C4, E4, G4, C5, G4, C5
        osc.type = 'triangle';

        // Note 1: C4
        osc.frequency.setValueAtTime(261.63, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.setValueAtTime(0.5, now + 0.15);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);

        // Note 2: E4
        osc.frequency.setValueAtTime(329.63, now + 0.2);
        gain.gain.setValueAtTime(0, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
        gain.gain.setValueAtTime(0.5, now + 0.35);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);

        // Note 3: G4
        osc.frequency.setValueAtTime(392.00, now + 0.4);
        gain.gain.setValueAtTime(0, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.45);
        gain.gain.setValueAtTime(0.5, now + 0.55);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);

        // Note 4: C5 (Longer)
        osc.frequency.setValueAtTime(523.25, now + 0.6);
        gain.gain.setValueAtTime(0, now + 0.6);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.65);
        gain.gain.setValueAtTime(0.6, now + 1.2);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);

    } catch (e) {
        console.error('Audio play failed', e);
    }
};
