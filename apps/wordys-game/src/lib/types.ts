export interface Card {
	id: string;
	word: string; // Keeping 'word' property name for compatibility or ease, but functionally it's the text on the card
}

export interface Box {
	id: string;
	name: string;
	cards: Card[];
	color?: string; // Hex code or preset name
	coverCardId?: string; // Specific card to show as thumbnail
}

export interface Shelf {
	id: string;
	name: string;
	boxes: Box[];
	color?: string;
	coverBoxId?: string; // Specific box to use its cover/image as thumbnail
}
