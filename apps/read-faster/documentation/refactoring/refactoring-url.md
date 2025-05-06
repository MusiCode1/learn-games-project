# מימוש הניווט עם URL

## מצב נוכחי

- הניווט מתבצע באמצעות פרמטרים ב-URL בפורמט `/practice?level=[level]&set=[set]&word=[word]`
- הפרמטרים מועברים ב-URL באופן ידני
- אין מבנה אחיד לניווט

## אפשרויות שנשקלו

### אפשרות 1: פורמט קצר יותר

**פורמט**: `/practice/[level]/[word]`

**יתרונות:**

- קצר יותר, נקי יותר

**חסרונות:**

- פחות ברור למה מתייחס כל פרמטר
- לא כולל את הסט

### אפשרות 2: פורמט עם query parameters

**פורמט**: `/practice?level=[level]&word=[word]`

**יתרונות:**

- סטנדרטי, קל לעבוד עם query parameters ב-SvelteKit

**חסרונות:**

- פחות "יפה" מבחינת SEO
- לא מתאים לארכיטקטורת תיקיות של SvelteKit

### אפשרות 3: פורמט עם hash

**פורמט**: `/practice#level=[level]&word=[word]`

**יתרונות:**

- לא גורם לטעינה מחדש של הדף בעת שינוי

**חסרונות:**

- לא נשמר בהיסטוריה של הדפדפן בצורה סטנדרטית
- פחות נתמך ב-SvelteKit

### אפשרות 4: פורמט עם סט

**פורמט**: `/practice/level/[level]/set/[set]/word/[word]`

**יתרונות:**

- מכיל את כל המידע הרלוונטי, כולל הסט
- ברור למה מתייחס כל פרמטר
- מתאים לארכיטקטורת תיקיות של SvelteKit

**חסרונות:**

- ארוך יותר

### אפשרות 5: פורמט עם slug

**פורמט**: `/practice/[level]-[word]`

**יתרונות:**

- קצר מאוד, נקי

**חסרונות:**

- פחות ברור, קשה יותר לפרסר
- לא כולל את הסט

## פתרון שנבחר

**אפשרות 4: פורמט עם סט**

בחרנו בגישה זו כי:

1. היא מכילה את כל המידע הרלוונטי, כולל הסט
2. היא ברורה ומובנת
3. היא מתאימה לארכיטקטורת תיקיות של SvelteKit
4. היא מאפשרת שיתוף קישורים למילים ספציפיות

## יישום מפורט

### 1. עדכון מבנה התיקיות:

```
src/routes/
├── practice/
│   ├── level/
│   │   └── [level]/
│   │       ├── set/
│   │       │   └── [set]/
│   │       │       ├── word/
│   │       │       │   └── [word]/
│   │       │       │       └── +page.svelte
│   │       │       └── +page.svelte
│   │       └── +page.svelte
│   ├── settings/
│   │   └── +page.svelte
│   └── +page.svelte
```

> **הערה חשובה**: מבנה התיקיות המוצע מורכב מדי ויוצר עומס תחזוקה. בשלב היישום נצטרך למצוא פתרון יעיל יותר, כמו שימוש ב-Catch-all Parameters (`[...rest]`) או Hash Navigation, שיאפשרו לנו לשמור על מבנה URL ברור אך עם פחות תיקיות פיזיות.

### 2. עדכון פונקציות הניווט:

```typescript
// src/lib/navigation.ts
import { goto } from '$app/navigation';
import type { Result } from '$lib/types';
import { success, failure } from '$lib/utils/result';

/**
 * ניווט לדף התרגול
 * @param level רמה
 * @param set סט
 * @param word מילה
 * @returns תוצאת הניווט
 */
export function navigateToPractice(level: number, set: number, word: number): Result<void, string> {
	try {
		goto(`/practice/level/${level}/set/${set}/word/${word}`);
		return success(undefined);
	} catch (e) {
		return failure('שגיאה בניווט לדף התרגול');
	}
}

/**
 * ניווט לדף ההגדרות
 * @returns תוצאת הניווט
 */
export function navigateToSettings(): Result<void, string> {
	try {
		goto('/practice/settings');
		return success(undefined);
	} catch (e) {
		return failure('שגיאה בניווט לדף ההגדרות');
	}
}

/**
 * ניווט לדף הבית
 * @returns תוצאת הניווט
 */
export function navigateToHome(): Result<void, string> {
	try {
		goto('/');
		return success(undefined);
	} catch (e) {
		return failure('שגיאה בניווט לדף הבית');
	}
}

/**
 * ניווט לדף הסיום
 * @param level רמה
 * @param set סט
 * @returns תוצאת הניווט
 */
export function navigateToCompletion(level: number, set: number): Result<void, string> {
	try {
		goto(`/practice/level/${level}/set/${set}`);
		return success(undefined);
	} catch (e) {
		return failure('שגיאה בניווט לדף הסיום');
	}
}
```

### 3. עדכון דף התרגול:

```svelte
<!-- src/routes/practice/level/[level]/set/[set]/word/[word]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { appState } from '$lib/state/appState';
	import { navigateToPractice, navigateToCompletion } from '$lib/navigation';
	import { match } from '$lib/utils/result';
	import PracticeScreen from '$lib/components/screens/PracticeScreen.svelte';

	// קריאת הפרמטרים מה-URL
	const level = parseInt($page.params.level, 10);
	const set = parseInt($page.params.set, 10);
	const word = parseInt($page.params.word, 10);

	// קריאה מהסטייט הגלובלי
	const settings = appState.user.progress;

	// עדכון הסטייט הגלובלי לפי הפרמטרים מה-URL
	if (settings.level !== level || settings.currentSet !== set) {
		const result = updateSettings({
			level,
			currentSet: set
		});

		match(
			result,
			() => {
				// עדכון מוצלח
			},
			(error) => {
				console.error('שגיאה בעדכון ההגדרות:', error);
			}
		);
	}

	// יצירת סטייט מקומי
	const state = $state({
		session: {
			words: [], // יאותחל בהמשך
			currentIndex: word - 1, // אינדקס המילה הנוכחית (0-based)
			wordsPerRepetition: settings.wordsPerSet,
			totalRepetitions: settings.repetitionsPerSet
		},
		ui: {
			isWordVisible: true,
			isImageVisible: false,
			direction: null,
			lastDirection: 'next'
		}
	});

	// טעינת המילים לסט הנוכחי
	onMount(() => {
		const result = getCurrentSetWords();
		match(
			result,
			(words) => {
				state.session.words = words;
			},
			(error) => {
				console.error('שגיאה בטעינת המילים:', error);
			}
		);
	});

	// פונקציות טיפול באירועים
	function handleNext() {
		// עדכון הסטייט המקומי
		state.ui.direction = 'next';
		state.ui.lastDirection = 'next';

		// ניווט למילה הבאה
		const result = navigateToPractice(level, set, word + 1);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}

	function handlePrev() {
		// עדכון הסטייט המקומי
		state.ui.direction = 'prev';
		state.ui.lastDirection = 'prev';

		// ניווט למילה הקודמת
		const result = navigateToPractice(level, set, word - 1);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}

	function handleFinish() {
		// ניווט לדף הסיום
		const result = navigateToCompletion(level, set);
		match(
			result,
			() => {
				// ניווט מוצלח
			},
			(error) => {
				console.error('שגיאה בניווט:', error);
			}
		);
	}
</script>

<PracticeScreen
	state={{
		user: {
			progress: settings
		},
		practice: {
			session: state.session,
			ui: state.ui
		}
	}}
	handlers={{
		onNext: handleNext,
		onPrev: handlePrev,
		onFinish: handleFinish,
		onExit: () => navigateToHome(),
		onImageCardClick: () => (state.ui.isImageVisible = !state.ui.isImageVisible),
		onWordCardClick: () => (state.ui.isWordVisible = !state.ui.isWordVisible)
	}}
/>
```

### 4. עדכון דף הסיום:

```svelte
<!-- src/routes/practice/level/[level]/set/[set]/+page.svelte -->
<script lang="ts">
	import { page } from '$app/stores';
	import { appState, updateSettings } from '$lib/state/appState';
	import { navigateToPractice, navigateToHome } from '$lib/navigation';
	import { match } from '$lib/utils/result';
	import PracticeCompletionScreen from '$lib/components/screens/PracticeCompletionScreen.svelte';

	// קריאת הפרמטרים מה-URL
	const level = parseInt($page.params.level, 10);
	const set = parseInt($page.params.set, 10);

	// קריאה מהסטייט הגלובלי
	const settings = appState.user.progress;

	// פונקציות טיפול באירועים
	function handleNextSet() {
		// עדכון הסטייט הגלובלי
		const result = updateSettings({
			currentSet: set + 1
		});

		match(
			result,
			() => {
				// ניווט לסט הבא
				navigateToPractice(level, set + 1, 1);
			},
			(error) => {
				console.error('שגיאה בעדכון ההגדרות:', error);
			}
		);
	}

	function handleRepeatSet() {
		// ניווט לסט הנוכחי מהתחלה
		navigateToPractice(level, set, 1);
	}
</script>

<PracticeCompletionScreen
	state={{
		user: {
			progress: settings
		},
		practice: {
			session: {
				words: [],
				currentIndex: 0,
				wordsPerRepetition: settings.wordsPerSet,
				totalRepetitions: settings.repetitionsPerSet
			},
			ui: {
				isWordVisible: true,
				isImageVisible: false,
				direction: null,
				lastDirection: 'next'
			}
		}
	}}
	handlers={{
		onNextSet: handleNextSet,
		onRepeatSet: handleRepeatSet,
		onHome: () => navigateToHome(),
		onExit: () => navigateToHome()
	}}
/>
```
