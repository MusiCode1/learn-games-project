# תכנון מחדש של ניהול הסטייט

## הבעיה הנוכחית

כיום הסטייט מועבר בין הקומפוננטות כמאפיינים בודדים רבים, מה שיוצר קוד ארוך ומסורבל. למשל, קומפוננטת `PracticeScreen` מקבלת כ-20 מאפיינים נפרדים.

## עקרונות התכנון החדש

1. **הפרדה בין נתונים ללוגיקת תצוגה** - נפריד בין הסטייט שמייצג את הנתונים לבין הסטייט שמייצג את מצב התצוגה.
2. **גישה פונקציונלית** - נשתמש בסטייט גלובלי, אך כל הפונקציות שמטפלות בו יהיו טהורות (pure functions).
3. **ארגון לוגי** - נארגן את הסטייט באובייקטים לוגיים לפי תחומי אחריות.

## מבנה הסטייט החדש

### 1. סטייט גלובלי לנתונים

```typescript
// סטייט גלובלי לנתונים - מוגדר ב-store
interface AppState {
	// נתוני המשתמש והתקדמות
	user: {
		progress: {
			currentSet: number;
			wordsPerSet: number;
			repetitionsPerSet: number;
			hideAfterSeconds: number;
			level: number;
		};
	};

	// נתוני המילים והסשן הנוכחי
	practice: {
		// מילים לפי שלב (לא מעורבבות)
		wordsByLevel: Record<number, Word[]>;

		// הגדרות הסשן הנוכחי
		session: {
			words: Word[];
			currentIndex: number;
			wordsPerRepetition: number;
			totalRepetitions: number;
		};
	};
}
```

### 2. סטייט מקומי לתצוגה בכל קומפוננטה

```typescript
// סטייט מקומי בקומפוננטת PracticeScreen
interface PracticeScreenUIState {
	isWordVisible: boolean;
	isImageVisible: boolean;
	direction: 'next' | 'prev' | null;
	lastDirection: 'next' | 'prev';
	isCompleted: boolean;
}

// סטייט מקומי בקומפוננטת PracticeSettingsScreen
interface SettingsScreenUIState {
	selectedSettings: {
		wordsPerSet: number;
		repetitionsPerSet: number;
		hideAfterSeconds: number;
		level: number;
		currentSet: number;
	};
}
```

## פונקציות טהורות לטיפול בסטייט

```typescript
// פונקציות טהורות לטיפול בסטייט
const AppStateActions = {
	// עדכון הגדרות
	updateSettings(state: AppState, settings: UserProgress): AppState {
		return {
			...state,
			user: {
				...state.user,
				progress: { ...settings }
			}
		};
	},

	// יצירת סשן חדש
	createSession(state: AppState, level: number, set: number): AppState {
		const wordsForLevel = state.practice.wordsByLevel[level] || [];
		const wordsPerSet = state.user.progress.wordsPerSet;
		const repetitions = state.user.progress.repetitionsPerSet;

		// חישוב המילים לסט הנוכחי
		const startIndex = (set - 1) * wordsPerSet;
		const setWords = wordsForLevel.slice(startIndex, startIndex + wordsPerSet);

		// יצירת מערך המילים עם חזרות
		const sessionWords = Array(repetitions).fill(setWords).flat();

		return {
			...state,
			practice: {
				...state.practice,
				session: {
					words: sessionWords,
					currentIndex: 0,
					wordsPerRepetition: setWords.length,
					totalRepetitions: repetitions
				}
			}
		};
	},

	// מעבר למילה הבאה
	nextWord(state: AppState): AppState {
		const session = state.practice.session;
		if (session.currentIndex < session.words.length - 1) {
			return {
				...state,
				practice: {
					...state.practice,
					session: {
						...session,
						currentIndex: session.currentIndex + 1
					}
				}
			};
		}
		return state;
	},

	// מעבר למילה הקודמת
	prevWord(state: AppState): AppState {
		const session = state.practice.session;
		if (session.currentIndex > 0) {
			return {
				...state,
				practice: {
					...state.practice,
					session: {
						...session,
						currentIndex: session.currentIndex - 1
					}
				}
			};
		}
		return state;
	}
};
```

## ערכים נגזרים (Derived Values)

```typescript
// פונקציות לחישוב ערכים נגזרים מהסטייט
const AppStateDerived = {
	// חישוב המילה הנוכחית
	getCurrentWord(state: AppState): Word {
		const session = state.practice.session;
		if (session.currentIndex < 0 || session.currentIndex >= session.words.length) {
			return session.words[0] || { text: '', level: 1 };
		}
		return session.words[session.currentIndex];
	},

	// חישוב ההתקדמות
	getProgress(state: AppState): { current: number; total: number } {
		const session = state.practice.session;
		return {
			current: (session.currentIndex % session.wordsPerRepetition) + 1,
			total: session.wordsPerRepetition
		};
	},

	// חישוב החזרה הנוכחית
	getCurrentRepetition(state: AppState): number {
		const session = state.practice.session;
		return Math.floor(session.currentIndex / session.wordsPerRepetition) + 1;
	},

	// בדיקה אם הסשן הסתיים
	isSessionComplete(state: AppState): boolean {
		const session = state.practice.session;
		return session.currentIndex === session.words.length - 1;
	},

	// חישוב מספר הסטים הכולל
	getTotalSets(state: AppState, level: number): number {
		const wordsForLevel = state.practice.wordsByLevel[level] || [];
		const wordsPerSet = state.user.progress.wordsPerSet;
		return Math.ceil(wordsForLevel.length / wordsPerSet);
	}
};
```

## יישום בקומפוננטות

### 1. הגדרת הסטור הגלובלי

```typescript
// src/lib/store/appState.ts
import { writable, derived } from 'svelte/store';
import type { AppState } from '$lib/types';
import { loadProgress } from '$lib/utils/localStorage';

// יצירת הסטור הראשוני
const initialState: AppState = {
	user: {
		progress: loadProgress() || {
			currentSet: 1,
			wordsPerSet: 5,
			repetitionsPerSet: 3,
			hideAfterSeconds: 2,
			level: 1
		}
	},
	practice: {
		wordsByLevel: {}, // יאותחל בנפרד
		session: {
			words: [],
			currentIndex: 0,
			wordsPerRepetition: 0,
			totalRepetitions: 0
		}
	}
};

// יצירת הסטור
export const appState = writable<AppState>(initialState);

// פונקציה לעדכון הסטייט
export function updateAppState(updater: (state: AppState) => AppState): void {
	appState.update(updater);
}

// ערכים נגזרים
export const currentWord = derived(appState, ($state) => AppStateDerived.getCurrentWord($state));
export const progress = derived(appState, ($state) => AppStateDerived.getProgress($state));
export const currentRepetition = derived(appState, ($state) =>
	AppStateDerived.getCurrentRepetition($state)
);
export const isSessionComplete = derived(appState, ($state) =>
	AppStateDerived.isSessionComplete($state)
);
```

### 2. שימוש בקומפוננטות

```svelte
<!-- PracticeScreen.svelte (חלקי) -->
<script lang="ts">
	import {
		appState,
		currentWord,
		progress,
		currentRepetition,
		isSessionComplete
	} from '$lib/store/appState';
	import { AppStateActions } from '$lib/utils/stateActions';

	// סטייט מקומי לתצוגה
	const uiState = $state({
		isWordVisible: true,
		isImageVisible: false,
		direction: null as 'next' | 'prev' | null,
		lastDirection: 'next' as 'next' | 'prev'
	});

	// פונקציות טיפול באירועים
	function handleNext() {
		if ($isSessionComplete) {
			onFinish();
		} else {
			uiState.direction = 'next';
			uiState.lastDirection = 'next';
			setTimeout(() => {
				updateAppState(AppStateActions.nextWord);
				uiState.direction = null;
			}, 300);
		}
	}

	// שאר הפונקציות...
</script>

<!-- תצוגה -->
<div>
	<WordCard
		word={$currentWord.text}
		direction={uiState.direction}
		lastDirection={uiState.lastDirection}
		isVisible={uiState.isWordVisible}
		onClick={handleWordCardClick}
	/>

	<Progress
		current={$progress.current}
		total={$progress.total}
		currentRepetition={$currentRepetition}
		totalRepetitions={$appState.practice.session.totalRepetitions}
	/>
</div>
```

## חלוקת מילים לפי שלב

אחת ההצעות שהעלית היא לחלק את רשימות המילים לפי שלב ולא לערבב אותן. יש לכך יתרונות וחסרונות:

### יתרונות:

1. **פשטות** - קל יותר להבין את הלוגיקה כאשר המילים מחולקות לפי שלב
2. **ביצועים** - אין צורך לסנן את המילים בכל פעם מחדש
3. **גמישות** - אפשר להגדיר מילים שונות לגמרי בכל שלב

### חסרונות:

1. **כפילות** - אם מילה מופיעה ביותר משלב אחד, היא תישמר פעמיים
2. **תחזוקה** - קשה יותר לעדכן מילה שמופיעה במספר שלבים

### הצעה לפתרון:

```typescript
// טעינת המילים בעת אתחול האפליקציה
function initializeWordsByLevel(allWords: Word[]): Record<number, Word[]> {
	const wordsByLevel: Record<number, Word[]> = {};

	// מיון המילים לפי שלב
	allWords.forEach((word) => {
		if (!wordsByLevel[word.level]) {
			wordsByLevel[word.level] = [];
		}
		wordsByLevel[word.level].push(word);
	});

	return wordsByLevel;
}

// עדכון הסטור בעת אתחול האפליקציה
import { words } from '$lib/data/words';

appState.update((state) => ({
	...state,
	practice: {
		...state.practice,
		wordsByLevel: initializeWordsByLevel(words)
	}
}));
```

## סיכום

התכנון החדש מציע:

1. **סטייט גלובלי** לנתונים, עם פונקציות טהורות לטיפול בו
2. **סטייט מקומי** לתצוגה בכל קומפוננטה
3. **ערכים נגזרים** שמחושבים מהסטייט הגלובלי
4. **חלוקת מילים לפי שלב** לפשטות וביצועים טובים יותר

גישה זו משלבת את היתרונות של תכנות פונקציונלי (פונקציות טהורות, immutability) עם היתרונות של סטייט גלובלי (פשטות, נגישות), תוך שמירה על הפרדה ברורה בין נתונים ללוגיקת תצוגה.
