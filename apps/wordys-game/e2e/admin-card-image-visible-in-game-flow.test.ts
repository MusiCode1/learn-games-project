import { test, expect } from './_helpers/fixtures';
import { addCardWithImage } from './_helpers/admin';

test('תמונת כרטיס מותאמת מופיעה גם במסך בחירת הכרטיסים וגם במשחק עצמו', async ({
	page,
	errorTracker
}) => {
	// 1. הוספת כרטיס עם תמונה ב-admin
	await page.goto('/admin/shelves/shelf-food/box-sweets');
	const word = 'מולטי-מסך ' + Date.now();
	await addCardWithImage(page, word);

	// 2. ניווט למסך בחירת הכרטיסים של אותה קופסה
	await page.goto('/select/shelf-food/box-sweets');

	// ההכרטיס החדש מופיע עם תמונה blob:
	const selectImg = page.locator(`img[alt="${word}"]`);
	await expect(selectImg).toBeVisible();
	await expect(selectImg).toHaveAttribute('src', /^blob:/);

	// 3. בחירת רק הכרטיס החדש והתחלת משחק
	// קודם נקה הכל ואז בחר רק את שלנו
	await page.getByRole('button', { name: 'נקה בחירה' }).click();
	await selectImg.click();
	await expect(page.getByText('נבחרו: 1')).toBeVisible();

	await page.getByRole('button', { name: /התחל משחק/ }).click();

	// 4. במסך המשחק, התמונה של הכרטיס הנוכחי היא blob:
	await page.waitForURL(/\/game\/shelf-food\/box-sweets/);
	const gameImg = page.locator(`img[alt="${word}"]`);
	await expect(gameImg).toBeVisible();
	await expect(gameImg).toHaveAttribute('src', /^blob:/);

	expect(errorTracker.pageErrors).toEqual([]);
	expect(errorTracker.consoleErrors).toEqual([]);
});
