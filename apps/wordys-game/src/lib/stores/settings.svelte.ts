export class SettingsStore {
    showWord = $state(true);
    errorFeedback = $state(true);
    highlightCurrentChar = $state(true);

    constructor() {
        // Load from localStorage if available (client-side only)
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('wordys-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.showWord = parsed.showWord ?? true;
                this.errorFeedback = parsed.errorFeedback ?? true;
                this.highlightCurrentChar = parsed.highlightCurrentChar ?? true;
            }
        }

        // Persist changes
        $effect.root(() => {
            $effect(() => {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('wordys-settings', JSON.stringify({
                        showWord: this.showWord,
                        errorFeedback: this.errorFeedback,
                        highlightCurrentChar: this.highlightCurrentChar
                    }));
                }
            });
        });
    }
}

export const settings = new SettingsStore();
