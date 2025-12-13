# תכנון טכני - מערכת תרגול קריאה

## ניהול תמונות

### Cloudinary

- שירות אחסון תמונות בענן
- חשבון חינמי עם 25GB אחסון
- אופטימיזציה אוטומטית של תמונות
- CDN מובנה לטעינה מהירה

#### מבנה התמונות

- פורמט: WebP
- גודל אחיד: 300x300 פיקסלים
- שמות קבצים זהים למילים (כולל ניקוד)
- מבנה URL:
  ```
  https://res.cloudinary.com/[cloud-name]/image/upload/v1/words/[filename].webp
  ```

#### טיפוסי TypeScript לתמונות

```typescript
interface Word {
	text: string; // המילה עם ניקוד
	imageUrl: string; // URL של התמונה ב-Cloudinary
}

interface WordList {
	words: Word[];
	totalWords: number;
}
```

## מבנה הפרויקט

### תיקיות

```
src/
├── lib/
│   ├── components/
│   │   ├── screens/
│   │   │   ├── HomeScreen.svelte      # מסך הבית
│   │   │   └── PracticeScreen.svelte  # מסך התרגול
│   │   ├── ui/
│   │   │   ├── WordCard.svelte        # כרטיסיית מילה
│   │   │   ├── Navigation.svelte      # כפתורי ניווט
│   │   │   ├── Progress.svelte        # תצוגת התקדמות
│   │   │   └── Button.svelte          # כפתור כללי
│   │   └── layout/
│   │       └── Container.svelte       # מכיל עיצוב בסיסי
│   ├── stores/
│   │   └── wordStore.ts               # ניהול מצב
│   ├── data/
│   │   └── words.ts                   # נתוני המילים והתמונות
│   ├── types/
│   │   └── index.ts                   # טיפוסי TypeScript
│   ├── utils/
│   │   ├── localStorage.ts            # שמירת התקדמות
│   │   └── transitions.ts             # אנימציות
│   └── constants/
│       └── config.ts                  # קבועי המערכת
├── routes/
│   ├── +page.svelte                   # דף ראשי
│   ├── +layout.svelte                 # תבנית כללית
│   └── +layout.ts                     # הגדרות תבנית
├── app.html                           # HTML ראשי
└── app.css                            # עיצוב גלובלי
```

### קבצי תצורה

```typescript
// config.ts
export const CONFIG = {
	cloudinary: {
		cloudName: 'your-cloud-name',
		folder: 'words',
		defaultFormat: 'webp',
		defaultSize: '300x300'
	},
	app: {
		defaultWordsPerSet: 5,
		minWordsPerSet: 1,
		maxWordsPerSet: 10,
		defaultRepetitions: 1,
		minRepetitions: 1,
		maxRepetitions: 5,
		transitionDuration: 300
	}
};
```

## ניהול מצב

### חנות מילים

```typescript
// stores/wordStore.ts
interface WordState {
	wordsPerSet: number;
	currentSet: number;
	currentWordIndex: number;
	totalSets: number;
	currentSetWords: Word[];
	totalWords: number;
	repetitionsPerSet: number; // מספר חזרות לכל סט
	currentRepetition: number; // חזרה נוכחית
}

let state = $state<WordState>({
	wordsPerSet: CONFIG.app.defaultWordsPerSet,
	currentSet: 1,
	currentWordIndex: 0,
	totalSets: 0,
	currentSetWords: [],
	totalWords: 0,
	repetitionsPerSet: CONFIG.app.defaultRepetitions,
	currentRepetition: 1
});
```

### שמירת התקדמות

```typescript
// utils/localStorage.ts
interface Progress {
	currentSet: number;
	wordsPerSet: number;
	repetitionsPerSet: number;
}

const STORAGE_KEY = 'readFasterProgress';

export function saveProgress(progress: Progress): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function loadProgress(): Progress | null {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch {
			return null;
		}
	}
	return null;
}
```

## תהליך העבודה

### שלב 1: הקמת תשתית

1. יצירת פרויקט SvelteKit חדש
2. הגדרת TypeScript
3. התקנת תלויות נדרשות
4. הגדרת ESLint ו-Prettier

### שלב 2: הגדרת Cloudinary

1. יצירת חשבון Cloudinary
2. העלאת תמונות המילים
3. הגדרת תצורת Cloudinary בפרויקט

### שלב 3: פיתוח קומפוננטות

1. יצירת קומפוננטות UI בסיסיות
2. יצירת מסכים ראשיים
3. הגדרת ניווט בין מסכים

### שלב 4: ניהול מצב

1. יצירת חנות מילים
2. מימוש שמירת התקדמות
3. טיפול במעברים בין מילים וסטים

### שלב 5: עיצוב ואנימציות

1. הגדרת משתני CSS גלובליים
2. עיצוב קומפוננטות
3. הוספת אנימציות מעבר

### שלב 6: בדיקות ותיקונים

1. בדיקות פונקציונליות
2. בדיקות תאימות דפדפנים
3. אופטימיזציה וביצועים

## דרישות מערכת

### תלויות

```json
{
	"dependencies": {
		"@sveltejs/kit": "^2.0.0",
		"svelte": "^5.0.0",
		"typescript": "^5.0.0"
	},
	"devDependencies": {
		"eslint": "^8.0.0",
		"prettier": "^3.0.0",
		"@typescript-eslint/eslint-plugin": "^6.0.0",
		"@typescript-eslint/parser": "^6.0.0"
	}
}
```

### דרישות דפדפן

- תמיכה ב-WebP
- תמיכה ב-CSS Grid
- תמיכה ב-CSS Custom Properties
- תמיכה ב-Flexbox
- JavaScript מודרני (ES2020+)

## אבטחה

### אחסון מקומי

- שימוש ב-localStorage רק למידע לא רגיש
- הצפנת מידע רגיש אם נדרש

### Cloudinary

- שימוש ב-signed URLs אם נדרש
- הגבלת גישה לתיקיית התמונות
- שימוש ב-HTTPS בלבד

## ביצועים

### אופטימיזציית תמונות

- שימוש בפורמט WebP
- טעינה מ-CDN
- שימוש בגדלים מותאמים

### אופטימיזציית קוד

- Code splitting אוטומטי של SvelteKit
- Lazy loading של תמונות
- Preloading של המילה הבאה
