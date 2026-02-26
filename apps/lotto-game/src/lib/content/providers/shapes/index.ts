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

/** רשימת הצבעים הזמינים — 20 צבעים מובחנים לתמיכה בעד 20 זוגות */
const COLORS = [
	// === צבעים בסיסיים (12 — מובחנים מאוד) ===
	'#EF4444', // אדום
	'#F97316', // כתום
	'#EAB308', // צהוב
	'#84CC16', // ליים
	'#22C55E', // ירוק
	'#14B8A6', // טורקיז
	'#3B82F6', // כחול
	'#A855F7', // סגול
	'#D946EF', // פוקסיה
	'#EC4899', // ורוד
	'#92400E', // חום
	'#6B7280', // אפור
	// === צבעים נוספים (8 — מובחנים מספיק עם שילוב צורות) ===
	'#06B6D4', // ציאן
	'#4338CA', // אינדיגו
	'#D97706', // ענבר
	'#047857', // אמרלד
	'#F43F5E', // ורדרד
	'#1E3A8A', // כחול כהה
	'#881337', // בורדו
	'#4D7C0F'  // זית
];

/** הצבע המוגדר כברירת מחדל למצב אחיד */
const DEFAULT_UNIFORM_COLOR = '#3B82F6'; // כחול

/**
 * מאגר צבעים מעורבב — מבטיח צבע ייחודי לכל זוג במשחק.
 * מתאפס בתחילת כל משחק דרך prepareForGame().
 */
let shuffledColorPool: string[] = [];
let colorPoolIndex = 0;

function resetColorPool() {
	shuffledColorPool = [...COLORS].sort(() => Math.random() - 0.5);
	colorPoolIndex = 0;
}

function getNextUniqueColor(): string {
	if (colorPoolIndex >= shuffledColorPool.length) {
		// אם נגמרו הצבעים (יותר זוגות מצבעים), ערבב מחדש
		resetColorPool();
	}
	return shuffledColorPool[colorPoolIndex++];
}

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

	prepareForGame() {
		resetColorPool();
	},

	generateCardContent(shape: ShapeDefinition, settings: ShapesProviderSettings): CardContent {
		// קביעת צבע לפי מצב הצבעים
		let color: string;

		if (settings.colorMode === 'uniform') {
			color = DEFAULT_UNIFORM_COLOR;
		} else {
			// צבע ייחודי מהמאגר המעורבב
			color = getNextUniqueColor();
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