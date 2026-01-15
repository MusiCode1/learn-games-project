/**
 * ספק תוכן לאותיות עבריות
 */
import type { ContentProvider, ContentItem, CardContent } from '../../types';
import LetterContent from './LetterContent.svelte';
import LettersSettings from './LettersSettings.svelte';

/** רשימת האותיות העבריות */
const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

/** הגדרות ספק האותיות */
export interface LettersProviderSettings {
	selectedLetters: string[];
}

/** ספק האותיות */
export const lettersProvider: ContentProvider<string, LettersProviderSettings> = {
	id: 'letters',
	displayName: 'אותיות',
	icon: '🔤',

	getAvailableItems(): ContentItem<string>[] {
		return LETTERS.map((letter) => ({
			id: letter,
			value: letter,
			label: letter
		}));
	},

	getDefaultSettings(): LettersProviderSettings {
		return {
			selectedLetters: [...LETTERS]
		};
	},

	generateCardContent(letter: string): CardContent {
		return {
			providerId: 'letters',
			itemId: letter,
			data: letter
		};
	},

	contentMatches(a: CardContent, b: CardContent): boolean {
		// השוואה פשוטה של האותיות
		return a.itemId === b.itemId;
	},

	renderComponent: LetterContent as any,
	settingsComponent: LettersSettings as any
};
