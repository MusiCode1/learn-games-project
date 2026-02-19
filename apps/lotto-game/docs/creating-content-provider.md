# מדריך: יצירת ספק תוכן חדש (Content Provider)

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [מבנה הקבצים](#מבנה-הקבצים)
3. [ממשק ContentProvider](#ממשק-contentprovider)
4. [צעדים ליצירת Provider חדש](#צעדים-ליצירת-provider-חדש)
5. [דוגמה מלאה: ספק מספרים](#דוגמה-מלאה-ספק-מספרים)
6. [רישום ה-Provider](#רישום-ה-provider)
7. [Best Practices](#best-practices)
8. [עיצוב כרטיסים מותאם](#עיצוב-כרטיסים-מותאם)

---

## סקירה כללית

מערכת ספקי התוכן (Content Providers) מאפשרת להוסיף בקלות סוגי תוכן חדשים למשחק הלוטו.
כל ספק מגדיר:

- **מה** התוכן (אותיות, צורות, מספרים, תמונות, וכו')
- **איך** הוא מוצג (קומפוננטת Svelte)
- **איך** משווים בין כרטיסים (לוגיקת התאמה)
- **אילו** הגדרות זמינות למשתמש

הארכיטקטורה מבוססת על ממשק `ContentProvider` שמבטיח שכל ספק תוכן יישאר עצמאי ומנותק מיתר הקוד.

---

## מבנה הקבצים

כל ספק תוכן נמצא בתיקייה נפרדת תחת `src/lib/content/providers/`:

```
src/lib/content/providers/
├── letters/
│   ├── index.ts              # הגדרת ה-provider ורישום
│   ├── LetterContent.svelte  # קומפוננטת התצוגה
│   └── LettersSettings.svelte # קומפוננטת ההגדרות (אופציונלי)
├── shapes/
│   ├── index.ts
│   ├── ShapeContent.svelte
│   ├── ShapesSettings.svelte
│   └── ShapeSvg.svelte       # קומפוננטות עזר (אופציונלי)
└── your-provider/            # הספק שלך!
    ├── index.ts
    ├── YourContent.svelte
    └── YourSettings.svelte
```

---

## ממשק ContentProvider

הממשק המלא מוגדר ב-`src/lib/content/types.ts`:

```typescript
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

	// === ניהול פריטים נבחרים ===
	/** שליפת IDs של פריטים נבחרים מההגדרות */
	getSelectedItemIds(settings: TSettings): string[];

	/** עדכון פריטים נבחרים בהגדרות */
	updateSelectedItems(settings: TSettings, selectedIds: string[]): TSettings;

	// === רכיבי תצוגה ===
	/** רכיב Svelte לתוכן הכרטיס */
	renderComponent: ComponentType;

	/** רכיב להגדרות (אופציונלי) */
	settingsComponent?: ComponentType;

	// === עיצוב כרטיס (אופציונלי) ===
	/** אפשרויות עיצוב מותאמות לכרטיס */
	cardStyles?: CardStyleOptions;
}
```

### פירוט השדות

#### מזהים

- **`id`**: מזהה ייחודי באנגלית (לדוגמה: `'letters'`, `'shapes'`, `'numbers'`)
- **`displayName`**: שם בעברית שיוצג למשתמש בבחירת התוכן
- **`icon`**: emoji שמייצג את סוג התוכן (🔤, 🔷, 🔢)

#### נתונים

- **`getAvailableItems()`**: מחזירה מערך של כל הפריטים הזמינים
  - כל פריט צריך `id`, `value`, `label`
- **`getDefaultSettings()`**: מחזירה אובייקט הגדרות ברירת מחדל
  - ישמר ב-localStorage ויעבור לקומפוננטות

#### לוגיקת משחק

- **`generateCardContent(item, settings)`**: יוצרת תוכן לכרטיס בודד
  - מקבלת פריט והגדרות
  - מחזירה `CardContent` עם `providerId`, `itemId`, `data`
  - **חשוב**: כאן אפשר להוסיף רנדומליות (צבעים, וריאציות וכו')

- **`contentMatches(a, b)`**: בודקת אם שני כרטיסים מתאימים
  - **זו הלוגיקה המרכזית של המשחק!**
  - לדוגמה: אותה אות, אותה צורה באותו צבע, מספרים שווים
  - יכולה להיות פשוטה (`a.itemId === b.itemId`) או מורכבת יותר

#### ניהול פריטים נבחרים

- **`getSelectedItemIds(settings)`**: מחזירה את רשימת ה-IDs של הפריטים הנבחרים
  - מקבלת את אובייקט ההגדרות
  - מחזירה מערך של מחרוזות (IDs)
  - **חשוב**: זו המתודה שהמשחק משתמש בה כדי לדעת אילו פריטים לכלול

- **`updateSelectedItems(settings, selectedIds)`**: מחזירה הגדרות מעודכנות עם פריטים חדשים
  - מקבלת הגדרות נוכחיות ומערך IDs חדש
  - מחזירה אובייקט הגדרות חדש (immutable)
  - משמש בממשק ההגדרות לעדכון הבחירה

#### רכיבי תצוגה

- **`renderComponent`**: קומפוננטת Svelte שמציגה את התוכן בכרטיס
  - מקבלת props: `{ content: CardContent }`
  - **הערה**: צריך להוסיף `as any` בגלל בעיית typing ב-Svelte 5

- **`settingsComponent`** (אופציונלי): קומפוננטה להגדרות הספציפיות
  - מקבלת props: `{ selectedItems, onUpdate, availableItems }`
  - אם לא מוגדר, לא יהיו הגדרות נוספות מעבר לבחירת הפריטים

#### עיצוב כרטיס

- **`cardStyles`** (אופציונלי): אפשרויות עיצוב מותאמות
  - ראה [עיצוב כרטיסים מותאם](#עיצוב-כרטיסים-מותאם)

---

## צעדים ליצירת Provider חדש

### שלב 1: יצירת התיקייה והקבצים

```bash
mkdir src/lib/content/providers/your-provider
cd src/lib/content/providers/your-provider
```

צור 3 קבצים:
- `index.ts` - הגדרת ה-provider
- `YourContent.svelte` - קומפוננטת התצוגה
- `YourSettings.svelte` - קומפוננטת ההגדרות (אופציונלי)

### שלב 2: הגדרת טיפוסים והנתונים

ב-`index.ts`, הגדר:
1. את טיפוס הפריט (`TItem`)
2. את טיפוס ההגדרות (`TSettings`)
3. את רשימת הפריטים הזמינים
4. קבועים נוספים (צבעים, ברירות מחדל וכו')

### שלב 3: יישום הממשק

ב-`index.ts`, יצור אובייקט שמיישם את `ContentProvider`:

```typescript
export const yourProvider: ContentProvider<YourItemType, YourSettingsType> = {
	id: 'your-id',
	displayName: 'שם בעברית',
	icon: '🎯',
	
	getAvailableItems() { /* ... */ },
	getDefaultSettings() { /* ... */ },
	generateCardContent(item, settings) { /* ... */ },
	contentMatches(a, b) { /* ... */ },
	getSelectedItemIds(settings) { /* ... */ },
	updateSelectedItems(settings, selectedIds) { /* ... */ },
	
	renderComponent: YourContent as any,
	settingsComponent: YourSettings as any
};
```

### שלב 4: יצירת קומפוננטת התצוגה

ב-`YourContent.svelte`:

```svelte
<script lang="ts">
	import type { CardContent } from '$lib/content/types';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	// חילוץ הנתונים
	const data = content.data as YourDataType;
</script>

<div class="your-content">
	<!-- התצוגה שלך כאן -->
</div>

<style>
	@reference "tailwindcss";
	
	.your-content {
		/* Layout */
		@apply w-full h-full flex items-center justify-center;
		
		/* Visual */
		@apply font-bold text-2xl;
	}
</style>
```

**חשוב**: השתמש ב-`@apply` directives ב-`<style>` block במקום classes inline!

### שלב 5: יצירת קומפוננטת ההגדרות

ב-`YourSettings.svelte`:

```svelte
<script lang="ts">
	interface Props {
		selectedItems: string[];
		onUpdate: (items: string[]) => void;
		availableItems: YourItemType[];
	}

	let { selectedItems, onUpdate, availableItems }: Props = $props();

	function handleToggle(itemId: string) {
		if (selectedItems.includes(itemId)) {
			onUpdate(selectedItems.filter((id) => id !== itemId));
		} else {
			onUpdate([...selectedItems, itemId]);
		}
	}
</script>

<div class="your-settings">
	<!-- ממשק הבחירה שלך -->
	{#each availableItems as item}
		<button 
			onclick={() => handleToggle(item.id)}
			class:selected={selectedItems.includes(item.id)}
		>
			{item.label}
		</button>
	{/each}
</div>

<style>
	@reference "tailwindcss";
	/* סגנונות עם @apply */
</style>
```

### שלב 6: רישום ה-Provider

ב-`src/lib/content/providers/index.ts`, הוסף:

```typescript
// ייבוא מבצע רישום אוטומטי
export * from './letters';
export * from './shapes';
export * from './your-provider'; // <-- הוסף כאן!
```

וב-`src/lib/content/providers/your-provider/index.ts`, הוסף בסוף:

```typescript
import { contentRegistry } from '../../registry';
contentRegistry.register(yourProvider);
```

---

## דוגמה מלאה: ספק מספרים

נייצר ספק שמציג מספרים מ-1 עד 10:

### `numbers/index.ts`

```typescript
/**
 * ספק תוכן למספרים
 */
import type { ContentProvider, ContentItem, CardContent } from '$lib/content/types';
import NumberContent from './NumberContent.svelte';
import NumbersSettings from './NumbersSettings.svelte';
import { contentRegistry } from '../../registry';

/** הגדרת מספר */
export interface NumberDefinition {
	value: number;
	display: string; // ייצוג בעברית
}

/** רשימת המספרים 1-10 */
export const NUMBERS: NumberDefinition[] = [
	{ value: 1, display: '1 (אחת)' },
	{ value: 2, display: '2 (שתיים)' },
	{ value: 3, display: '3 (שלוש)' },
	{ value: 4, display: '4 (אַרבּע)' },
	{ value: 5, display: '5 (חמש)' },
	{ value: 6, display: '6 (שש)' },
	{ value: 7, display: '7 (שבע)' },
	{ value: 8, display: '8 (שמונה)' },
	{ value: 9, display: '9 (תשע)' },
	{ value: 10, display: '10 (עשר)' }
];

/** הגדרות ספק המספרים */
export interface NumbersProviderSettings {
	selectedNumbers: number[];
	showHebrew: boolean; // האם להציג גם את השם בעברית
}

/** תוכן מספר על כרטיס */
interface NumberContentData {
	value: number;
	showHebrew: boolean;
}

/** ספק המספרים */
export const numbersProvider: ContentProvider<NumberDefinition, NumbersProviderSettings> = {
	id: 'numbers',
	displayName: 'מספרים',
	icon: '🔢',

	getAvailableItems(): ContentItem<NumberDefinition>[] {
		return NUMBERS.map((num) => ({
			id: num.value.toString(),
			value: num,
			label: num.display
		}));
	},

	getDefaultSettings(): NumbersProviderSettings {
		return {
			selectedNumbers: NUMBERS.map((n) => n.value),
			showHebrew: false
		};
	},

	generateCardContent(
		number: NumberDefinition,
		settings: NumbersProviderSettings
	): CardContent {
		const data: NumberContentData = {
			value: number.value,
			showHebrew: settings.showHebrew
		};

		return {
			providerId: 'numbers',
			itemId: number.value.toString(),
			data
		};
	},

	contentMatches(a: CardContent, b: CardContent): boolean {
		const dataA = a.data as NumberContentData;
		const dataB = b.data as NumberContentData;

		// השוואה פשוטה של הערך המספרי
		return dataA.value === dataB.value;
	},

	getSelectedItemIds(settings: NumbersProviderSettings): string[] {
		return settings.selectedNumbers.map(n => n.toString());
	},

	updateSelectedItems(settings: NumbersProviderSettings, selectedIds: string[]): NumbersProviderSettings {
		return {
			...settings,
			selectedNumbers: selectedIds.map(id => parseInt(id, 10))
		};
	},

	renderComponent: NumberContent as any,
	settingsComponent: NumbersSettings as any,

	// עיצוב מותאם לכרטיסי מספרים
	cardStyles: {
		fontSize: '4rem',
		contentLayout: 'center'
	}
};

// רישום אוטומטי
contentRegistry.register(numbersProvider);
```

### `numbers/NumberContent.svelte`

```svelte
<script lang="ts">
	/**
	 * רכיב להצגת מספר בכרטיס
	 */
	import type { CardContent } from '$lib/content/types';

	interface Props {
		content: CardContent;
	}

	let { content }: Props = $props();

	interface NumberData {
		value: number;
		showHebrew: boolean;
	}

	const data = content.data as NumberData;

	// מיפוי למילים בעברית
	const HEBREW_NUMBERS: Record<number, string> = {
		1: 'אחת',
		2: 'שתיים',
		3: 'שלוש',
		4: 'אַרבּע',
		5: 'חמש',
		6: 'שש',
		7: 'שבע',
		8: 'שמונה',
		9: 'תשע',
		10: 'עשר'
	};
</script>

<div class="number-content">
	<div class="number-value">{data.value}</div>
	{#if data.showHebrew}
		<div class="number-hebrew">{HEBREW_NUMBERS[data.value]}</div>
	{/if}
</div>

<style>
	@reference "tailwindcss";

	.number-content {
		/* Layout */
		@apply w-full h-full flex flex-col items-center justify-center;

		/* Spacing */
		@apply gap-2;
	}

	.number-value {
		/* Visual */
		@apply font-bold text-6xl;
		@apply text-indigo-700;
	}

	.number-hebrew {
		/* Visual */
		@apply text-sm font-medium;
		@apply text-slate-500;
	}
</style>
```

### `numbers/NumbersSettings.svelte`

```svelte
<script lang="ts">
	/**
	 * רכיב הגדרות לספק המספרים
	 */
	import type { NumberDefinition } from './index';

	interface Props {
		selectedItems: string[];
		onUpdate: (items: string[]) => void;
		availableNumbers: NumberDefinition[];
		settings: { showHebrew: boolean };
		onSettingsUpdate: (settings: any) => void;
	}

	let { selectedItems, onUpdate, availableNumbers, settings, onSettingsUpdate }: Props = $props();

	function handleToggle(numId: string) {
		if (selectedItems.includes(numId)) {
			onUpdate(selectedItems.filter((id) => id !== numId));
		} else {
			onUpdate([...selectedItems, numId]);
		}
	}

	function handleSelectAll() {
		onUpdate(availableNumbers.map((n) => n.value.toString()));
	}

	function handleDeselectAll() {
		onUpdate([]);
	}

	function toggleHebrew() {
		onSettingsUpdate({ ...settings, showHebrew: !settings.showHebrew });
	}
</script>

<div class="numbers-settings" dir="rtl">
	<div class="header">
		<h3 class="title">בחירת מספרים ({selectedItems.length})</h3>
		<div class="actions">
			<button onclick={handleSelectAll} class="action-btn">בחר הכל</button>
			<span>|</span>
			<button onclick={handleDeselectAll} class="action-btn">נקה הכל</button>
		</div>
	</div>

	<div class="numbers-grid">
		{#each availableNumbers as num}
			{@const isSelected = selectedItems.includes(num.value.toString())}
			<button onclick={() => handleToggle(num.value.toString())} class="number-btn" class:selected={isSelected}>
				{num.value}
			</button>
		{/each}
	</div>

	<div class="extra-settings">
		<label class="checkbox-label">
			<input type="checkbox" checked={settings.showHebrew} onchange={toggleHebrew} />
			<span>הצג גם שם בעברית</span>
		</label>
	</div>
</div>

<style>
	@reference "tailwindcss";

	.numbers-settings {
		/* Layout */
		@apply w-full;
	}

	.header {
		/* Layout */
		@apply flex justify-between items-center;

		/* Spacing */
		@apply mb-4;
	}

	.title {
		/* Visual */
		@apply font-bold text-slate-700;
		@apply m-0;
	}

	.actions {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-2;

		/* Visual */
		@apply text-sm;
	}

	.action-btn {
		/* Spacing */
		@apply px-2 py-1;

		/* Visual */
		@apply rounded text-indigo-600;
		@apply bg-transparent border-0;

		/* Interactive */
		@apply cursor-pointer transition-colors;
	}

	.action-btn:hover {
		/* Visual */
		@apply bg-indigo-50;
	}

	.numbers-grid {
		/* Layout */
		@apply grid grid-cols-5;

		/* Spacing */
		@apply gap-3 mb-4;
	}

	.number-btn {
		/* Layout */
		@apply aspect-square flex items-center justify-center;

		/* Visual */
		@apply rounded-lg font-bold text-xl;
		@apply bg-slate-100 text-slate-400;
		@apply border-0;

		/* Interactive */
		@apply transition-all cursor-pointer;
	}

	.number-btn:hover:not(.selected) {
		/* Visual */
		@apply bg-slate-200;
	}

	.number-btn.selected {
		/* Visual */
		@apply bg-indigo-600 text-white shadow-md;

		/* Interactive */
		@apply scale-105;
	}

	.extra-settings {
		/* Spacing */
		@apply pt-4;

		/* Visual */
		@apply border-t border-slate-200;
	}

	.checkbox-label {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-2;

		/* Interactive */
		@apply cursor-pointer;
	}
</style>
```

---

## רישום ה-Provider

לאחר יצירת הספק, יש לרשום אותו:

### אופציה 1: רישום אוטומטי (מומלץ)

בסוף קובץ `index.ts` של הספק:

```typescript
import { contentRegistry } from '../../registry';
contentRegistry.register(yourProvider);
```

ואז ב-`src/lib/content/providers/index.ts`:

```typescript
export * from './your-provider';
```

### אופציה 2: רישום ידני

ב-`src/routes/+layout.svelte` או בכל מקום שרץ בהתחלה:

```typescript
import { contentRegistry } from '$lib/content';
import { yourProvider } from '$lib/content/providers/your-provider';

contentRegistry.register(yourProvider);
```

---

## Best Practices

### 1. ארגון קוד

- **תיקייה נפרדת לכל provider** - שמור על ארגון ברור
- **קומפוננטות עזר** - אם צריך קומפוננטות נוספות (כמו `ShapeSvg`), שים אותן באותה תיקייה
- **ייצוא טיפוסים** - ייצא את הטיפוסים שלך מ-`index.ts` למקרה שמישהו יצטרך אותם

### 2. טיפוס וטיפול בשגיאות

```typescript
// ✅ טוב - type assertion בטוח
const data = content.data as YourDataType;
if (!data || !data.someField) {
	console.error('Invalid content data');
	return null;
}

// ❌ לא טוב - ללא בדיקה
const value = (content.data as any).someField;
```

### 3. עיצוב עם Tailwind

- **השתמש רק ב-`@apply`** - אל תשתמש ב-classes inline
- **ארגן לפי קטגוריות** - Layout, Spacing, Visual, Interactive
- **Container queries** - שקול להשתמש ב-`@container` למרחב מוגבל

```svelte
<style>
	@reference "tailwindcss";
	
	.your-class {
		/* Layout */
		@apply flex items-center justify-center;
		
		/* Spacing */
		@apply p-4 gap-2;
		
		/* Visual */
		@apply bg-white rounded-lg shadow-md;
		@apply text-gray-800 font-bold;
		
		/* Interactive */
		@apply hover:shadow-lg transition-all cursor-pointer;
	}
</style>
```

### 4. הגדרות ברירת מחדל

```typescript
getDefaultSettings(): YourSettings {
	return {
		// הגדרות שמתאימות לרוב המשתמשים
		selectedItems: this.getAvailableItems().map(i => i.id),
		someOption: true,
		// ערכים סבירים שלא ידרשו שינוי מיידי
	};
}
```

### 5. לוגיקת התאמה

```typescript
contentMatches(a: CardContent, b: CardContent): boolean {
	// בדוק תחילה שזה אותו provider
	if (a.providerId !== this.id || b.providerId !== this.id) {
		return false;
	}
	
	const dataA = a.data as YourDataType;
	const dataB = b.data as YourDataType;
	
	// לוגיקה ספציפית
	return dataA.mainField === dataB.mainField;
}
```

### 6. ניהול פריטים נבחרים

```typescript
// פשוט - עבור מערך IDs
getSelectedItemIds(settings: YourSettings): string[] {
	// חשוב: החזר עותק של המערך (immutability)
	return [...settings.selectedItems];
}

updateSelectedItems(settings: YourSettings, selectedIds: string[]): YourSettings {
	// החזר אובייקט חדש (immutability)
	return { ...settings, selectedItems: selectedIds };
}

// מורכב יותר - עבור מערך מספרים
getSelectedItemIds(settings: NumbersSettings): string[] {
	// המרה למחרוזות והחזרת עותק
	return settings.selectedNumbers.map(n => n.toString());
}

updateSelectedItems(settings: NumbersSettings, selectedIds: string[]): NumbersSettings {
	// המרה חזרה למספרים והחזרת אובייקט חדש
	return {
		...settings,
		selectedNumbers: selectedIds.map(id => parseInt(id, 10))
	};
}
```

**חשוב**: שתי המתודות חייבות לשמור על immutability:
- `getSelectedItemIds` - תמיד החזר עותק של המערך, לא את המערך המקורי
- `updateSelectedItems` - תמיד החזר אובייקט חדש, אל תשנה את ההגדרות המקוריות

### 7. HMR (Hot Module Reload)

ה-Registry תומך ב-HMR - אם תייבא את הספק מחדש, הוא פשוט יידרס.
אין צורך בקוד מיוחד.

### 8. בדיקות

לפני שמפרסמים ספק חדש, בדוק:
- ✅ הספק נטען ומופיע ברשימה
- ✅ אפשר לבחור פריטים בהגדרות
- ✅ הכרטיסים מוצגים נכון
- ✅ לוגיקת ההתאמה עובדת (זוגות תקינים מזוהים)
- ✅ ההגדרות נשמרות ב-localStorage
- ✅ HMR עובד (שינויים בקוד מתעדכנים מיד)

---

## עיצוב כרטיסים מותאם

אפשר להתאים את עיצוב הכרטיס לסוג התוכן דרך `cardStyles`:

```typescript
export const yourProvider: ContentProvider<...> = {
	// ...
	cardStyles: {
		// class CSS נוסף לכרטיס
		className: 'your-custom-card',
		
		// פריסת התוכן: 'center' | 'vertical' | 'horizontal'
		contentLayout: 'vertical',
		
		// גודל פונט
		fontSize: '3rem',
		
		// padding פנימי
		padding: '2rem',
		
		// רקע שקוף (לתוכן עם רקע משלו)
		transparentBackground: false
	}
};
```

### דוגמאות לשימוש

#### תוכן גדול (מספרים, אותיות)
```typescript
cardStyles: {
	fontSize: '5rem',
	contentLayout: 'center'
}
```

#### תוכן עם טקסט ותמונה
```typescript
cardStyles: {
	contentLayout: 'vertical',
	padding: '1.5rem'
}
```

#### תוכן עם רקע משלו (תמונות, SVG מלא)
```typescript
cardStyles: {
	transparentBackground: true,
	padding: '0'
}
```

---

## סיכום

יצירת ספק תוכן חדש היא תהליך פשוט וישיר:

1. ✅ צור תיקייה חדשה תחת `providers/`
2. ✅ הגדר את הטיפוסים והנתונים ב-`index.ts`
3. ✅ יישם את ממשק `ContentProvider` (כולל `getSelectedItemIds` ו-`updateSelectedItems`)
4. ✅ צור קומפוננטת תצוגה (`.svelte`)
5. ✅ צור קומפוננטת הגדרות (אופציונלי)
6. ✅ רשום את הספק ב-Registry
7. ✅ ייצא מ-`providers/index.ts`

**זהו!** הספק החדש יופיע אוטומטית בבחירת התוכן ויהיה זמין למשחק.

### שאלות נפוצות

**ש: האם חייב settingsComponent?**
ת: לא, זה אופציונלי. אם לא מוגדר, יהיה רק בחירה בסיסית של הפריטים.

**ש: מה זה ה-`as any` ליד הקומפוננטות?**
ת: זה workaround זמני לבעיית typing ב-Svelte 5. ה-TypeScript לא תמיד מזהה נכון את הטיפוס של קומפוננטות Svelte.

**ש: איך מוסיפים אנימציות?**
ת: בקומפוננטת התצוגה שלך, השתמש ב-Svelte transitions או CSS animations רגילים.

**ש: אפשר לטעון תוכן מ-API חיצוני?**
ת: כן! `getAvailableItems()` יכולה להיות async ולטעון מ-API. רק שים לב שיש לטפל ב-loading state.

**ש: איך מוסיפים קול לכרטיסים?**
ת: בקומפוננטת התצוגה, אפשר להשתמש ב-`sound.ts` utility שכבר קיים בפרויקט.

---

**מוכנים להתחיל? צרו את הספק הראשון שלכם!** 🚀
