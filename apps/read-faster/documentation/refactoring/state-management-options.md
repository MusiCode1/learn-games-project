# אפשרויות לניהול סטייט גלובלי ב-Svelte 5

## רקע

בתכנון החדש של ניהול הסטייט, אנו מעוניינים להשתמש בסטייט גלובלי עם פונקציות טהורות לטיפול בו. Svelte 5 מציע שתי גישות עיקריות לניהול סטייט:

1. **Svelte Stores** - הגישה המסורתית של Svelte
2. **Svelte Runes** - הגישה החדשה שהוצגה ב-Svelte 5

להלן נבחן את היתרונות והחסרונות של כל גישה, ונציע המלצה מתאימה לפרויקט שלנו.

## 1. Svelte Stores

### מהם Svelte Stores?

Svelte Stores הם אובייקטים שמנהלים מצב (state) ומאפשרים להירשם לשינויים בו. הם מבוססים על חוזה פשוט:

```typescript
interface Readable<T> {
	subscribe(run: (value: T) => void): () => void;
}

interface Writable<T> extends Readable<T> {
	set(value: T): void;
	update(updater: (value: T) => T): void;
}
```

### יתרונות:

1. **בשלות** - טכנולוגיה מוכחת ובשלה שקיימת מאז Svelte 3
2. **תאימות לאחור** - עובדת עם כל גרסאות Svelte
3. **הפרדת דאגות** - מפרידה בין לוגיקת ניהול הסטייט לבין הקומפוננטות
4. **גמישות** - אפשר ליצור stores מותאמים אישית עם לוגיקה מורכבת
5. **ערכים נגזרים** - תמיכה ב-derived stores לחישוב ערכים נגזרים
6. **תמיכה בפעולות צד** - קל לשלב פעולות צד כמו שמירה ב-localStorage

### חסרונות:

1. **תחביר מילולי** - דורש שימוש ב-$ לגישה לערך הסטור
2. **ביצועים** - פחות יעיל מ-Runes בתרחישים מסוימים
3. **מורכבות** - דורש הבנה של מנגנון ה-subscription

## 2. Svelte Runes

### מהם Svelte Runes?

Runes הם API חדש שהוצג ב-Svelte 5 לניהול ריאקטיביות. הם מספקים דרך חדשה להגדיר ולנהל מצב ריאקטיבי:

```typescript
// הגדרת מצב ריאקטיבי
const count = $state(0);

// ערך נגזר
const doubled = $derived(count * 2);

// אפקט צד
$effect(() => {
	console.log(`Count changed to ${count}`);
});
```

### יתרונות:

1. **תחביר פשוט** - תחביר נקי ואינטואיטיבי
2. **ביצועים** - אופטימיזציות ביצועים מתקדמות
3. **לוקליות** - הסטייט יכול להיות מוגדר בתוך הקומפוננטה או מחוצה לה
4. **פחות boilerplate** - פחות קוד חוזר לניהול סטייט
5. **אינטגרציה טובה** - עובד היטב עם פיצ'רים אחרים של Svelte 5

### חסרונות:

1. **חדש** - טכנולוגיה חדשה יחסית עם פחות ניסיון בשטח
2. **שינויי תחביר** - דורש למידה של תחביר חדש
3. **מגבלות** - מגבלות מסוימות בהשוואה ל-stores (למשל, קושי ביצירת מבנים מורכבים)

## 3. גישה היברידית: Runes-based Stores

גישה שלישית היא לשלב את היתרונות של שתי הגישות על ידי יצירת stores מבוססי Runes:

```typescript
// src/lib/store/appState.ts

// יצירת סטייט גלובלי באמצעות Runes
export const appState = $state({
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
		wordsByLevel: {},
		session: {
			words: [],
			currentIndex: 0,
			wordsPerRepetition: 0,
			totalRepetitions: 0
		}
	}
});

// פונקציות טהורות לעדכון הסטייט
export function updateSettings(settings) {
	appState.user.progress = { ...settings };
}

export function nextWord() {
	if (appState.practice.session.currentIndex < appState.practice.session.words.length - 1) {
		appState.practice.session.currentIndex++;
	}
}

// ערכים נגזרים
export const currentWord = $derived(() => {
	const session = appState.practice.session;
	if (session.currentIndex < 0 || session.currentIndex >= session.words.length) {
		return session.words[0] || { text: '', level: 1 };
	}
	return session.words[session.currentIndex];
});
```

### יתרונות הגישה ההיברידית:

1. **פשטות** - שימוש בתחביר הפשוט של Runes
2. **גלובליות** - סטייט גלובלי נגיש מכל מקום
3. **ביצועים** - ניצול האופטימיזציות של Runes
4. **פונקציונליות** - שימוש בפונקציות טהורות לעדכון הסטייט

## 4. שמירה אוטומטית ב-localStorage

אחת הדרישות היא שמירת הסטייט ב-localStorage. ניתן לממש זאת באופן אוטומטי:

### עם Svelte Stores:

```typescript
import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';

// פונקציה ליצירת סטור עם שמירה אוטומטית
function createPersistedStore(key, initialValue) {
	// טעינת ערך שמור אם קיים
	const storedValue = browser && localStorage.getItem(key);
	const initial = storedValue ? JSON.parse(storedValue) : initialValue;

	// יצירת הסטור
	const store = writable(initial);

	// הוספת שמירה אוטומטית בכל שינוי
	store.subscribe((value) => {
		if (browser) {
			localStorage.setItem(key, JSON.stringify(value));
		}
	});

	return store;
}

// שימוש
export const appState = createPersistedStore('appState', initialState);
```

### עם Runes:

```typescript
import { browser } from '$app/environment';

// טעינת ערך שמור אם קיים
const storedValue = browser && localStorage.getItem('appState');
const initialState = storedValue
	? JSON.parse(storedValue)
	: {
			/* ערכי ברירת מחדל */
		};

// יצירת סטייט גלובלי
export const appState = $state(initialState);

// שמירה אוטומטית בכל שינוי
$effect(() => {
	if (browser) {
		localStorage.setItem('appState', JSON.stringify(appState));
	}
});
```

## המלצה

בהתחשב בדרישות הפרויקט ובעקרונות התכנות הפונקציונלי, אני ממליץ על **גישה היברידית: Runes-based Stores**:

1. שימוש ב-`$state` ליצירת סטייט גלובלי
2. שימוש בפונקציות טהורות לעדכון הסטייט
3. שימוש ב-`$derived` לחישוב ערכים נגזרים
4. שימוש ב-`$effect` לשמירה אוטומטית ב-localStorage

יתרונות הגישה הזו:

- שומרת על עקרונות התכנות הפונקציונלי
- מנצלת את היתרונות של Svelte 5 Runes
- פשוטה להבנה ולתחזוקה
- תומכת בשמירה אוטומטית ב-localStorage

## דוגמת יישום

```typescript
// src/lib/store/appState.ts
import { browser } from '$app/environment';
import { loadProgress } from '$lib/utils/localStorage';
import type { AppState, Word } from '$lib/types';

// טעינת ערך שמור או יצירת ערך ברירת מחדל
const savedProgress = loadProgress();
const initialState: AppState = {
	user: {
		progress: savedProgress || {
			currentSet: 1,
			wordsPerSet: 5,
			repetitionsPerSet: 3,
			hideAfterSeconds: 2,
			level: 1
		}
	},
	practice: {
		wordsByLevel: {},
		session: {
			words: [],
			currentIndex: 0,
			wordsPerRepetition: 0,
			totalRepetitions: 0
		}
	}
};

// יצירת סטייט גלובלי
export const appState = $state(initialState);

// פונקציות טהורות לעדכון הסטייט
export const AppStateActions = {
	// עדכון הגדרות
	updateSettings(settings) {
		appState.user.progress = { ...settings };
	},

	// יצירת סשן חדש
	createSession(level, set) {
		const wordsForLevel = appState.practice.wordsByLevel[level] || [];
		const wordsPerSet = appState.user.progress.wordsPerSet;
		const repetitions = appState.user.progress.repetitionsPerSet;

		// חישוב המילים לסט הנוכחי
		const startIndex = (set - 1) * wordsPerSet;
		const setWords = wordsForLevel.slice(startIndex, startIndex + wordsPerSet);

		// יצירת מערך המילים עם חזרות
		const sessionWords = Array(repetitions).fill(setWords).flat();

		appState.practice.session = {
			words: sessionWords,
			currentIndex: 0,
			wordsPerRepetition: setWords.length,
			totalRepetitions: repetitions
		};
	},

	// מעבר למילה הבאה
	nextWord() {
		const session = appState.practice.session;
		if (session.currentIndex < session.words.length - 1) {
			session.currentIndex++;
		}
	},

	// מעבר למילה הקודמת
	prevWord() {
		const session = appState.practice.session;
		if (session.currentIndex > 0) {
			session.currentIndex--;
		}
	}
};

// ערכים נגזרים
export const currentWord = $derived(() => {
	const session = appState.practice.session;
	if (session.currentIndex < 0 || session.currentIndex >= session.words.length) {
		return session.words[0] || { text: '', level: 1 };
	}
	return session.words[session.currentIndex];
});

export const progress = $derived(() => {
	const session = appState.practice.session;
	return {
		current: (session.currentIndex % session.wordsPerRepetition) + 1,
		total: session.wordsPerRepetition
	};
});

export const currentRepetition = $derived(() => {
	const session = appState.practice.session;
	return Math.floor(session.currentIndex / session.wordsPerRepetition) + 1;
});

export const isSessionComplete = $derived(() => {
	const session = appState.practice.session;
	return session.currentIndex === session.words.length - 1;
});

// שמירה אוטומטית ב-localStorage
$effect(() => {
	if (browser) {
		localStorage.setItem('readFasterProgress', JSON.stringify(appState.user.progress));
	}
});
```

בגישה זו, הסטייט מנוהל באופן גלובלי באמצעות Runes, אך עדכונים מתבצעים רק דרך פונקציות טהורות. בנוסף, יש שמירה אוטומטית של ההתקדמות ב-localStorage בכל שינוי.
