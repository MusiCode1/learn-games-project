# מודולריזציה של קומפוננטת PracticeScreen

## מצב נוכחי

כיום, קומפוננטת `PracticeScreen` היא קומפוננטה גדולה ומורכבת שמכילה מספר אחריויות:

- תצוגת המילה והתמונה
- פקדי ניווט
- מידע על התקדמות
- לוגיקת אנימציה
- טיימר להסתרת המילה

## בעיות במצב הנוכחי

- קוד ארוך ומסורבל
- אחריות יתר
- קושי בבדיקות ותחזוקה

## פתרון מוצע: מודולריזציה פשוטה

במקום לפצל את הקומפוננטה לקומפוננטות קטנות יותר, נוציא את הלוגיקה למודולים נפרדים שיישארו באותה תיקייה:

```
src/routes/practice/
├── +page.svelte         // הקומפוננטה הראשית
├── +page.ts             // לוגיקת הטעינה
├── practice-utils.ts    // פונקציות עזר כלליות
├── practice-state.ts    // לוגיקת ניהול סטייט
└── practice-handlers.ts // פונקציות לטיפול באירועים
```

### 1. practice-utils.ts

מודול זה יכיל פונקציות עזר כלליות שלא קשורות לסטייט או לאירועים:

- `isFirstWord()` - בדיקה אם המילה היא הראשונה
- `isLastWord()` - בדיקה אם המילה היא האחרונה
- `calculateTotalSets()` - חישוב מספר הסטים הכולל
- `formatTime()` - פורמוט זמן למחרוזת

### 2. practice-state.ts

מודול זה יכיל את כל הלוגיקה הקשורה לניהול הסטייט:

- `createInitialSessionState()` - יצירת סטייט ראשוני של הסשן
- `createInitialUIState()` - יצירת סטייט ראשוני של ממשק המשתמש
- `updateDirection()` - עדכון כיוון האנימציה
- `toggleWordVisibility()` - החלפת מצב הנראות של המילה
- `toggleImageVisibility()` - החלפת מצב הנראות של התמונה
- `getCurrentWord()` - קבלת המילה הנוכחית

### 3. practice-handlers.ts

מודול זה יכיל את כל הפונקציות לטיפול באירועים:

- `handleNext()` - טיפול במעבר למילה הבאה
- `handlePrev()` - טיפול במעבר למילה הקודמת
- `handleFinish()` - טיפול בסיום הסט
- `handleWordCardClick()` - טיפול בלחיצה על כרטיסיית המילה
- `handleImageCardClick()` - טיפול בלחיצה על כרטיסיית התמונה
- `handleExit()` - טיפול ביציאה מהתרגול

### 4. עדכון הקומפוננטה הראשית

הקומפוננטה הראשית תייבא את הפונקציות מהמודולים ותשתמש בהן:

```svelte
<script>
	// ייבוא המודולים
	import { isFirstWord, isLastWord } from './practice-utils';
	import { createInitialSessionState, createInitialUIState } from './practice-state';
	import { handleNext, handlePrev, handleFinish } from './practice-handlers';

	// יצירת סטייט מקומי
	const session = $state(
		createInitialSessionState(words, word, settings.wordsPerSet, settings.repetitionsPerSet)
	);
	const ui = $state(createInitialUIState());

	// שימוש בפונקציות מהמודולים
	// ...
</script>
```

## יתרונות הגישה

1. **פשטות** - אין צורך במבנה תיקיות מורכב
2. **הפרדת אחריות** - הפרדה ברורה בין סוגי הלוגיקה השונים
3. **קריאות** - הקומפוננטה הראשית נשארת קצרה וקריאה
4. **תחזוקה** - קל יותר לתחזק ולהרחיב את הקוד
5. **בדיקות** - קל יותר לכתוב בדיקות לפונקציות נפרדות

## סיכום

מודולריזציה פשוטה של קומפוננטת `PracticeScreen` תאפשר לנו לשפר את המבנה והתחזוקה של הקוד, מבלי ליצור מבנה תיקיות מורכב. הוצאת הלוגיקה למודולים נפרדים תפשט את הקומפוננטה הראשית ותקל על הבנת הקוד, על כתיבת בדיקות ועל הרחבת הפונקציונליות בעתיד.
