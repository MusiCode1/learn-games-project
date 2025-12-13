# טיפוסים לריפקטורינג

## טיפוסים לניהול הסטייט

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

## הערות

1. **השלב והמילה הנוכחית** - נמצאים ב-URL ומשם מועברים לקומפוננטות הרלוונטיות. ה-URL מתעדכן בעת מעבר בין מילים. זה מאפשר שיתוף קישורים למילים ספציפיות.

2. **מצב הסשן והתצוגה** - לא יהיו בהכרח בסטייט הגלובלי. ביישום נחליט כל אחד מהם באילו קומפוננטות הוא יהיה זמין. למשל, מצב התצוגה (UIState) יהיה רלוונטי רק לקומפוננטת PracticeScreen, ולכן אין צורך לשמור אותו בסטייט הגלובלי.

3. **טיפוס Result** - משמש לטיפול בשגיאות בצורה פונקציונלית, במקום להשתמש ב-try/catch.

4. **אחידות בפרופס** - כל הקומפוננטות מקבלות את אותו מבנה בסיסי של פרופס (state ו-handlers), עם הרחבות ספציפיות לכל קומפוננטה. זה מבטיח אחידות בכל הקוד.

5. **סך הסטים** - חלק מהטיפוסים מתייחסים לסך הסטים, אך זה עדיין לא ממומש במלואו. יושלם בהמשך.
