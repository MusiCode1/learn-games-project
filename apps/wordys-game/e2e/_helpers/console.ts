import type { Page } from '@playwright/test';

/**
 * רעש מוכר שאינו באג אמיתי — להתעלמות.
 * הוסף כאן רק שגיאות שכבר אומתו ידנית כלא-בעיה.
 */
const KNOWN_NOISE: RegExp[] = [
	/VITE_GOOGLE_DRIVE_API_TOKEN/, // env var לא מוגדר ב-preview/dev
	/VITE_GOOGLE_DRIVE_DEFAULT_FOLDER/, // env var לא מוגדר ב-preview/dev
	/\[learn-booster\] getFilesFromGDrive: API key חסר/, // נגזרת מחסרון API key
	/favicon\.ico.*404/ // favicon חסר
];

export type ErrorTracker = {
	consoleErrors: string[];
	pageErrors: Error[];
};

/**
 * מאזין לקונסול ול-uncaught exceptions של הדף. החזרת אובייקט עם רשימות
 * שמתעדכנות תוך כדי הטסט. הטסט עצמו צריך לבדוק אותן בסופו.
 */
export function trackErrors(page: Page): ErrorTracker {
	const consoleErrors: string[] = [];
	const pageErrors: Error[] = [];

	page.on('console', (msg) => {
		if (msg.type() !== 'error') return;
		const text = msg.text();
		if (KNOWN_NOISE.some((re) => re.test(text))) return;
		consoleErrors.push(text);
	});

	page.on('pageerror', (err) => {
		pageErrors.push(err);
	});

	return { consoleErrors, pageErrors };
}
