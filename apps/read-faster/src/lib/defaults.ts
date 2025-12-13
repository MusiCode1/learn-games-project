import type { SessionState, UIState } from '$lib/types';

export const defaultSession: SessionState = {
    words: [],
    currentIndex: 0,
    wordsPerRepetition: 0,
    totalRepetitions: 0
};

export const defaultUIState: UIState = {
    isWordVisible: false,
    isImageVisible: false,
    direction: null,
    lastDirection: 'next'
};