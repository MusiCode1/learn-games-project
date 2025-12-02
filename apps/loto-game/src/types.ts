export interface Card {
    id: number;
    content: string; // The Hebrew letter
    isSelected: boolean;
    isMatched: boolean;
    isError?: boolean;
}

export interface GameState {
    cards: Card[];
    selectedCards: number[]; // IDs of currently selected cards (max 2)
    matches: number;
    isLocked: boolean; // Prevent clicking while animating
}
