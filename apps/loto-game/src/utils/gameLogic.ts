import type { Card } from '../types';

// Correcting the array and ensuring we have enough letters for 10 pairs
export const LETTERS = [
    'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
    'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
    'ש', 'ת'
];

export function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function generateCards(pairCount: number = 10, availableLetters: string[] = LETTERS): Card[] {
    // Select random letters for the pairs from the available letters
    // If pairCount > availableLetters.length, we need to repeat letters
    let selectedLetters: string[] = [];
    while (selectedLetters.length < pairCount) {
        selectedLetters = [...selectedLetters, ...shuffle(availableLetters)];
    }
    selectedLetters = selectedLetters.slice(0, pairCount);

    const cards: Card[] = [];

    selectedLetters.forEach((letter) => {
        // Create two cards for each letter
        cards.push({
            id: Math.random(), // Temporary ID, will be fixed by index or better random
            content: letter,
            isSelected: false,
            isMatched: false,
            isError: false,
        });
        cards.push({
            id: Math.random(),
            content: letter,
            isSelected: false,
            isMatched: false,
            isError: false,
        });
    });

    // Assign unique IDs after shuffling or just use index
    return shuffle(cards).map((card, index) => ({ ...card, id: index }));
}
