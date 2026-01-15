import type { ContentProvider } from './types';

/**
 * רישום ספקי תוכן (Content Providers Registry)
 * מאפשר רישום, שליפה וניהול של ספקי תוכן במשחק
 */
class ContentProviderRegistry {
	private providers = new Map<string, ContentProvider>();

	/**
	 * רישום ספק תוכן חדש
	 * אם ספק עם אותו ID כבר קיים, הוא יידרס (תמיכה ב-HMR)
	 */
	register(provider: ContentProvider): void {
		this.providers.set(provider.id, provider);
	}

	/**
	 * שליפת ספק לפי ID
	 * @throws Error אם הספק לא קיים
	 */
	get(id: string): ContentProvider {
		const provider = this.providers.get(id);
		if (!provider) {
			throw new Error(`Provider with id "${id}" not found`);
		}
		return provider;
	}

	/**
	 * בדיקה אם ספק קיים
	 */
	has(id: string): boolean {
		return this.providers.has(id);
	}

	/**
	 * שליפת כל הספקים
	 */
	getAll(): ContentProvider[] {
		return Array.from(this.providers.values());
	}

	/**
	 * מחיקת ספק
	 */
	unregister(id: string): boolean {
		return this.providers.delete(id);
	}

	/**
	 * ניקוי כל הספקים
	 */
	clear(): void {
		this.providers.clear();
	}
}

/** instance יחיד של ה-registry */
export const contentRegistry = new ContentProviderRegistry();
