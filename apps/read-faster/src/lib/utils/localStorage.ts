import type { PracticeSettings, Result } from '$lib/types'; // שימוש ב-PracticeSettings ו-Result
import { browser } from '$app/environment';
import { success, failure } from '$lib/utils/result'; // ייבוא פונקציות Result

const STORAGE_KEY = 'readFasterProgress';

export function saveProgress(progress: PracticeSettings): Result<void, string> {
	if (!browser) {
		return failure('localStorage אינו זמין בסביבה זו (SSR?).');
	}
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
		return success(undefined);
	} catch (e) {
		console.error('שגיאה בשמירת ההתקדמות ל-localStorage:', e);
		return failure('שגיאה בשמירת ההתקדמות.');
	}
}

export function loadProgress(): Result<PracticeSettings | null, string> {
	if (!browser) {
		return success(null); // בסביבת SSR, אין התקדמות שמורה
	}

	const saved = localStorage.getItem(STORAGE_KEY);
	if (!saved) {
		return success(null); // אין התקדמות שמורה
	}

	try {
		const parsed = JSON.parse(saved) as PracticeSettings;
		// כאן אפשר להוסיף ולידציה ל-parsed אם רוצים
		return success(parsed);
	} catch (e) {
		console.error('שגיאה בטעינת ההתקדמות מ-localStorage:', e);
		// אפשר למחוק את הערך השגוי אם רוצים
		// localStorage.removeItem(STORAGE_KEY);
		return failure('שגיאה בטעינת ההתקדמות.');
	}
}
