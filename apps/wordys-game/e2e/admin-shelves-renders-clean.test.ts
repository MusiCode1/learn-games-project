import { test, expect } from './_helpers/fixtures';

test('המסך /admin/shelves נטען בלי שגיאות בקונסול', async ({ page, errorTracker }) => {
	await page.goto('/admin/shelves');

	// וודא שהדף באמת נטען (לא רק שלא היו שגיאות לפני שהתחיל הרינדור)
	await expect(page.getByRole('heading', { name: 'ניהול מדפים' })).toBeVisible();

	// תן זמן לתמונות להתחיל לטעון מה-CDN ול-effects לרוץ
	await page.waitForLoadState('networkidle');

	// תפיסת השגיאות
	expect(errorTracker.pageErrors).toEqual([]);
	expect(errorTracker.consoleErrors).toEqual([]);
});
