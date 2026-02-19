/**
 * בדיקות עבור Reading Content Provider (ציור של קריאה)
 */
import { describe, it, expect } from 'vitest';
import { readingProvider, READING_ITEMS } from './index';
import type { ReadingProviderSettings, ReadingItem } from './index';

describe('Reading Provider', () => {
	describe('Provider Metadata', () => {
		it('should have correct id', () => {
			expect(readingProvider.id).toBe('reading');
		});

		it('should have Hebrew display name', () => {
			expect(readingProvider.displayName).toBe('ציור של קריאה');
		});

		it('should have icon', () => {
			expect(readingProvider.icon).toBe('📖');
		});

		it('should have render component', () => {
			expect(readingProvider.renderComponent).toBeDefined();
		});

		it('should have settings component', () => {
			expect(readingProvider.settingsComponent).toBeDefined();
		});

		it('should have cardStyles configured', () => {
			expect(readingProvider.cardStyles).toBeDefined();
			expect(readingProvider.cardStyles?.contentLayout).toBe('vertical');
			expect(readingProvider.cardStyles?.padding).toBe('0.5rem');
		});
	});

	describe('getAvailableItems', () => {
		it('should return all reading items (א-ח)', () => {
			const items = readingProvider.getAvailableItems();
			expect(items).toHaveLength(8); // aleph, bet, gimel, dalet, he, vav, zayin, het
		});

		it('should return items with correct structure', () => {
			const items = readingProvider.getAvailableItems();
			const firstItem = items[0];

			expect(firstItem).toHaveProperty('id');
			expect(firstItem).toHaveProperty('value');
			expect(firstItem).toHaveProperty('label');
			expect(typeof firstItem.id).toBe('string');
			expect(typeof firstItem.value).toBe('object');
			expect(typeof firstItem.label).toBe('string');
		});

		it('should have label format "letter - helper"', () => {
			const items = readingProvider.getAvailableItems();
			const aleph = items.find(item => item.id === 'aleph');
			
			expect(aleph).toBeDefined();
			expect(aleph?.label).toContain(' - ');
			expect(aleph?.label).toContain('אַ');
			expect(aleph?.label).toContain('אגס');
		});

		it('should include aleph', () => {
			const items = readingProvider.getAvailableItems();
			const aleph = items.find(item => item.value.id === 'aleph');
			
			expect(aleph).toBeDefined();
			expect(aleph?.value.letter).toBe('אַ');
			expect(aleph?.value.helper).toBe('אגס');
		});

		it('should include het', () => {
			const items = readingProvider.getAvailableItems();
			const het = items.find(item => item.value.id === 'het');
			
			expect(het).toBeDefined();
			expect(het?.value.letter).toBe('חָ');
			expect(het?.value.helper).toBe('חלון');
		});

		it('should include all items from READING_ITEMS constant', () => {
			const items = readingProvider.getAvailableItems();
			READING_ITEMS.forEach(readingItem => {
				const found = items.find(item => item.value.id === readingItem.id);
				expect(found).toBeDefined();
			});
		});
	});

	describe('getDefaultSettings', () => {
		it('should return settings with all items selected', () => {
			const settings = readingProvider.getDefaultSettings();
			expect(settings.selectedItems).toHaveLength(8);
		});

		it('should have selectedItems property', () => {
			const settings = readingProvider.getDefaultSettings();
			expect(settings).toHaveProperty('selectedItems');
			expect(Array.isArray(settings.selectedItems)).toBe(true);
		});

		it('should include all item IDs', () => {
			const settings = readingProvider.getDefaultSettings();
			const expectedIds = READING_ITEMS.map(item => item.id);
			
			expect(settings.selectedItems).toEqual(expectedIds);
		});
	});

	describe('generateCardContent', () => {
		it('should generate correct card content', () => {
			const item: ReadingItem = {
				id: 'aleph',
				letter: 'אַ',
				imagePath: '/reading-icons/aleph_pear.png',
				helper: 'אגס'
			};
			const settings: ReadingProviderSettings = { selectedItems: ['aleph'] };
			
			const content = readingProvider.generateCardContent(item, settings);

			expect(content.providerId).toBe('reading');
			expect(content.itemId).toBe('aleph');
			expect(content.data).toHaveProperty('letter');
			expect(content.data).toHaveProperty('imagePath');
			expect(content.data).toHaveProperty('helper');
			
			const data = content.data as any;
			expect(data.letter).toBe('אַ');
			expect(data.imagePath).toBe('/reading-icons/aleph_pear.png');
			expect(data.helper).toBe('אגס');
		});

		it('should work for different items', () => {
			const settings: ReadingProviderSettings = { selectedItems: [] };
			
			const contentAleph = readingProvider.generateCardContent(
				READING_ITEMS[0],
				settings
			);
			const contentBet = readingProvider.generateCardContent(
				READING_ITEMS[1],
				settings
			);

			expect(contentAleph.itemId).toBe('aleph');
			expect(contentBet.itemId).toBe('bet');
			expect(contentAleph.itemId).not.toBe(contentBet.itemId);
		});

		it('should preserve all item properties in data', () => {
			const item: ReadingItem = {
				id: 'gimel',
				letter: 'גָ',
				imagePath: '/reading-icons/gimel_wheel.png',
				helper: 'גלגל'
			};
			const settings: ReadingProviderSettings = { selectedItems: [] };
			
			const content = readingProvider.generateCardContent(item, settings);
			const data = content.data as any;

			expect(data.letter).toBe(item.letter);
			expect(data.imagePath).toBe(item.imagePath);
			expect(data.helper).toBe(item.helper);
		});
	});

	describe('contentMatches', () => {
		const settings: ReadingProviderSettings = { selectedItems: [] };

		it('should match cards with same item', () => {
			const card1 = readingProvider.generateCardContent(READING_ITEMS[0], settings);
			const card2 = readingProvider.generateCardContent(READING_ITEMS[0], settings);

			expect(readingProvider.contentMatches(card1, card2)).toBe(true);
		});

		it('should not match cards with different items', () => {
			const card1 = readingProvider.generateCardContent(READING_ITEMS[0], settings);
			const card2 = readingProvider.generateCardContent(READING_ITEMS[1], settings);

			expect(readingProvider.contentMatches(card1, card2)).toBe(false);
		});

		it('should match based on itemId (aleph)', () => {
			const card1 = {
				providerId: 'reading',
				itemId: 'aleph',
				data: { letter: 'אַ', imagePath: '/path1', helper: 'אגס' }
			};
			const card2 = {
				providerId: 'reading',
				itemId: 'aleph',
				data: { letter: 'אַ', imagePath: '/path2', helper: 'אגס' }
			};

			expect(readingProvider.contentMatches(card1, card2)).toBe(true);
		});
	});

	describe('getSelectedItemIds', () => {
		it('should return selected items as array', () => {
			const settings: ReadingProviderSettings = { 
				selectedItems: ['aleph', 'bet', 'gimel'] 
			};
			const ids = readingProvider.getSelectedItemIds(settings);

			expect(ids).toEqual(['aleph', 'bet', 'gimel']);
		});

		it('should return empty array for empty selection', () => {
			const settings: ReadingProviderSettings = { selectedItems: [] };
			const ids = readingProvider.getSelectedItemIds(settings);

			expect(ids).toEqual([]);
		});

		it('should not mutate original settings', () => {
			const settings: ReadingProviderSettings = { 
				selectedItems: ['aleph', 'bet'] 
			};
			const originalItems = [...settings.selectedItems];
			
			const ids = readingProvider.getSelectedItemIds(settings);
			ids.push('gimel');

			expect(settings.selectedItems).toEqual(originalItems);
		});
	});

	describe('updateSelectedItems', () => {
		it('should update selected items', () => {
			const settings: ReadingProviderSettings = { selectedItems: ['aleph'] };
			const newSettings = readingProvider.updateSelectedItems(
				settings, 
				['aleph', 'bet', 'gimel']
			);

			expect(newSettings.selectedItems).toEqual(['aleph', 'bet', 'gimel']);
		});

		it('should not mutate original settings', () => {
			const settings: ReadingProviderSettings = { selectedItems: ['aleph'] };
			const original = { ...settings };
			
			readingProvider.updateSelectedItems(settings, ['aleph', 'bet']);

			expect(settings).toEqual(original);
		});

		it('should work with empty array', () => {
			const settings: ReadingProviderSettings = { 
				selectedItems: ['aleph', 'bet'] 
			};
			const newSettings = readingProvider.updateSelectedItems(settings, []);

			expect(newSettings.selectedItems).toEqual([]);
		});

		it('should return new object (immutability)', () => {
			const settings: ReadingProviderSettings = { selectedItems: ['aleph'] };
			const newSettings = readingProvider.updateSelectedItems(settings, ['bet']);

			expect(newSettings).not.toBe(settings);
		});
	});

	describe('Integration: full workflow', () => {
		it('should handle complete provider workflow', () => {
			// 1. קבלת ברירת מחדל
			const defaultSettings = readingProvider.getDefaultSettings();
			expect(defaultSettings.selectedItems).toHaveLength(8);

			// 2. עדכון בחירה
			const updatedSettings = readingProvider.updateSelectedItems(
				defaultSettings,
				['aleph', 'bet', 'gimel']
			);
			expect(updatedSettings.selectedItems).toEqual(['aleph', 'bet', 'gimel']);

			// 3. שליפת IDs
			const ids = readingProvider.getSelectedItemIds(updatedSettings);
			expect(ids).toEqual(['aleph', 'bet', 'gimel']);

			// 4. יצירת תוכן כרטיס
			const content = readingProvider.generateCardContent(
				READING_ITEMS[0],
				updatedSettings
			);
			expect(content.providerId).toBe('reading');
			expect(content.itemId).toBe('aleph');

			// 5. בדיקת התאמה
			const content2 = readingProvider.generateCardContent(
				READING_ITEMS[0],
				updatedSettings
			);
			expect(readingProvider.contentMatches(content, content2)).toBe(true);
		});
	});

	describe('READING_ITEMS constant', () => {
		it('should have 8 items (א-ח)', () => {
			expect(READING_ITEMS).toHaveLength(8);
		});

		it('should have all required letters in order', () => {
			const itemIds = READING_ITEMS.map(item => item.id);
			expect(itemIds).toEqual([
				'aleph', 'bet', 'gimel', 'dalet', 
				'he', 'vav', 'zayin', 'het'
			]);
		});

		it('should have valid structure for all items', () => {
			READING_ITEMS.forEach(item => {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('letter');
				expect(item).toHaveProperty('imagePath');
				expect(item).toHaveProperty('helper');
				
				expect(typeof item.id).toBe('string');
				expect(typeof item.letter).toBe('string');
				expect(typeof item.imagePath).toBe('string');
				expect(typeof item.helper).toBe('string');
			});
		});

		it('should have image paths pointing to reading-icons directory', () => {
			READING_ITEMS.forEach(item => {
				expect(item.imagePath).toMatch(/^\/reading-icons\//);
				expect(item.imagePath).toMatch(/\.png$/);
			});
		});

		it('should have Hebrew letters with nikud', () => {
			const letters = READING_ITEMS.map(item => item.letter);
			expect(letters).toContain('אַ');
			expect(letters).toContain('בָּ');
			expect(letters).toContain('גָ');
			expect(letters).toContain('דָ');
			expect(letters).toContain('הָ');
			expect(letters).toContain('ו');
			expect(letters).toContain('זָ');
			expect(letters).toContain('חָ');
		});

		it('should have Hebrew helper words', () => {
			const helpers = READING_ITEMS.map(item => item.helper);
			expect(helpers).toContain('אגס');
			expect(helpers).toContain('בלון');
			expect(helpers).toContain('גלגל');
			expect(helpers).toContain('דג');
			expect(helpers).toContain('הר');
			expect(helpers).toContain('ופל');
			expect(helpers).toContain('זקן');
			expect(helpers).toContain('חלון');
		});
	});
});
