import type { Progress } from '$lib/types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'readFasterProgress';

export function saveProgress(progress: Progress): void {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
	}
}

export function loadProgress(): Progress | null {
	if (!browser) {
		return null;
	}

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch {
			return null;
		}
	}
	return null;
}
