import { test, expect } from './_helpers/fixtures';
import { addCardWithImage, getIDBCardImages } from './_helpers/admin';

test('מחיקת כרטיס מסירה את התמונה גם מ-IndexedDB', async ({ page, errorTracker }) => {
	await page.goto('/admin/shelves/shelf-food/box-sweets');
	await expect(page.getByRole('heading', { name: /כרטיסים בקופסה/ })).toBeVisible();

	const word = 'למחיקה ' + Date.now();
	await addCardWithImage(page, word);

	// אחרי הוספה — אכן יש entry ב-IDB
	const idbBefore = await getIDBCardImages(page);
	expect(idbBefore.length).toBeGreaterThan(0);
	expect(idbBefore.some((e) => e.mimeType === 'image/png' && e.size > 0)).toBe(true);
	const idbCountBefore = idbBefore.length;

	// אישור אוטומטי של דיאלוג ה-confirm
	page.once('dialog', (dialog) => dialog.accept());

	// מחיקה: לוחצים על ה-🗑️ בכרטיס הספציפי שלנו
	const ourCardContainer = page
		.getByRole('heading', { level: 4, name: word })
		.locator('xpath=../..');
	await ourCardContainer.getByRole('button', { name: '🗑️' }).click();

	// הכרטיס נעלם מהרשימה
	await expect(page.getByRole('heading', { level: 4, name: word })).toHaveCount(0);

	// IDB ירד ב-1
	const idbAfter = await getIDBCardImages(page);
	expect(idbAfter.length).toBe(idbCountBefore - 1);

	expect(errorTracker.pageErrors).toEqual([]);
	expect(errorTracker.consoleErrors).toEqual([]);
});
