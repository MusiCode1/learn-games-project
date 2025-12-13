import type { AppState, Word, WordList, PracticeSettings, SessionState, Result } from '$lib/types';
import { loadProgress, saveProgress } from '$lib/utils/localStorage';
import { initializeWordsByLevel } from '$lib/data/words'; // ייבוא הפונקציה לאתחול המילים
import { CONFIG } from '$lib/constants/config';
import { success, failure, match } from '$lib/utils/result'; // ייבוא פונקציות Result

// הגדרות ברירת מחדל
const defaultProgress: PracticeSettings = {
    currentSet: 1,
    wordsPerSet: CONFIG.app.defaultWordsPerSet,
    repetitionsPerSet: CONFIG.app.defaultRepetitions,
    hideAfterSeconds: CONFIG.app.defaultHideSeconds,
    level: CONFIG.app.defaultLevel
};

// סשן התחלתי ריק
const initialSession: SessionState = {
    words: [],
    currentIndex: 0,
    wordsPerRepetition: 0,
    totalRepetitions: 0
};

// הסטייט הגלובלי - אובייקט JS רגיל
export const appState: AppState = {
    user: {
        // ההתקדמות תטען בפונקציה loadState
        progress: { ...defaultProgress } // מתחילים עם ברירת מחדל
    },
    practice: {
        wordsByLevel: initializeWordsByLevel(), // אתחול המילים לפי רמה
        session: initialSession
    }
};

// פונקציה לטעינת ההתקדמות השמורה מ-localStorage בעת אתחול האפליקציה
export function loadState(): Result<void, string> {
    const loadResult = loadProgress(); // קורא לפונקציה מהמודול הייעודי

    return match<PracticeSettings | null, string, Result<void, string>>( // הוספת טיפוסים גנריים ל-match
        loadResult,
        (loadedProgress: PracticeSettings | null) => { // הוספת טיפוס ל-loadedProgress
            if (loadedProgress) {
                // אם נטען מידע, עדכן את הסטייט הגלובלי
                appState.user.progress = { ...defaultProgress, ...loadedProgress };
            }
            // אם לא נטען מידע (null), הסטייט נשאר עם ברירת המחדל
            return success(undefined);
        },
        (error: string) => { // הוספת טיפוס ל-error
            // אם הייתה שגיאה בטעינה, השתמש בברירת המחדל והחזר שגיאה
            appState.user.progress = { ...defaultProgress };
            console.error('שגיאה בטעינת ההתקדמות:', error);
            return failure(`שגיאה בטעינת ההתקדמות: ${error}`);
        }
    );
}

// פונקציה לעדכון ההגדרות בסטייט הגלובלי וב-localStorage
export function updateSettings(settingsToUpdate: Partial<PracticeSettings>): Result<void, string> {
    // עדכון ישיר של האובייקט הגלובלי
    appState.user.progress = {
        ...appState.user.progress,
        ...settingsToUpdate
    };

    // שמירה ב-localStorage באמצעות הפונקציה הייעודית
    const saveResult = saveProgress(appState.user.progress);

    // החזרת התוצאה מ-saveProgress
    return saveResult;
}

// פונקציות נוספות לניהול הסטייט (למשל, עדכון סשן) יתווספו כאן לפי הצורך
// כרגע, מתמקדים בגישה ל-appState.practice.wordsByLevel

// הערה: מכיוון ש-appState הוא אובייקט רגיל, שינויים בו לא יגרמו לעדכון אוטומטי
// של קומפוננטות Svelte. קומפוננטות יצטרכו להסתמך על ריאקטיביות פנימית
// או על עדכונים יזומים (למשל, קריאה מחדש ל-appState בתוך $derived שתלוי במשהו אחר,
// או קריאה לפונקציה שמעדכנת סטייט מקומי בקומפוננטה).
// הגישה של העברת state ו-handlers דרך ScreenProps עדיין רלוונטית לנתונים דינמיים
// שצריכים לגרום לעדכון UI.