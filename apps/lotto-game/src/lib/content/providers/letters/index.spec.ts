/**
 * בדיקות עבור Letters Content Provider
 */
import { describe, it, expect } from 'vitest';
import { lettersProvider } from './index';
import type { LettersProviderSettings } from './index';

describe('Letters Provider', () => {
	describe('Provider Metadata', () => {
		it('should have correct id', () => {
			expect(lettersProvider.id).toBe('letters');
		});

		it('should have Hebrew display name', () => {
			expect(lettersProvider.displayName).toBe('אותיות');
		});

		it('should have icon', () => {
			expect(lettersProvider.icon).toBe('🔤');
		});

		it('should have render component', () => {
			expect(lettersProvider.renderComponent).toBeDefined();
		});

		it('should have settings component', () => {
			expect(lettersProvider.settingsComponent).toBeDefined();
		});
	});

	describe('getAvailableItems', () => {
		it('should return all Hebrew letters', () => {
			const items = lettersProvider.getAvailableItems();
			expect(items).toHaveLength(22); // אבגדהוזחטיכלמנסעפצקרשת
		});

		it('should return items with correct structure', () => {
			const items = lettersProvider.getAvailableItems();
			const firstItem = items[0];

			expect(firstItem).toHaveProperty('id');
			expect(firstItem).toHaveProperty('value');
			expect(firstItem).toHaveProperty('label');
			expect(typeof firstItem.id).toBe('string');
			expect(typeof firstItem.value).toBe('string');
			expect(typeof firstItem.label).toBe('string');
		});

		it('should have matching id, value, and label for each letter', () => {
			const items = lettersProvider.getAvailableItems();
			items.forEach(item => {
				expect(item.id).toBe(item.value);
				expect(item.label).toBe(item.value);
			});
		});

		it('should include aleph', () => {
			const items = lettersProvider.getAvailableItems();
			const aleph = items.find(item => item.value === 'א');
			expect(aleph).toBeDefined();
		});

		it('should include tav', () => {
			const items = lettersProvider.getAvailableItems();
			const tav = items.find(item => item.value === 'ת');
			expect(tav).toBeDefined();
		});
	});

	describe('getDefaultSettings', () => {
		it('should return settings with all letters selected', () => {
			const settings = lettersProvider.getDefaultSettings();
			expect(settings.selectedLetters).toHaveLength(22);
		});

		it('should have selectedLetters property', () => {
			const settings = lettersProvider.getDefaultSettings();
			expect(settings).toHaveProperty('selectedLetters');
			expect(Array.isArray(settings.selectedLetters)).toBe(true);
		});
	});

	describe('generateCardContent', () => {
		it('should generate correct card content', () => {
			const letter = 'א';
			const settings: LettersProviderSettings = { selectedLetters: ['א', 'ב'] };
			
			const content = lettersProvider.generateCardContent(letter, settings);

			expect(content.providerId).toBe('letters');
			expect(content.itemId).toBe('א');
			expect(content.data).toBe('א');
		});

		it('should work for different letters', () => {
			const settings: LettersProviderSettings = { selectedLetters: [] };
			
			const contentA = lettersProvider.generateCardContent('א', settings);
			const contentB = lettersProvider.generateCardContent('ב', settings);

			expect(contentA.itemId).toBe('א');
			expect(contentB.itemId).toBe('ב');
			expect(contentA.itemId).not.toBe(contentB.itemId);
		});
	});

	describe('contentMatches', () => {
		const settings: LettersProviderSettings = { selectedLetters: [] };

		it('should match cards with same letter', () => {
			const card1 = lettersProvider.generateCardContent('א', settings);
			const card2 = lettersProvider.generateCardContent('א', settings);

			expect(lettersProvider.contentMatches(card1, card2)).toBe(true);
		});

		it('should not match cards with different letters', () => {
			const card1 = lettersProvider.generateCardContent('א', settings);
			const card2 = lettersProvider.generateCardContent('ב', settings);

			expect(lettersProvider.contentMatches(card1, card2)).toBe(false);
		});
	});

	describe('getSelectedItemIds', () => {
		it('should return selected letters as array', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א', 'ב', 'ג'] };
			const ids = lettersProvider.getSelectedItemIds(settings);

			expect(ids).toEqual(['א', 'ב', 'ג']);
		});

		it('should return empty array for empty selection', () => {
			const settings: LettersProviderSettings = { selectedLetters: [] };
			const ids = lettersProvider.getSelectedItemIds(settings);

			expect(ids).toEqual([]);
		});

		it('should not mutate original settings', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א', 'ב'] };
			const originalLetters = [...settings.selectedLetters];
			
			const ids = lettersProvider.getSelectedItemIds(settings);
			ids.push('ג');

			expect(settings.selectedLetters).toEqual(originalLetters);
		});
	});

	describe('updateSelectedItems', () => {
		it('should update selected letters', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א'] };
			const newSettings = lettersProvider.updateSelectedItems(settings, ['א', 'ב', 'ג']);

			expect(newSettings.selectedLetters).toEqual(['א', 'ב', 'ג']);
		});

		it('should not mutate original settings', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א'] };
			const original = { ...settings };
			
			lettersProvider.updateSelectedItems(settings, ['א', 'ב']);

			expect(settings).toEqual(original);
		});

		it('should work with empty array', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א', 'ב'] };
			const newSettings = lettersProvider.updateSelectedItems(settings, []);

			expect(newSettings.selectedLetters).toEqual([]);
		});

		it('should return new object (immutability)', () => {
			const settings: LettersProviderSettings = { selectedLetters: ['א'] };
			const newSettings = lettersProvider.updateSelectedItems(settings, ['ב']);

			expect(newSettings).not.toBe(settings);
		});
	});

	describe('Integration: full workflow', () => {
		it('should handle complete provider workflow', () => {
			// 1. קבלת ברירת מחדל
			const defaultSettings = lettersProvider.getDefaultSettings();
			expect(defaultSettings.selectedLetters).toHaveLength(22);

			// 2. עדכון בחירה
			const updatedSettings = lettersProvider.updateSelectedItems(defaultSettings, ['א', 'ב', 'ג']);
			expect(updatedSettings.selectedLetters).toEqual(['א', 'ב', 'ג']);

			// 3. שליפת IDs
			const ids = lettersProvider.getSelectedItemIds(updatedSettings);
			expect(ids).toEqual(['א', 'ב', 'ג']);

			// 4. יצירת תוכן כרטיס
			const content = lettersProvider.generateCardContent('א', updatedSettings);
			expect(content.providerId).toBe('letters');
			expect(content.itemId).toBe('א');

			// 5. בדיקת התאמה
			const content2 = lettersProvider.generateCardContent('א', updatedSettings);
			expect(lettersProvider.contentMatches(content, content2)).toBe(true);
		});
	});
});
