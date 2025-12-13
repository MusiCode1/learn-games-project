import type { Shelf, Box } from '$lib/types';
import { getCardImageUrl } from '$lib/services/assets';

export function getBoxImage(box: Box): string | null {
	if (box.coverCardId) {
		// We just need the ID to get the image
		return getCardImageUrl(box.coverCardId);
	}
	if (box.cards.length > 0) {
		return getCardImageUrl(box.cards[0].id);
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
