/**
 * בדיקות עבור Shapes Content Provider
 */
import { describe, it, expect } from 'vitest';
import { shapesProvider, SHAPES } from './index';
import type { ShapesProviderSettings, ShapeDefinition } from './index';

describe('Shapes Provider', () => {
	describe('Provider Metadata', () => {
		it('should have correct id', () => {
			expect(shapesProvider.id).toBe('shapes');
		});

		it('should have Hebrew display name', () => {
			expect(shapesProvider.displayName).toBe('צורות');
		});

		it('should have icon', () => {
			expect(shapesProvider.icon).toBe('🔷');
		});

		it('should have render component', () => {
			expect(shapesProvider.renderComponent).toBeDefined();
		});

		it('should have settings component', () => {
			expect(shapesProvider.settingsComponent).toBeDefined();
		});
	});

	describe('getAvailableItems', () => {
		it('should return all shape definitions', () => {
			const items = shapesProvider.getAvailableItems();
			expect(items).toHaveLength(10); // circle, square, triangle, star, heart, diamond, hexagon, semicircle, pentagon, cross
		});

		it('should return items with correct structure', () => {
			const items = shapesProvider.getAvailableItems();
			const firstItem = items[0];

			expect(firstItem).toHaveProperty('id');
			expect(firstItem).toHaveProperty('value');
			expect(firstItem).toHaveProperty('label');
			expect(typeof firstItem.id).toBe('string');
			expect(typeof firstItem.value).toBe('object');
			expect(typeof firstItem.label).toBe('string');
		});

		it('should include circle', () => {
			const items = shapesProvider.getAvailableItems();
			const circle = items.find(item => item.value.id === 'circle');
			expect(circle).toBeDefined();
			expect(circle?.value.name).toBe('עיגול');
		});

		it('should include all shapes from SHAPES constant', () => {
			const items = shapesProvider.getAvailableItems();
			SHAPES.forEach(shape => {
				const found = items.find(item => item.value.id === shape.id);
				expect(found).toBeDefined();
			});
		});
	});

	describe('getDefaultSettings', () => {
		it('should return settings with all shapes selected', () => {
			const settings = shapesProvider.getDefaultSettings();
			expect(settings.selectedShapes).toHaveLength(10);
		});

		it('should have selectedShapes property', () => {
			const settings = shapesProvider.getDefaultSettings();
			expect(settings).toHaveProperty('selectedShapes');
			expect(Array.isArray(settings.selectedShapes)).toBe(true);
		});

		it('should have colorMode property', () => {
			const settings = shapesProvider.getDefaultSettings();
			expect(settings).toHaveProperty('colorMode');
			expect(settings.colorMode).toBe('random');
		});
	});

	describe('generateCardContent', () => {
		it('should generate correct card content with uniform color', () => {
			const shape: ShapeDefinition = { id: 'circle', name: 'עיגול' };
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'uniform' 
			};
			
			const content = shapesProvider.generateCardContent(shape, settings);

			expect(content.providerId).toBe('shapes');
			expect(content.itemId).toBe('circle');
			expect(content.data).toHaveProperty('shapeId');
			expect(content.data).toHaveProperty('color');
			expect((content.data as any).shapeId).toBe('circle');
			expect((content.data as any).color).toBe('#3B82F6'); // DEFAULT_UNIFORM_COLOR
		});

		it('should generate content with random color', () => {
			const shape: ShapeDefinition = { id: 'circle', name: 'עיגול' };
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'random' 
			};
			
			const content = shapesProvider.generateCardContent(shape, settings);
			const data = content.data as any;

			expect(data.color).toMatch(/^#[0-9A-F]{6}$/i); // Valid hex color
		});

		it('should work for different shapes', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: [], 
				colorMode: 'uniform' 
			};
			
			const contentCircle = shapesProvider.generateCardContent(
				{ id: 'circle', name: 'עיגול' }, 
				settings
			);
			const contentSquare = shapesProvider.generateCardContent(
				{ id: 'square', name: 'ריבוע' }, 
				settings
			);

			expect(contentCircle.itemId).toBe('circle');
			expect(contentSquare.itemId).toBe('square');
			expect(contentCircle.itemId).not.toBe(contentSquare.itemId);
		});
	});

	describe('contentMatches', () => {
		it('should match cards with same shape and color', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'uniform' 
			};
			const shape: ShapeDefinition = { id: 'circle', name: 'עיגול' };

			const card1 = shapesProvider.generateCardContent(shape, settings);
			const card2 = shapesProvider.generateCardContent(shape, settings);

			expect(shapesProvider.contentMatches(card1, card2)).toBe(true);
		});

		it('should not match cards with different shapes', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: [], 
				colorMode: 'uniform' 
			};

			const card1 = shapesProvider.generateCardContent(
				{ id: 'circle', name: 'עיגול' }, 
				settings
			);
			const card2 = shapesProvider.generateCardContent(
				{ id: 'square', name: 'ריבוע' }, 
				settings
			);

			expect(shapesProvider.contentMatches(card1, card2)).toBe(false);
		});

		it('should not match cards with same shape but different colors', () => {
			const shape: ShapeDefinition = { id: 'circle', name: 'עיגול' };
			
			// יצירת שני כרטיסים עם צבעים שונים באופן ידני
			const card1 = {
				providerId: 'shapes',
				itemId: 'circle',
				data: { shapeId: 'circle', color: '#FF0000' }
			};
			const card2 = {
				providerId: 'shapes',
				itemId: 'circle',
				data: { shapeId: 'circle', color: '#00FF00' }
			};

			expect(shapesProvider.contentMatches(card1, card2)).toBe(false);
		});
	});

	describe('getSelectedItemIds', () => {
		it('should return selected shapes as array', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle', 'square', 'triangle'], 
				colorMode: 'uniform' 
			};
			const ids = shapesProvider.getSelectedItemIds(settings);

			expect(ids).toEqual(['circle', 'square', 'triangle']);
		});

		it('should return empty array for empty selection', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: [], 
				colorMode: 'random' 
			};
			const ids = shapesProvider.getSelectedItemIds(settings);

			expect(ids).toEqual([]);
		});

		it('should not mutate original settings', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle', 'square'], 
				colorMode: 'uniform' 
			};
			const originalShapes = [...settings.selectedShapes];
			
			const ids = shapesProvider.getSelectedItemIds(settings);
			ids.push('triangle');

			expect(settings.selectedShapes).toEqual(originalShapes);
		});
	});

	describe('updateSelectedItems', () => {
		it('should update selected shapes', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'uniform' 
			};
			const newSettings = shapesProvider.updateSelectedItems(
				settings, 
				['circle', 'square', 'triangle']
			);

			expect(newSettings.selectedShapes).toEqual(['circle', 'square', 'triangle']);
		});

		it('should preserve colorMode', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'random' 
			};
			const newSettings = shapesProvider.updateSelectedItems(
				settings, 
				['square']
			);

			expect(newSettings.colorMode).toBe('random');
		});

		it('should not mutate original settings', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'uniform' 
			};
			const original = { ...settings };
			
			shapesProvider.updateSelectedItems(settings, ['circle', 'square']);

			expect(settings).toEqual(original);
		});

		it('should work with empty array', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle', 'square'], 
				colorMode: 'uniform' 
			};
			const newSettings = shapesProvider.updateSelectedItems(settings, []);

			expect(newSettings.selectedShapes).toEqual([]);
		});

		it('should return new object (immutability)', () => {
			const settings: ShapesProviderSettings = { 
				selectedShapes: ['circle'], 
				colorMode: 'uniform' 
			};
			const newSettings = shapesProvider.updateSelectedItems(settings, ['square']);

			expect(newSettings).not.toBe(settings);
		});
	});

	describe('Integration: full workflow', () => {
		it('should handle complete provider workflow with uniform color', () => {
			// 1. קבלת ברירת מחדל
			const defaultSettings = shapesProvider.getDefaultSettings();
			expect(defaultSettings.selectedShapes).toHaveLength(10);

			// 2. עדכון בחירה
			const updatedSettings = shapesProvider.updateSelectedItems(
				{ ...defaultSettings, colorMode: 'uniform' },
				['circle', 'square']
			);
			expect(updatedSettings.selectedShapes).toEqual(['circle', 'square']);

			// 3. שליפת IDs
			const ids = shapesProvider.getSelectedItemIds(updatedSettings);
			expect(ids).toEqual(['circle', 'square']);

			// 4. יצירת תוכן כרטיס
			const content = shapesProvider.generateCardContent(
				{ id: 'circle', name: 'עיגול' },
				updatedSettings
			);
			expect(content.providerId).toBe('shapes');
			expect(content.itemId).toBe('circle');

			// 5. בדיקת התאמה (במצב uniform שני כרטיסים של אותה צורה תמיד יתאימו)
			const content2 = shapesProvider.generateCardContent(
				{ id: 'circle', name: 'עיגול' },
				updatedSettings
			);
			expect(shapesProvider.contentMatches(content, content2)).toBe(true);
		});
	});

	describe('SHAPES constant', () => {
		it('should have 10 shapes', () => {
			expect(SHAPES).toHaveLength(10);
		});

		it('should have all required shapes', () => {
			const shapeIds = SHAPES.map(s => s.id);
			expect(shapeIds).toContain('circle');
			expect(shapeIds).toContain('square');
			expect(shapeIds).toContain('triangle');
			expect(shapeIds).toContain('star');
			expect(shapeIds).toContain('heart');
			expect(shapeIds).toContain('diamond');
			expect(shapeIds).toContain('hexagon');
			expect(shapeIds).toContain('semicircle');
			expect(shapeIds).toContain('pentagon');
			expect(shapeIds).toContain('cross');
		});

		it('should have Hebrew names', () => {
			SHAPES.forEach(shape => {
				expect(shape.name).toBeTruthy();
				expect(typeof shape.name).toBe('string');
			});
		});
	});
});
