# מפרט פרויקט - מערכת לאימון קריאה

מסמך מידע על האצת קריאה:
https://drive.google.com/file/d/1jUEcZXA_9MT5IomNE2TLZmv_RxvCXxyZ/view

## מטרת המערכת

פיתוח יישום אינטרנטי לשיפור מיומנויות קריאה אצל תלמידים באמצעות הצגת מילים בכרטיסיות.

## דרישות פונקציונליות

### דף הבית

1. **הגדרת פרמטרים:**

   - שדה להזנת מספר המילים לתרגול בכל סט (ברירת מחדל: 5)
   - שדה להזנת מספר חזרות לכל סט (ברירת מחדל: 1)
   - כפתור "התחל תרגול"
   - תצוגת התקדמות המציגה את מספר הסט הנוכחי מתוך סך הסטים

2. **חישוב התקדמות:**
   - חלוקת סך המילים (42) למספר המילים בכל סט
   - הצגת מספר הסט הנוכחי והכולל
   - שמירת ההתקדמות בין רענונים של הדף

### דף התרגול

1. **תצוגת כרטיסיות:**

   - כרטיס מרכזי להצגת המילה הנוכחית
   - חצים לניווט בין המילים (ימין ושמאל)
   - תמיכה בניווט באמצעות מקשי החצים במקלדת

2. **מידע על ההתקדמות:**

   - מספר החזרה הנוכחית מתוך סך החזרות לסט
   - מונה מילים בתוך הסט הנוכחי (לדוגמה: מילה 3 מתוך 5)
   - מספר הסט הנוכחי (לדוגמה: סט 2 מתוך 9)

3. **התנהגות בסיום סט:**
   - חזרה אוטומטית לדף הבית
   - עדכון מספר הסט להמשך התרגול

## דרישות טכניות

### תמיכה בעברית

1. **גופנים:**

   - שימוש בגופן Frank Ruhl Libre התומך בניקוד
   - גודל גופן של לפחות 48px להצגה ברורה של הניקוד
   - מרווח מתאים בין אותיות לניקוד

2. **כיווניות:**
   - הגדרת כיווניות RTL לכל הדף
   - יישור טקסטים לימין
   - סדר נכון של כפתורי ניווט

### מבנה הקוד

#### קבצי המערכת

```
/
├── index.html          # דף ראשי
├── styles/
│   └── main.css        # עיצוב
├── scripts/
│   ├── app.js          # לוגיקה ראשית
│   ├── state.js        # ניהול מצב
│   ├── navigation.js   # ניווט בין מסכים
│   └── words.js        # נתוני המילים
└── documentation/
    └── project-spec.md # מסמך זה
```

#### מבנה ה-HTML

```html
<div id="app">
	<!-- דף הבית -->
	<div id="homeScreen" class="screen">
		<h1>תרגול קריאה</h1>
		<div class="set-size-input">
			<label>מספר מילים בסט:</label>
			<input type="number" value="5" min="1" />
		</div>
		<button class="start-btn">התחל תרגול</button>
		<div class="progress-display">
			סט <span class="current-set">1</span> מתוך <span class="total-sets">9</span>
		</div>
	</div>

	<!-- דף התרגול -->
	<div id="practiceScreen" class="screen">
		<div class="word-card">
			<div class="word"></div>
		</div>
		<div class="navigation">
			<button class="prev-btn">הקודם</button>
			<button class="next-btn">הבא</button>
		</div>
		<div class="progress">
			מילה <span class="current-word">1</span> מתוך <span class="words-per-set">5</span>
		</div>
	</div>
</div>
```

### ניהול מצב (State Management)

```javascript
const state = {
	// הגדרות
	wordsPerSet: 5, // כמות מילים בסט
	totalWords: 42, // סך כל המילים

	// מצב נוכחי
	currentSet: 1, // סט נוכחי
	currentWordIndex: 0, // אינדקס המילה בתוך הסט
	totalSets: 0, // יחושב אוטומטית

	// נתונים
	words: [], // מערך המילים
	currentSetWords: [] // מילים בסט הנוכחי
};
```

### פונקציות מרכזיות

#### אתחול

```javascript
function initializeApp() {
	loadWords();
	calculateTotalSets();
	loadProgress();
	setupEventListeners();
	showScreen('home');
}
```

#### ניהול סטים

```javascript
function startNewSet() {
	state.currentWordIndex = 0;
	loadCurrentSetWords();
	updateDisplay();
	switchToPractice();
}

function finishSet() {
	state.currentSet++;
	saveProgress();
	switchToHome();
}
```

#### ניווט

```javascript
function showNextWord() {
	if (state.currentWordIndex < state.wordsPerSet - 1) {
		state.currentWordIndex++;
		updateDisplay();
	} else {
		finishSet();
	}
}

function showPreviousWord() {
	if (state.currentWordIndex > 0) {
		state.currentWordIndex--;
		updateDisplay();
	}
}
```

### עיצוב

#### משתני CSS

```css
:root {
	/* צבעים */
	--primary-color: #2c3e50;
	--secondary-color: #3498db;
	--background-color: #ecf0f1;
	--card-background: #ffffff;

	/* גדלים */
	--card-width: 300px;
	--card-height: 200px;
	--word-size: 48px;
	--button-size: 40px;

	/* גופנים */
	--main-font: 'Frank Ruhl Libre', serif;
}
```

#### אנימציות

```css
/* מעבר בין מסכים */
.screen {
	transition:
		opacity 0.3s ease-in-out,
		visibility 0.3s;
}

/* החלפת מילים */
.word-card {
	transition: transform 0.3s ease-out;
}

/* כפתורי ניווט */
.nav-button {
	transition:
		transform 0.2s ease,
		opacity 0.2s;
}
```

## שלבי פיתוח

1. **שלב 1: תשתית**

   - הקמת מבנה הקבצים
   - יצירת HTML בסיסי
   - הגדרת משתני CSS

2. **שלב 2: עיצוב**

   - עיצוב דף הבית
   - עיצוב כרטיסי המילים
   - הוספת אנימציות

3. **שלב 3: לוגיקה**

   - מימוש ניהול המצב
   - טיפול באירועים
   - ניווט בין מסכים

4. **שלב 4: פונקציונליות**

   - הצגת מילים
   - ניווט בין מילים
   - ניהול סטים

5. **שלב 5: שיפורים**
   - בדיקות קלט
   - טיפול בשגיאות
   - אופטימיזציה

## בדיקות

1. **בדיקות פונקציונליות:**

   - מעבר תקין בין מילים
   - ספירה נכונה של סטים
   - שמירת התקדמות

2. **בדיקות ממשק:**

   - תצוגה נכונה בדפדפנים שונים
   - תמיכה במסכים שונים
   - בדיקת נראות הניקוד

3. **בדיקות קלט:**
   - הזנת מספרים שליליים
   - הזנת מספר גדול ממספר המילים
   - הזנת ערכים לא תקינים
