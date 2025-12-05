import { browser } from '$app/environment';
import type { Shelf, Box, Card } from '$lib/types';
import { words as initialWords } from '$lib/data/words';

class ShelvesStore {
    shelves = $state<Shelf[]>([]);

    constructor() {
        if (browser) {
            this.load();
        } else {
            // Server side initial state (empty or default)
            this.shelves = this.getDefaultShelves();
        }
    }

    private getDefaultShelves(): Shelf[] {
        // Create a default structure with initial words
        const defaultBox: Box = {
            id: crypto.randomUUID(),
            name: 'כללי',
            cards: initialWords.map(w => ({
                id: w.id,
                word: w.word,
                imageUrl: w.imageUrl
            }))
        };

        const defaultShelf: Shelf = {
            id: crypto.randomUUID(),
            name: 'מתחילים',
            boxes: [defaultBox]
        };

        return [defaultShelf];
    }

    private load() {
        const storedShelves = localStorage.getItem('wordys_shelves');

        if (storedShelves) {
            try {
                this.shelves = JSON.parse(storedShelves);
            } catch (e) {
                console.error('Failed to parse shelves', e);
                this.shelves = this.getDefaultShelves();
            }
        } else {
            // Check for legacy migration
            const legacyWords = localStorage.getItem('wordys_words');
            if (legacyWords) {
                try {
                    const parsedWords = JSON.parse(legacyWords);
                    const migratedBox: Box = {
                        id: crypto.randomUUID(),
                        name: 'מייבוא',
                        cards: parsedWords
                    };
                    const migratedShelf: Shelf = {
                        id: crypto.randomUUID(),
                        name: 'מדף - ישן',
                        boxes: [migratedBox]
                    };
                    this.shelves = [migratedShelf];
                    // Optional: Clear legacy
                    // localStorage.removeItem('wordys_words');
                } catch (e) {
                    console.error('Failed to migrate legacy words', e);
                    this.shelves = this.getDefaultShelves();
                }
            } else {
                this.shelves = this.getDefaultShelves();
            }
            this.save();
        }
    }

    save() {
        if (browser) {
            localStorage.setItem('wordys_shelves', JSON.stringify(this.shelves));
        }
    }

    // --- Shelf Actions ---
    addShelf(name: string) {
        this.shelves.push({
            id: crypto.randomUUID(),
            name,
            boxes: [],
            color: this.getRandomColor()
        });
        this.save();
    }

    updateShelf(id: string, name: string, color?: string, coverBoxId?: string) {
        const shelf = this.shelves.find(s => s.id === id);
        if (shelf) {
            shelf.name = name;
            if (color) shelf.color = color;
            if (coverBoxId !== undefined) shelf.coverBoxId = coverBoxId;
            this.save();
        }
    }

    deleteShelf(id: string) {
        this.shelves = this.shelves.filter(s => s.id !== id);
        this.save();
    }

    // --- Box Actions ---
    addBox(shelfId: string, name: string) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            shelf.boxes.push({
                id: crypto.randomUUID(),
                name,
                cards: [],
                color: this.getRandomColor()
            });
            this.save();
        }
    }

    updateBox(shelfId: string, boxId: string, name: string, color?: string, coverCardId?: string) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            const box = shelf.boxes.find(b => b.id === boxId);
            if (box) {
                box.name = name;
                if (color) box.color = color;
                if (coverCardId !== undefined) box.coverCardId = coverCardId;
                this.save();
            }
        }
    }

    deleteBox(shelfId: string, boxId: string) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            shelf.boxes = shelf.boxes.filter(b => b.id !== boxId);
            this.save();
        }
    }

    // --- Card Actions ---
    addCard(shelfId: string, boxId: string, cardData: { word: string, imageUrl: string, audioUrl?: string }) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            const box = shelf.boxes.find(b => b.id === boxId);
            if (box) {
                box.cards.push({
                    id: crypto.randomUUID(),
                    ...cardData
                });
                this.save();
            }
        }
    }

    updateCard(shelfId: string, boxId: string, cardId: string, data: { word: string, imageUrl: string, audioUrl?: string }) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            const box = shelf.boxes.find(b => b.id === boxId);
            if (box) {
                const card = box.cards.find(c => c.id === cardId);
                if (card) {
                    card.word = data.word;
                    card.imageUrl = data.imageUrl;
                    if (data.audioUrl !== undefined) card.audioUrl = data.audioUrl;
                    this.save();
                }
            }
        }
    }

    deleteCard(shelfId: string, boxId: string, cardId: string) {
        const shelf = this.shelves.find(s => s.id === shelfId);
        if (shelf) {
            const box = shelf.boxes.find(b => b.id === boxId);
            if (box) {
                box.cards = box.cards.filter(c => c.id !== cardId);
                this.save();
            }
        }
    }

    private getRandomColor(): string {
        const colors = [
            '#FCA5A5', // Red
            '#FDBA74', // Orange
            '#FDE047', // Yellow
            '#86EFAC', // Green
            '#93C5FD', // Blue
            '#C4B5FD', // Purple
            '#F9A8D4', // Pink
            '#E2E8F0'  // Slate
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

export const shelvesStore = new ShelvesStore();
