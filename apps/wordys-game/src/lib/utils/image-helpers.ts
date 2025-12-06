import type { Shelf, Box } from '$lib/types';

export function getBoxImage(box: Box): string | null {
    if (box.coverCardId) {
        const card = box.cards.find((c) => c.id === box.coverCardId);
        if (card) return card.imageUrl;
    }
    if (box.cards.length > 0) return box.cards[0].imageUrl;
    return null;
}

export function getShelfImage(shelf: Shelf): string | null {
    if (shelf.coverBoxId) {
        const box = shelf.boxes.find((b) => b.id === shelf.coverBoxId);
        if (box) return getBoxImage(box);
    }
    if (shelf.boxes.length > 0) return getBoxImage(shelf.boxes[0]);
    return null;
}
