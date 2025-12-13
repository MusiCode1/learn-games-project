import type { Readable } from 'svelte/store';

export interface WordState {
  wordsPerSet: number;
  currentSet: number;
  currentWordIndex: number;
  totalSets: number;
  currentSetWords: string[];
  totalWords: number;
}

export interface SessionState {
  words: Word[]; // רשימת המילים המלאה כולל חזרות
  currentIndex: number; // האינדקס הנוכחי
  wordsPerRepetition: number; // כמה מילים בכל חזרה
  totalRepetitions: number; // כמה חזרות סה"כ
}

export type DerivedBoolean = Readable<boolean>;

// טיפוס להגדרות התרגול
export interface PracticeSettings {
  currentSet: number; // סט נוכחי
  wordsPerSet: number; // מספר מילים בכל סט
  repetitionsPerSet: number; // מספר חזרות לכל סט
  hideAfterSeconds: number; // זמן הסתרת המילה בשניות
  level: number; // שלב נוכחי
}

// טיפוס למצב התצוגה
export interface UIState {
  isWordVisible: boolean; // האם המילה מוצגת
  isImageVisible: boolean; // האם התמונה מוצגת
  direction: 'next' | 'prev' | null; // כיוון האנימציה
  lastDirection: 'next' | 'prev'; // כיוון האנימציה האחרון
}

export interface Word {
  text: string; // המילה עם ניקוד
  image?: string | false; // נתיב לתמונה (אופציונלי)
  level: number; // רמת הקושי
  type?: 'verb'; // סוג המילה
}

export type WordList = Word[];

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
export interface PracticeSettingsScreenProps extends ScreenProps {
  // הרחבת handlers עם פונקציות ספציפיות למסך ההגדרות
  handlers: ScreenProps['handlers'] & {
    onStartPractice: (settings: PracticeSettings) => void; // התחלת תרגול
    onBack: () => void; // חזרה למסך הקודם
  };
}

// טיפוס לפרופס של PracticeCompletionScreen
export interface PracticeCompletionScreenProps extends ScreenProps {
  // הרחבת handlers עם פונקציות ספציפיות למסך הסיום
  handlers: ScreenProps['handlers'] & {
    onNextSet: () => void; // מעבר לסט הבא
    onRepeatSet: () => void; // חזרה על הסט הנוכחי
    onHome: () => void; // חזרה למסך הבית
  };
}

// טיפוס לתוצאה של פעולה (בהשראת Rust/Elm)
export type Result<T, E> = { success: true; value: T } | { success: false; error: E };

// טיפוס לפרופס של WelcomeScreen
export interface WelcomeScreenProps extends ScreenProps {
  // הרחבת handlers עם פונקציות ספציפיות למסך הפתיחה (אם ישנן)
  handlers: ScreenProps['handlers'] & {
    // אין handlers ספציפיים כרגע
  };
}

// טיפוס לסטייט הגלובלי של האפליקציה
export interface AppState {
  user: {
    progress: PracticeSettings;
  };
  practice: {
    wordsByLevel: Record<number, WordList>;
    session: SessionState;
  };
}
