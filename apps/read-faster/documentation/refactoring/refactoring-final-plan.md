# תכנית ריפקטורינג מפורטת

## טיפוסים לריפקטורינג

### טיפוסים בסיסיים

```typescript
// src/lib/types/index.ts

// טיפוס למילה
export interface Word {
	text: string; // טקסט המילה עם ניקוד
	image?: string | false; // נתיב לתמונה (אופציונלי)
	level: number; // רמת הקושי
	type?: 'verb'; // סוג המילה (אופציונלי)
}

// רשימת מילים
export type WordList = Word[];

// טיפוס להגדרות התרגול
export interface PracticeSettings {
	wordsPerSet: number; // מספר מילים בכל סט
	currentSet: number; // סט נוכחי
	repetitionsPerSet: number; // מספר חזרות לכל סט
	hideAfterSeconds: number; // זמן הסתרת המילה בשניות
	level: number; // שלב נוכחי
}

// טיפוס למצב הסשן
export interface SessionState {
	words: Word[]; // רשימת המילים בסשן
	currentIndex: number; // אינדקס המילה הנוכחית
	wordsPerRepetition: number; // מספר מילים בכל חזרה
	totalRepetitions: number; // מספר חזרות כולל
}

// טיפוס למצב התצוגה
export interface UIState {
	isWordVisible: boolean; // האם המילה מוצגת
	isImageVisible: boolean; // האם התמונה מוצגת
	direction: 'next' | 'prev' | null; // כיוון האנימציה
	lastDirection: 'next' | 'prev'; // כיוון האנימציה האחרון
}
```

### טיפוסים לסטייט הגלובלי

```typescript
// src/lib/types/index.ts

// טיפוס לסטייט הגלובלי
export interface AppState {
	// נתוני המשתמש
	user: {
		progress: PracticeSettings;
	};

	// נתוני התרגול
	practice: {
		// מילים לפי רמה
		wordsByLevel: Record<number, WordList>;
	};
}

// טיפוס לתוצאה של פעולה
export type Result<T, E> = { success: true; value: T } | { success: false; error: E };
```

### טיפוסים לפרופס של קומפוננטות

```typescript
// src/lib/types/index.ts

// טיפוס לפרופס של קומפוננטות המסך
export interface ScreenProps {
	// מצב התרגול
	state: {
		// נתוני המשתמש
		user: {
			progress: PracticeSettings;
		};

		// נתוני התרגול
		practice: {
			// מצב הסשן הנוכחי
			session: SessionState;

			// מצב התצוגה הנוכחי
			ui: UIState;
		};
	};

	// פונקציות טיפול באירועים
	handlers: {
		// פונקציות משותפות לכל המסכים
		onExit: () => void; // יציאה מהתרגול
	};
}

// טיפוס לפרופס של PracticeScreen
export interface PracticeScreenProps extends ScreenProps {
	// הרחבת handlers עם פונקציות ספציפיות למסך התרגול
	handlers: ScreenProps['handlers'] & {
		onNext: () => void; // מעבר למילה הבאה
		onPrev: () => void; // מעבר למילה הקודמת
		onFinish: () => void; // סיום הסט
		onImageCardClick: () => void; // לחיצה על כרטיסיית התמונה
		onWordCardClick: () => void; // לחיצה על כרטיסיית המילה
	};
}

// טיפוס לפרופס של PracticeSettingsScreen
export interface PracticeSettingsProps extends ScreenProps {
	// הרחבת handlers עם פונקציות ספציפיות למסך ההגדרות
	handlers: ScreenProps['handlers'] & {
		onStartPractice: (settings: PracticeSettings) => void; // התחלת תרגול
		onBack: () => void; // חזרה למסך הקודם
	};

	// מספר השלבים המקסימלי
	maxLevel: number;
}

// טיפוס לפרופס של PracticeCompletionScreen
export interface PracticeCompletionProps extends ScreenProps {
	// הרחבת handlers עם פונקציות ספציפיות למסך הסיום
	handlers: ScreenProps['handlers'] & {
		onNextSet: () => void; // מעבר לסט הבא
		onRepeatSet: () => void; // חזרה על הסט הנוכחי
		onHome: () => void; // חזרה למסך הבית
	};
}
```

### הערות לטיפוסים

1. **השלב והמילה הנוכחית** - נמצאים ב-URL ומשם מועברים לקומפוננטות הרלוונטיות. ה-URL מתעדכן בעת מעבר בין מילים. זה מאפשר שיתוף קישורים למילים ספציפיות.

2. **מצב הסשן והתצוגה** - לא יהיו בהכרח בסטייט הגלובלי. ביישום נחליט כל אחד מהם באילו קומפוננטות הוא יהיה זמין. למשל, מצב התצוגה (UIState) יהיה רלוונטי רק לקומפוננטת PracticeScreen, ולכן אין צורך לשמור אותו בסטייט הגלובלי.

3. **טיפוס Result** - משמש לטיפול בשגיאות בצורה פונקציונלית, במקום להשתמש ב-try/catch.

4. **אחידות בפרופס** - כל הקומפוננטות מקבלות את אותו מבנה בסיסי של פרופס (state ו-handlers), עם הרחבות ספציפיות לכל קומפוננטה. זה מבטיח אחידות בכל הקוד.

5. **סך הסטים** - חלק מהטיפוסים מתייחסים לסך הסטים, אך זה עדיין לא ממומש במלואו. יושלם בהמשך.

## 1. ניהול הסטייט

### מצב נוכחי

- הסטייט מועבר כמאפיינים בודדים רבים בין קומפוננטות (למשל, PracticeScreen מקבלת כ-20 מאפיינים נפרדים)
- פרמטרים רבים מועברים ב-URL (wordsPerSet, set, repetitions, hideAfterSeconds, wordIndex, level)
- אין מבנה אחיד להעברת הסטייט
- עדכונים לסטייט מתבצעים במקומות שונים

### אפשרויות שנשקלו

#### אפשרות 1: סטייט גלובלי ריאקטיבי (Svelte Stores)

**יתרונות:**

- עדכון אוטומטי של הקומפוננטות כשהסטייט משתנה
- אפשרות להירשם לשינויים ספציפיים
- אינטגרציה טובה עם Svelte

**חסרונות:**

- מורכבות נוספת
- overhead קטן של ביצועים
- פחות שליטה בזמן ובאופן שבו הסטייט מתעדכן
- פחות תואם לגישה פונקציונלית

#### אפשרות 2: אובייקט JavaScript רגיל (לא ריאקטיבי)

**יתרונות:**

- פשטות - אין צורך במנגנון ריאקטיביות
- ביצועים טובים יותר - אין overhead של מעקב אחרי שינויים
- שליטה מלאה - ידוע בדיוק מתי ואיך הסטייט מתעדכן
- תואם יותר לגישה פונקציונלית

**חסרונות:**

- צריך לדאוג ידנית לרנדור מחדש של הקומפוננטות כשהסטייט משתנה
- אין התראות אוטומטיות על שינויים

#### אפשרות 3: שילוב - סטייט גלובלי + פרמטרים מינימליים ב-URL

**יתרונות:**

- שילוב היתרונות של שתי הגישות
- שמירת פרמטרים חשובים ב-URL מאפשרת שיתוף קישורים וסימניות
- סטייט גלובלי מפשט את העברת שאר הפרמטרים

**חסרונות:**

- מורכבות מסוימת בניהול שני מקורות מידע

### פתרון שנבחר

**אפשרות 3: שילוב - סטייט גלובלי + פרמטרים מינימליים ב-URL**

בחרנו בגישה זו כי:

1. היא משלבת את היתרונות של תכנות פונקציונלי (פונקציות טהורות, שליטה בעדכונים) עם הפשטות של סטייט גלובלי
2. היא מאפשרת שיתוף קישורים למילים ספציפיות
3. היא מפשטת את הקוד ומונעת props drilling
4. היא מתאימה לדפוס העבודה של האפליקציה, שבה עדכונים מתרחשים בעיקר בזמני מעבר בין קומפוננטות

בנוסף, החלטנו להשתמש באובייקט JavaScript רגיל (לא ריאקטיבי) ולא בקונטקסט של Svelte, כדי לשמור על פשטות, שקיפות וגישה פונקציונלית.

### יישום מפורט

1. **יצירת מודול לניהול הסטייט הגלובלי:**

```typescript
// src/lib/state/appState.ts
import type { AppState, PracticeSettings, Result } from '$lib/types';
import { success, failure } from '$lib/utils/result';

// הסטייט הגלובלי
export const appState: AppState = {
	user: {
		progress: {
			currentSet: 1,
			wordsPerSet: 5,
			repetitionsPerSet: 3,
			hideAfterSeconds: 2,
			level: 1
		}
	},
	practice: {
		wordsByLevel: {}
	}
};

// פונקציות טהורות לעדכון הסטייט
export function updateSettings(settings: Partial<PracticeSettings>): Result<void, string> {
	try {
		appState.user.progress = {
			...appState.user.progress,
			...settings
		};

		// שמירה ב-localStorage
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('readFasterProgress', JSON.stringify(appState.user.progress));
			return success(undefined);
		}

		return failure('localStorage לא זמין');
	} catch (e) {
		return failure('שגיאה בעדכון ההגדרות');
	}
}

// פונקציה לטעינת הסטייט מ-localStorage
export function loadState(): Result<void, string> {
	if (typeof localStorage === 'undefined') {
		return failure('localStorage לא זמין');
	}

	const saved = localStorage.getItem('readFasterProgress');
	if (!saved) {
		return success(undefined); // אין מידע שמור, זה בסדר
	}

	try {
		const progress = JSON.parse(saved);
		const result = updateSettings(progress);
		return result;
	} catch (e) {
		return failure('שגיאה בטעינת הסטייט');
	}
}

// פונקציות נוספות לניהול הסטייט...
```

2. **יצירת מודול לטיפול בתוצאות:**

```typescript
// src/lib/utils/result.ts
import type { Result } from '$lib/types';

/**
 * יצירת תוצאה מוצלחת
 * @param value ערך התוצאה
 * @returns תוצאה מוצלחת
 */
export function success<T, E>(value: T): Result<T, E> {
	return { success: true, value };
}

/**
 * יצירת תוצאה כושלת
 * @param error שגיאה
 * @returns תוצאה כושלת
 */
export function failure<T, E>(error: E): Result<T, E> {
	return { success: false, error };
}

/**
 * טיפול בתוצאה
 * @param result תוצאה
 * @param onSuccess פונקציה לטיפול בתוצאה מוצלחת
 * @param onFailure פונקציה לטיפול בתוצאה כושלת
 * @returns תוצאת הטיפול
 */
export function match<T, E, R>(
	result: Result<T, E>,
	onSuccess: (value: T) => R,
	onFailure: (error: E) => R
): R {
	return result.success ? onSuccess(result.value) : onFailure(result.error);
}
```

3. **אתחול הסטייט בעת טעינת האפליקציה:**

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import { onMount } from 'svelte';
	import { loadState } from '$lib/state/appState';
	import { match } from '$lib/utils/result';

	// טעינת הסטייט בעת טעינת האפליקציה
	onMount(() => {
		const result = loadState();
		match(
			result,
			() => {
				// טעינה מוצלחת
			},
			(error) => {
				console.error('שגיאה בטעינת הסטייט:', error);
			}
		);
	});
</script>

<slot />
```

4. **שימוש בסטייט בקומפוננטות:**

```svelte
<!-- src/routes/practice/level/[level]/word/[word]/+page.svelte -->
<script>
	import { page } from '$app/stores';
	import { appState } from '$lib/state/appState';

	// קריאת הפרמטרים מה-URL
	const level = parseInt($page.params.level, 10);
	const wordIndex = parseInt($page.params.word, 10);

	// קריאה ישירה מהסטייט הגלובלי
	const settings = appState.user.progress;

	// יצירת סטייט מקומי רק למה שצריך
	const state = $state({
		session: {
			words: [], // רשימת המילים בסשן
			currentIndex: wordIndex - 1, // אינדקס המילה הנוכחית (0-based)
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

	// שימוש בסטייט...
</script>
```

5. **ניווט עם שמירת הפרמטרים החשובים ב-URL:**

```typescript
// src/lib/navigation.ts
import { goto } from '$app/navigation';

export function navigateToPractice(level: number, wordIndex: number): void {
	goto(`/practice/level/${level}/word/${wordIndex}`);
}

export function navigateToSettings(): void {
	goto('/practice/settings');
}

export function navigateToHome(): void {
	goto('/');
}
```

6. **דוגמאות לשימוש בסטייט הגלובלי:**

**במסך הגדרות התרגול:**

```svelte
<script>
	import { appState, updateSettings } from '$lib/state/appState';
	import { navigateToPractice } from '$lib/navigation';
	import { match } from '$lib/utils/result';

	// קריאה מהסטייט הגלובלי
	const settings = appState.user.progress;

	// יצירת סטייט מקומי לערכים שמשתנים בטופס
	const state = $state({
		selectedWordsPerSet: settings.wordsPerSet,
		selectedSet: settings.currentSet,
		selectedRepetitions: settings.repetitionsPerSet,
		hideAfterSeconds: settings.hideAfterSeconds,
		selectedLevel: settings.level
	});

	function handleStartPractice() {
		// עדכון הסטייט הגלובלי
		const result = updateSettings({
			wordsPerSet: state.selectedWordsPerSet,
			currentSet: state.selectedSet,
			repetitionsPerSet: state.selectedRepetitions,
			hideAfterSeconds: state.hideAfterSeconds,
			level: state.selectedLevel
		});

		match(
			result,
			() => {
				// עדכון מוצלח, ניווט לדף התרגול
				navigateToPractice(state.selectedLevel, 1);
			},
			(error) => {
				console.error('שגיאה בעדכון ההגדרות:', error);
				// אפשר להציג הודעת שגיאה למשתמש
			}
		);
	}
</script>
```

**במסך התרגול:**

```svelte
<script>
	import { page } from '$app/stores';
	import { appState, updateSettings } from '$lib/state/appState';
	import { navigateToPractice } from '$lib/navigation';
	import { match } from '$lib/utils/result';

	// קריאת הפרמטרים מה-URL
	const level = parseInt($page.params.level, 10);
	const wordIndex = parseInt($page.params.word, 10);

	// קריאה מהסטייט הגלובלי
	const settings = appState.user.progress;

	function handleNextWord() {
		// עדכון הסטייט המקומי
		state.ui.direction = 'next';
		state.ui.lastDirection = 'next';
		state.session.currentIndex++;

		// ניווט למילה הבאה
		navigateToPractice(level, wordIndex + 1);
	}

	function handleFinishSet() {
		// עדכון הסטייט הגלובלי
		const result = updateSettings({
			currentSet: settings.currentSet // אותו ערך, רק לשמירה
		});

		match(
			result,
			() => {
				// עדכון מוצלח, ניווט לדף הסיום
				navigateToCompletion();
			},
			(error) => {
				console.error('שגיאה בעדכון ההגדרות:', error);
				// אפשר להציג הודעת שגיאה למשתמש
			}
		);
	}
</script>
```

## 2. לוגיקת ניהול המילים

### מצב נוכחי

- באג במערך המאוחד `words` שמכיל רק את המילים מרמה 1 (שורה 167 ב-words.ts: `export const words: WordList = [...level1Words];`)
- לוגיקה מסובכת בפונקציית `getImagePath` עם תנאים שונים לכל רמה
- מבנה לא עקבי של נתוני המילים

### אפשרויות שנשקלו

#### אפשרות 1: מאגר מילים מאוחד עם סינון דינמי

**יתרונות:**

- פשטות מבנה הנתונים - מבנה נתונים אחד פשוט המכיל את כל המילים
- מניעת כפילות - כל מילה מוגדרת פעם אחת בלבד
- קלות עדכון - עדכון מילה מתבצע במקום אחד בלבד

**חסרונות:**

- ביצועים - סינון המילים בזמן ריצה דורש משאבי מעבד
- מורכבות לוגית - הלוגיקה של סינון המילים מתפזרת בקוד במקומות שונים

#### אפשרות 2: חלוקה מראש לפי רמה

**יתרונות:**

- ביצועים משופרים - אין צורך בסינון בזמן ריצה
- פשטות לוגית - הלוגיקה פשוטה יותר, אין צורך בפונקציות סינון
- שליטה מדויקת - אפשר לקבוע בדיוק אילו מילים יופיעו בכל רמה ובאיזה סדר

**חסרונות:**

- כפילות אפשרית - אם מילה מופיעה ביותר מרמה אחת, היא תישמר פעמיים
- קושי בעדכון גלובלי - עדכון מילה שמופיעה במספר רמות דורש עדכון בכל המקומות

### פתרון שנבחר

**אפשרות 2: חלוקה מראש לפי רמה**

בחרנו בגישה זו כי:

1. מבדיקת הקוד הקיים, נראה שאין מילים כפולות בין הרמות, כך שאין חשש לכפילות
2. הביצועים טובים יותר כי אין צורך בסינון בזמן ריצה
3. הלוגיקה פשוטה יותר ויותר קלה להבנה
4. המבנה כבר קיים בקוד הנוכחי, רק צריך לתקן את הבאג

### יישום מפורט

1. **תיקון הבאג במערך המאוחד:**

```typescript
// src/lib/data/words.ts
import type { Word, WordList, Result } from '$lib/types';
import { success, failure } from '$lib/utils/result';
import wordList from './words.json';

// טעינת מילים מכל השלבים כרשימות נפרדות
export const level1Words: WordList = wordList.level_1.map((word) => ({
	text: word,
	image: getImagePath(word, 1),
	level: 1
}));

export const level2Words: WordList = wordList.level_2.map((word) => ({
	text: word,
	image: getImagePath(word, 2),
	level: 2
}));

export const level3Words: WordList = wordList.level_3.map((word) => ({
	text: word,
	image: getImagePath(word, 3),
	level: 3
}));

export const level4Words: WordList = wordList.level_4.map((word) => ({
	text: word,
	image: getImagePath(word, 4),
	level: 4
}));

// ייצוא כל המילים כמערך אחד - תיקון הבאג
export const words: WordList = [...level1Words, ...level2Words, ...level3Words, ...level4Words];

// פונקציה לקבלת מילים לפי רמה
export function getWordsByLevel(level: number): Result<WordList, string> {
	switch (level) {
		case 1:
			return success(level1Words);
		case 2:
			return success(level2Words);
		case 3:
			return success(level3Words);
		case 4:
			return success(level4Words);
		default:
			return failure(`רמה לא חוקית: ${level}`);
	}
}
```

2. **פישוט פונקציית getImagePath:**

```typescript
// src/lib/data/words.ts
function getImagePath(word: string, level: number): string | false {
	const cleanWord = word.replace(/[\u0591-\u05C7]/g, ''); // הסרת ניקוד

	// מיפוי אחיד לכל הרמות
	const basePath = level > 1 ? `/images/Level-${level}/` : '/images/';

	// בדיקה אם קיים קובץ תמונה
	for (const ext of ['jpg', 'png', 'jpeg']) {
		// כאן אפשר להוסיף בדיקה אמיתית אם הקובץ קיים
		// לצורך הדוגמה, נשתמש במיפוי הקיים

		if (level === 1) {
			const fileName = `${cleanWord}.${ext}`;
			if (level1Files.includes(fileName)) {
				return `${basePath}${fileName}`;
			}
		} else if (level === 2) {
			const fileName = level2FilesMap[cleanWord];
			if (fileName) {
				return `${basePath}${fileName}`;
			}
		} else {
			// לרמות 3 ו-4 אין כרגע תמונות
			return false;
		}
	}

	return false;
}
```

3. **אינטגרציה עם הסטייט הגלובלי:**

```typescript
// src/lib/state/appState.ts
import { getWordsByLevel } from '$lib/data/words';
import { match } from '$lib/utils/result';

// אתחול מערכי המילים בסטייט הגלובלי
export function initializeWordsByLevel(): Result<void, string> {
	try {
		for (let level = 1; level <= 4; level++) {
			const result = getWordsByLevel(level);
			match(
				result,
				(words) => {
					appState.practice.wordsByLevel[level] = words;
				},
				(error) => {
					console.error(`שגיאה בטעינת מילים לרמה ${level}:`, error);
				}
			);
		}
		return success(undefined);
	} catch (e) {
		return failure('שגיאה באתחול מערכי המילים');
	}
}

// פונקציה לקבלת המילים לסט הנוכחי
export function getCurrentSetWords(): Result<WordList, string> {
	const { level, currentSet, wordsPerSet } = appState.user.progress;
	const levelWords = appState.practice.wordsByLevel[level];

	if (!levelWords) {
		return failure(`לא נמצאו מילים לרמה ${level}`);
	}

	const startIndex = (currentSet - 1) * wordsPerSet;
	if (startIndex >= levelWords.length) {
		return failure(`אינדקס התחלה ${startIndex} חורג מגודל המערך ${levelWords.length}`);
	}

	return success(levelWords.slice(startIndex, startIndex + wordsPerSet));
}
```
