import type { ComponentType } from 'svelte';

// ===== ממשקים בסיסיים =====

/** אפשרויות עיצוב לכרטיס */
export interface CardStyleOptions {
	/** class CSS נוסף לכרטיס */
	className?: string;

	/** פריסת התוכן בתוך הכרטיס */
	contentLayout?: 'center' | 'vertical' | 'horizontal';

	/** גודל פונט בסיסי (CSS value) */
	fontSize?: string;

	/** padding פנימי (CSS value) */
	padding?: string;

	/** האם להסתיר את הרקע הבסיסי של הכרטיס */
	transparentBackground?: boolean;
}

/** פריט תוכן בודד */
export interface ContentItem<T = unknown> {
	id: string;
	value: T;
	label: string; // שם בעברית
}

/** תוכן כרטיס (נשמר במשחק) */
export interface CardContent {
	providerId: string;
	itemId: string;
	data: unknown; // מידע ספציפי לתוכן (צבע לצורות, וכו')
}

// ===== ממשק ספק תוכן =====

/**
 * ממשק בסיסי לספק תוכן (Content Provider)
 * מאפשר הוספת סוגי תוכן חדשים למשחק בקלות
 */
export interface ContentProvider<TItem = unknown, TSettings = unknown> {
	// === מזהים ===
	/** מזהה ייחודי לספק */
	id: string;

	/** שם להצגה בעברית */
	displayName: string;

	/** אייקון (emoji) */
	icon: string;

	// === נתונים ===
	/** רשימת הפריטים הזמינים */
	getAvailableItems(): ContentItem<TItem>[];

	/** הגדרות ברירת מחדל */
	getDefaultSettings(): TSettings;

	// === לוגיקת משחק ===
	/** יצירת תוכן לכרטיס */
	generateCardContent(item: TItem, settings: TSettings): CardContent;

	/** השוואת תוכן (לבדיקת התאמה) */
	contentMatches(a: CardContent, b: CardContent): boolean;

	// === רכיבי תצוגה ===
	/** רכיב Svelte לתוכן הכרטיס */
	renderComponent: ComponentType;

	/** רכיב להגדרות (אופציונלי) */
	settingsComponent?: ComponentType;

	// === עיצוב כרטיס (אופציונלי) ===
	/** אפשרויות עיצוב מותאמות לכרטיס */
	cardStyles?: CardStyleOptions;
}

// ===== פונקציות עזר =====

/** Type guard לבדיקה אם ערך הוא provider תקין */
export function isContentProvider(value: unknown): value is ContentProvider {
	if (typeof value !== 'object' || value === null) return false;

	const provider = value as ContentProvider;
	return (
		typeof provider.id === 'string' &&
		typeof provider.displayName === 'string' &&
		typeof provider.icon === 'string' &&
		typeof provider.getAvailableItems === 'function' &&
		typeof provider.getDefaultSettings === 'function' &&
		typeof provider.generateCardContent === 'function' &&
		typeof provider.contentMatches === 'function' &&
		typeof provider.renderComponent === 'function'
	);
}
