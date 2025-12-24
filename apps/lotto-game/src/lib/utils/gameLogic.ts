// ===== טיפוסים =====

/** סוג התוכן על הכרטיסים */
export type ContentType = 'letters' | 'shapes';

/** מצב הצבעים לצורות */
export type ColorMode = 'uniform' | 'random';

/** הגדרת צורה גיאומטרית */
export interface ShapeDefinition {
	id: string;
	name: string; // שם בעברית
}

/** תוכן צורה על כרטיס (צורה + צבע) */
export interface ShapeContent {
	shapeId: string;
	color: string;
}

/** כרטיס במשחק */
export interface Card {
	id: number;
	content: string | ShapeContent; // אות עברית או צורה
	isSelected: boolean;
	isMatched: boolean;
	isError?: boolean;
}

// ===== קבועים =====

/** רשימת האותיות העבריות */
export const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');

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
export const COLORS = [
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
export const DEFAULT_UNIFORM_COLOR = '#3B82F6'; // כחול

// ===== פונקציות עזר =====

/** בחירת צבע רנדומלי מהרשימה */
function getRandomColor(): string {
	return COLORS[Math.floor(Math.random() * COLORS.length)];
}

/** בחירת items רנדומליים או עם חזרות */
function selectItems<T>(items: T[], count: number): T[] {
	if (items.length === 0) return [];

	const result: T[] = [];

	if (items.length >= count) {
		// יש מספיק פריטים - בחר subset רנדומלי
		const shuffled = [...items].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, count);
	} else {
		// לא מספיק פריטים - צריך לחזור על חלקם
		result.push(...items);
		const remaining = count - items.length;
		for (let i = 0; i < remaining; i++) {
			result.push(items[Math.floor(Math.random() * items.length)]);
		}
		return result;
	}
}

// ===== פונקציות ייצור כרטיסים =====

/** פרמטרים ליצירת כרטיסים */
export interface GenerateCardsParams {
	pairCount: number;
	contentType: ContentType;
	selectedLetters?: string[];
	selectedShapes?: string[]; // מזהי הצורות
	colorMode?: ColorMode;
}

/** יצירת כרטיסים למשחק */
export function generateCards(params: GenerateCardsParams): Card[] {
	const {
		pairCount,
		contentType,
		selectedLetters = [],
		selectedShapes = [],
		colorMode = 'uniform'
	} = params;

	if (contentType === 'letters') {
		return generateLetterCards(pairCount, selectedLetters);
	} else {
		return generateShapeCards(pairCount, selectedShapes, colorMode);
	}
}

/** יצירת כרטיסי אותיות */
function generateLetterCards(pairCount: number, selectedLetters: string[]): Card[] {
	if (selectedLetters.length === 0) return [];

	const gameLetters = selectItems(selectedLetters, pairCount);
	const cards: Card[] = [];

	gameLetters.forEach((letter) => {
		// כרטיס ראשון בזוג
		cards.push({
			id: Math.random(),
			content: letter,
			isSelected: false,
			isMatched: false
		});
		// כרטיס שני בזוג
		cards.push({
			id: Math.random(),
			content: letter,
			isSelected: false,
			isMatched: false
		});
	});

	// ערבוב הכרטיסים
	return cards.sort(() => Math.random() - 0.5);
}

/** יצירת כרטיסי צורות */
function generateShapeCards(
	pairCount: number,
	selectedShapeIds: string[],
	colorMode: ColorMode
): Card[] {
	if (selectedShapeIds.length === 0) return [];

	const gameShapeIds = selectItems(selectedShapeIds, pairCount);
	const cards: Card[] = [];

	// יצירת מיפוי צורה -> צבע
	// כך שכל הכרטיסים מאותה צורה יהיו באותו צבע (גם אם יש חזרות)
	const shapeColorMap = new Map<string, string>();

	if (colorMode === 'uniform') {
		// מצב אחיד - כל הצורות באותו צבע
		for (const shapeId of selectedShapeIds) {
			shapeColorMap.set(shapeId, DEFAULT_UNIFORM_COLOR);
		}
	} else {
		// מצב רנדומלי - כל צורה מקבלת צבע אחר
		const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
		const uniqueShapes = [...new Set(gameShapeIds)];

		uniqueShapes.forEach((shapeId, index) => {
			// שימוש בצבעים בצורה מחזורית אם יש יותר צורות מצבעים
			shapeColorMap.set(shapeId, shuffledColors[index % shuffledColors.length]);
		});
	}

	gameShapeIds.forEach((shapeId) => {
		// קבלת הצבע מהמיפוי
		const shapeColor = shapeColorMap.get(shapeId) || DEFAULT_UNIFORM_COLOR;

		const shapeContent: ShapeContent = {
			shapeId,
			color: shapeColor
		};

		// כרטיס ראשון בזוג
		cards.push({
			id: Math.random(),
			content: shapeContent,
			isSelected: false,
			isMatched: false
		});
		// כרטיס שני בזוג
		cards.push({
			id: Math.random(),
			content: shapeContent,
			isSelected: false,
			isMatched: false
		});
	});

	// ערבוב הכרטיסים
	return cards.sort(() => Math.random() - 0.5);
}

// ===== פונקציות עזר לזיהוי תוכן =====

/** בדיקה אם התוכן הוא צורה */
export function isShapeContent(content: string | ShapeContent): content is ShapeContent {
	return typeof content === 'object' && 'shapeId' in content;
}

/** השוואת תוכן שני כרטיסים */
export function contentMatches(
	content1: string | ShapeContent,
	content2: string | ShapeContent
): boolean {
	if (typeof content1 === 'string' && typeof content2 === 'string') {
		return content1 === content2;
	}
	if (isShapeContent(content1) && isShapeContent(content2)) {
		return content1.shapeId === content2.shapeId && content1.color === content2.color;
	}
	return false;
}
