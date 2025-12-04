import { browser } from '$app/environment';
import { words as initialWords, type WordData } from '$lib/data/words';

class WordsStore {
    words = $state<WordData[]>([]);

    constructor() {
        if (browser) {
            const stored = localStorage.getItem('wordys_words');
            if (stored) {
                try {
                    this.words = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse words from localStorage', e);
                    this.words = [...initialWords];
                }
            } else {
                this.words = [...initialWords];
            }
        } else {
            this.words = [...initialWords];
        }
    }

    save() {
        if (browser) {
            localStorage.setItem('wordys_words', JSON.stringify(this.words));
        }
    }

    addWord(word: string, imageUrl: string) {
        const newWord: WordData = {
            id: crypto.randomUUID(),
            word,
            imageUrl
        };
        this.words = [...this.words, newWord];
        this.save();
    }

    removeWord(id: string) {
        this.words = this.words.filter((w) => w.id !== id);
        this.save();
    }

    updateWord(id: string, word: string, imageUrl: string) {
        const index = this.words.findIndex((w) => w.id === id);
        if (index !== -1) {
            this.words[index] = { ...this.words[index], word, imageUrl };
            this.save();
        }
    }

    resetToDefaults() {
        this.words = [...initialWords];
        this.save();
    }
}

export const wordsStore = new WordsStore();
