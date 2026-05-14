import { test, expect } from './_helpers/fixtures';
import { addCardWithImage, getCardImageLocator } from './_helpers/admin';

test('הוספת כרטיס עם תמונה — הכרטיס מופיע ברשימה עם התמונה שהועלתה', async ({
	page,
	errorTracker
}) => {
	await page.goto('/admin/shelves/shelf-food/box-sweets');
	await expect(page.getByRole('heading', { name: /כרטיסים בקופסה/ })).toBeVisible();

	const cardsBefore = await page.getByRole('heading', { level: 4 }).count();
	const newWord = 'בדיקה ' + Date.now();

	await addCardWithImage(page, newWord);

	await expect(page.getByRole('heading', { level: 4 })).toHaveCount(cardsBefore + 1);
	await expect(getCardImageLocator(page, newWord)).toHaveAttribute('src', /^blob:/);

	expect(errorTracker.pageErrors).toEqual([]);
	expect(errorTracker.consoleErrors).toEqual([]);
});
