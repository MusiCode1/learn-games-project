/**
 * בדיקות עבור ממשק ContentProvider ופונקציות עזר
 */
import { describe, it, expect } from 'vitest';
import { isContentProvider } from './types';
import type { ContentProvider, ContentItem, CardContent } from './types';

describe('Content Provider Types', () => {
	describe('isContentProvider', () => {
		it('should return true for valid provider', () => {
			// יצירת mock function לרכיב Svelte
			const mockComponent = function() {};
			
			const validProvider: ContentProvider = {
				id: 'test',
				displayName: 'Test Provider',
				icon: '🧪',
				getAvailableItems: () => [],
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				getSelectedItemIds: () => [],
				updateSelectedItems: (settings) => settings,
				renderComponent: mockComponent as any
			};

			expect(isContentProvider(validProvider)).toBe(true);
		});

		it('should return false for null', () => {
			expect(isContentProvider(null)).toBe(false);
		});

		it('should return false for undefined', () => {
			expect(isContentProvider(undefined)).toBe(false);
		});

		it('should return false for non-object', () => {
			expect(isContentProvider('string')).toBe(false);
			expect(isContentProvider(123)).toBe(false);
			expect(isContentProvider(true)).toBe(false);
		});

		it('should return false for object missing id', () => {
			const invalidProvider = {
				displayName: 'Test',
				icon: '🧪',
				getAvailableItems: () => [],
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				getSelectedItemIds: () => [],
				updateSelectedItems: (settings: any) => settings,
				renderComponent: {} as any
			};

			expect(isContentProvider(invalidProvider)).toBe(false);
		});

		it('should return false for object missing getAvailableItems', () => {
			const invalidProvider = {
				id: 'test',
				displayName: 'Test',
				icon: '🧪',
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				getSelectedItemIds: () => [],
				updateSelectedItems: (settings: any) => settings,
				renderComponent: {} as any
			};

			expect(isContentProvider(invalidProvider)).toBe(false);
		});

		it('should return false for object missing getSelectedItemIds', () => {
			const invalidProvider = {
				id: 'test',
				displayName: 'Test',
				icon: '🧪',
				getAvailableItems: () => [],
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				updateSelectedItems: (settings: any) => settings,
				renderComponent: {} as any
			};

			expect(isContentProvider(invalidProvider)).toBe(false);
		});

		it('should return false for object missing updateSelectedItems', () => {
			const invalidProvider = {
				id: 'test',
				displayName: 'Test',
				icon: '🧪',
				getAvailableItems: () => [],
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				getSelectedItemIds: () => [],
				renderComponent: {} as any
			};

			expect(isContentProvider(invalidProvider)).toBe(false);
		});

		it('should return false for object with non-function methods', () => {
			const invalidProvider = {
				id: 'test',
				displayName: 'Test',
				icon: '🧪',
				getAvailableItems: 'not a function',
				getDefaultSettings: () => ({}),
				generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
				contentMatches: () => true,
				getSelectedItemIds: () => [],
				updateSelectedItems: (settings: any) => settings,
				renderComponent: {} as any
			};

			expect(isContentProvider(invalidProvider)).toBe(false);
		});
	});
});
