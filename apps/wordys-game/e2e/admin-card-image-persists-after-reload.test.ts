import { test, expect } from './_helpers/fixtures';
import { addCardWithImage, getCardImageLocator } from './_helpers/admin';

test('תמונת כרטיס נשמרת אחרי רענון דף ומופיעה תגובתית מ-IndexedDB', async ({
	page,
	errorTracker
}) => {
	await page.goto('/admin/shelves/shelf-food/box-sweets');
	await expect(page.getByRole('heading', { name: /כרטיסים בקופסה/ })).toBeVisible();

	const word = 'התמדה ' + Date.now();
	await addCardWithImage(page, word);

	// בדיקת sanity: אחרי ההוספה ה-img הוא blob:
	await expect(getCardImageLocator(page, word)).toHaveAttribute('src', /^blob:/);

	// רענון מלא של הדף — הקאש בזיכרון נמחק, הכל נטען מחדש מ-localStorage / IDB
	await page.reload();
	await expect(page.getByRole('heading', { name: /כרטיסים בקופסה/ })).toBeVisible();

	// הכרטיס שיצרנו עדיין שם
	await expect(page.getByRole('heading', { level: 4, name: word })).toBeVisible();

	// **התגובתיות**: ב-render הראשון אחרי reload, ה-img נטען כ-CDN fallback (כי הקאש
	// בזיכרון ריק). כש-queueMicrotask גומר את הטעינה מ-IDB, ה-cache מתעדכן ו-Svelte
	// אמור לרנדר מחדש את ה-img עם blob: URL. toHaveAttribute מנסה שוב ושוב עד timeout.
	await expect(getCardImageLocator(page, word)).toHaveAttribute('src', /^blob:/);

	expect(errorTracker.pageErrors).toEqual([]);
	expect(errorTracker.consoleErrors).toEqual([]);
});
