/**
 * ספק תוכן "ציור של קריאה"
 * שיטת עופרה כלב - תומכי זיכרון חזותיים לאותיות עבריות
 */
import type { ContentProvider, ContentItem, CardContent } from '$lib/content/types';
import { contentRegistry } from '../../registry';
import ReadingContent from './ReadingContent.svelte';
import ReadingSettings from './ReadingSettings.svelte';

/** הגדרת פריט קריאה - אות עם תומך זיכרון */
export interface ReadingItem {
	id: string;
	letter: string; // האות עם ניקוד
	imagePath: string; // נתיב לתמונת התומך
	helper: string; // שם התומך בעברית
}

/** רשימת האותיות עם תומכי הזיכרון (א-ח) */
export const READING_ITEMS: ReadingItem[] = [
	{ id: 'aleph', letter: 'אַ', imagePath: '/reading-icons/aleph_pear.png', helper: 'אגס' },
	{ id: 'bet', letter: 'בָּ', imagePath: '/reading-icons/bet_balloon.png', helper: 'בלון' },
	{ id: 'gimel', letter: 'גָ', imagePath: '/reading-icons/gimel_wheel.png', helper: 'גלגל' },
	{ id: 'dalet', letter: 'דָ', imagePath: '/reading-icons/dalet_fish.png', helper: 'דג' },
	{ id: 'he', letter: 'הָ', imagePath: '/reading-icons/he_mountain.png', helper: 'הר' },
	{ id: 'vav', letter: 'ו', imagePath: '/reading-icons/vav_waffle.png', helper: 'ופל' },
	{ id: 'zayin', letter: 'זָ', imagePath: '/reading-icons/zayin_beard.png', helper: 'זקן' },
	{ id: 'het', letter: 'חָ', imagePath: '/reading-icons/het_window.png', helper: 'חלון' }
];

/** הגדרות ספק הקריאה */
export interface ReadingProviderSettings {
	selectedItems: string[];
}

/** תוכן כרטיס קריאה */
interface ReadingContentData {
	letter: string;
	imagePath: string;
	helper: string;
}

/** ספק "ציור של קריאה" */
export const readingProvider: ContentProvider<ReadingItem, ReadingProviderSettings> = {
	id: 'reading',
	displayName: 'ציור של קריאה',
	icon: '📖',

	getAvailableItems(): ContentItem<ReadingItem>[] {
		return READING_ITEMS.map((item) => ({
			id: item.id,
			value: item,
			label: `${item.letter} - ${item.helper}`
		}));
	},

	getDefaultSettings(): ReadingProviderSettings {
		return {
			selectedItems: READING_ITEMS.map((item) => item.id)
		};
	},

	generateCardContent(item: ReadingItem): CardContent {
		const data: ReadingContentData = {
			letter: item.letter,
			imagePath: item.imagePath,
			helper: item.helper
		};

		return {
			providerId: 'reading',
			itemId: item.id,
			data
		};
	},

	contentMatches(a: CardContent, b: CardContent): boolean {
		// זוגות זהים - אותו itemId
		return a.itemId === b.itemId;
	},

	getSelectedItemIds(settings: ReadingProviderSettings): string[] {
		return [...settings.selectedItems];
	},

	updateSelectedItems(settings: ReadingProviderSettings, selectedIds: string[]): ReadingProviderSettings {
		return { ...settings, selectedItems: selectedIds };
	},

	renderComponent: ReadingContent as any,
	settingsComponent: ReadingSettings as any,

	// עיצוב כרטיס מותאם - אות למעלה, תמונה למטה
	cardStyles: {
		contentLayout: 'vertical',
		padding: '0.5rem'
	}
};

// רישום אוטומטי
contentRegistry.register(readingProvider);
