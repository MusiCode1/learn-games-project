export class SettingsStore {
    showWord = $state(true);
    errorFeedback = $state(true);
    highlightCurrentChar = $state(true);
    cardRepetitions = $state(2); // 0 = unlimited
    virtualKeyboardMode = $state<'none' | 'full' | 'focused'>('full'); // 'none' | 'full' | 'focused'

    constructor() {
        // Load from localStorage if available (client-side only)
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('wordys-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.showWord = parsed.showWord ?? true;
                this.errorFeedback = parsed.errorFeedback ?? true;
                this.highlightCurrentChar = parsed.highlightCurrentChar ?? true;
                this.cardRepetitions = parsed.cardRepetitions ?? 2;
                this.virtualKeyboardMode = parsed.virtualKeyboardMode ?? 'full';
            }
        }

        // Persist changes
        $effect.root(() => {
            $effect(() => {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('wordys-settings', JSON.stringify({
                        showWord: this.showWord,
                        errorFeedback: this.errorFeedback,
                        highlightCurrentChar: this.highlightCurrentChar,
                        cardRepetitions: this.cardRepetitions,
                        virtualKeyboardMode: this.virtualKeyboardMode
                    }));
                }
            });
        });
    }
}

export const settings = new SettingsStore();
