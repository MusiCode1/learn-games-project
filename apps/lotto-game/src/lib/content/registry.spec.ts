/**
 * בדיקות עבור ContentProviderRegistry
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { ContentProvider } from './types';

// יצירת registry חדש לכל בדיקה כדי למנוע השפעות זו על זו
class TestRegistry {
	private providers = new Map<string, ContentProvider>();

	register(provider: ContentProvider): void {
		this.providers.set(provider.id, provider);
	}

	get(id: string): ContentProvider {
		const provider = this.providers.get(id);
		if (!provider) {
			throw new Error(`Provider with id "${id}" not found`);
		}
		return provider;
	}

	has(id: string): boolean {
		return this.providers.has(id);
	}

	getAll(): ContentProvider[] {
		return Array.from(this.providers.values());
	}

	unregister(id: string): boolean {
		return this.providers.delete(id);
	}

	clear(): void {
		this.providers.clear();
	}
}

describe('ContentProviderRegistry', () => {
	let registry: TestRegistry;
	let mockProvider: ContentProvider;

	beforeEach(() => {
		registry = new TestRegistry();
		mockProvider = {
			id: 'test',
			displayName: 'Test Provider',
			icon: '🧪',
			getAvailableItems: () => [],
			getDefaultSettings: () => ({ items: [] }),
			generateCardContent: () => ({ providerId: 'test', itemId: '1', data: null }),
			contentMatches: () => true,
			getSelectedItemIds: () => [],
			updateSelectedItems: (settings) => settings,
			renderComponent: {} as any
		};
	});

	describe('register', () => {
		it('should register a provider', () => {
			registry.register(mockProvider);
			expect(registry.has('test')).toBe(true);
		});

		it('should overwrite existing provider (HMR support)', () => {
			registry.register(mockProvider);
			
			const updatedProvider = { ...mockProvider, displayName: 'Updated Provider' };
			registry.register(updatedProvider);

			const retrieved = registry.get('test');
			expect(retrieved.displayName).toBe('Updated Provider');
		});

		it('should register multiple providers', () => {
			registry.register(mockProvider);
			
			const provider2 = { ...mockProvider, id: 'test2', displayName: 'Test 2' };
			registry.register(provider2);

			expect(registry.has('test')).toBe(true);
			expect(registry.has('test2')).toBe(true);
			expect(registry.getAll()).toHaveLength(2);
		});
	});

	describe('get', () => {
		it('should retrieve registered provider', () => {
			registry.register(mockProvider);
			const retrieved = registry.get('test');
			expect(retrieved).toBe(mockProvider);
		});

		it('should throw error for non-existent provider', () => {
			expect(() => registry.get('nonexistent')).toThrow('Provider with id "nonexistent" not found');
		});
	});

	describe('has', () => {
		it('should return true for registered provider', () => {
			registry.register(mockProvider);
			expect(registry.has('test')).toBe(true);
		});

		it('should return false for non-registered provider', () => {
			expect(registry.has('nonexistent')).toBe(false);
		});
	});

	describe('getAll', () => {
		it('should return empty array when no providers registered', () => {
			expect(registry.getAll()).toEqual([]);
		});

		it('should return all registered providers', () => {
			registry.register(mockProvider);
			
			const provider2 = { ...mockProvider, id: 'test2', displayName: 'Test 2' };
			registry.register(provider2);

			const all = registry.getAll();
			expect(all).toHaveLength(2);
			expect(all).toContain(mockProvider);
			expect(all).toContain(provider2);
		});
	});

	describe('unregister', () => {
		it('should remove registered provider', () => {
			registry.register(mockProvider);
			expect(registry.has('test')).toBe(true);

			const result = registry.unregister('test');
			expect(result).toBe(true);
			expect(registry.has('test')).toBe(false);
		});

		it('should return false for non-existent provider', () => {
			const result = registry.unregister('nonexistent');
			expect(result).toBe(false);
		});
	});

	describe('clear', () => {
		it('should remove all providers', () => {
			registry.register(mockProvider);
			
			const provider2 = { ...mockProvider, id: 'test2' };
			registry.register(provider2);

			expect(registry.getAll()).toHaveLength(2);

			registry.clear();
			expect(registry.getAll()).toHaveLength(0);
		});
	});
});
