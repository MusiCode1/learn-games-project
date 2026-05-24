import type { Shelf, Box } from '$lib/types';
import { getCardImage } from '$lib/services/assets';

export function getBoxImage(box: Box): string | null {
	if (box.coverCardId) {
		const card = box.cards.find((c) => c.id === box.coverCardId);
		if (card) return getCardImage(card);
	}
	if (box.cards.length > 0) {
		return getCardImage(box.cards[0]);
	}
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
