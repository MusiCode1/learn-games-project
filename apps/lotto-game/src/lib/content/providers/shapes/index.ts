/**
 * ספק תוכן לצורות גיאומטריות
 */
import type { ContentProvider, ContentItem, CardContent } from '$lib/content/types';
import ShapeContent from './ShapeContent.svelte';
import ShapesSettings from './ShapesSettings.svelte';
import { contentRegistry } from '../../registry';

/** הגדרת צורה גיאומטרית */
export interface ShapeDefinition {
	id: string;
	name: string; // שם בעברית
}

/** רשימת הצורות הגיאומטריות הזמינות */
export const SHAPES: ShapeDefinition[] = [
	{ id: 'circle', name: 'עיגול' },
	{ id: 'square', name: 'ריבוע' },
	{ id: 'triangle', name: 'משולש' },
	{ id: 'star', name: 'כוכב' },
	{ id: 'heart', name: 'לב' },
	{ id: 'diamond', name: 'מעוין' },
	{ id: 'hexagon', name: 'משושה' },
	{ id: 'semicircle', name: 'חצי עיגול' },
	{ id: 'pentagon', name: 'מחומש' },
	{ id: 'cross', name: 'פלוס' }
];

/** רשימת הצבעים הזמינים */
const COLORS = [
	'#EF4444', // אדום
	'#3B82F6', // כחול
	'#22C55E', // ירוק
	'#A855F7', // סגול
	'#F97316', // כתום
	'#EC4899', // ורוד
	'#14B8A6', // טורקיז
	'#EAB308' // צהוב
];

/** הצבע המוגדר כברירת מחדל למצב אחיד */
const DEFAULT_UNIFORM_COLOR = '#3B82F6'; // כחול

/** הגדרות ספק הצורות */
export interface ShapesProviderSettings {
	selectedShapes: string[];
	colorMode: 'uniform' | 'random';
}

/** תוכן צורה על כרטיס */
interface ShapeContentData {
	shapeId: string;
	color: string;
}

/** ספק הצורות */
export const shapesProvider: ContentProvider<ShapeDefinition, ShapesProviderSettings> = {
	id: 'shapes',
	displayName: 'צורות',
	icon: '🔷',

	getAvailableItems(): ContentItem<ShapeDefinition>[] {
		return SHAPES.map((shape) => ({
			id: shape.id,
			value: shape,
			label: shape.name
		}));
	},

	getDefaultSettings(): ShapesProviderSettings {
		return {
			selectedShapes: SHAPES.map((s) => s.id),
			colorMode: 'random'
		};
	},

	generateCardContent(shape: ShapeDefinition, settings: ShapesProviderSettings): CardContent {
		// קביעת צבע לפי מצב הצבעים
		let color: string;

		if (settings.colorMode === 'uniform') {
			color = DEFAULT_UNIFORM_COLOR;
		} else {
			// צבע רנדומלי
			color = COLORS[Math.floor(Math.random() * COLORS.length)];
		}

		const data: ShapeContentData = {
			shapeId: shape.id,
			color
		};

		return {
			providerId: 'shapes',
			itemId: shape.id,
			data
		};
	},

	contentMatches(a: CardContent, b: CardContent): boolean {
		const dataA = a.data as ShapeContentData;
		const dataB = b.data as ShapeContentData;

		// השוואה של צורה וצבע
		return dataA.shapeId === dataB.shapeId && dataA.color === dataB.color;
	},

	getSelectedItemIds(settings: ShapesProviderSettings): string[] {
		return [...settings.selectedShapes];
	},

	updateSelectedItems(settings: ShapesProviderSettings, selectedIds: string[]): ShapesProviderSettings {
		return { ...settings, selectedShapes: selectedIds };
	},

	renderComponent: ShapeContent as any,
	settingsComponent: ShapesSettings as any
};

// רישום אוטומטי
contentRegistry.register(shapesProvider);