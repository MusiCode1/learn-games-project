import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** תמונת PNG מינימלית (1×1) ב-Buffer. */
export const TINY_PNG = Buffer.from([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
	0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
	0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
	0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
	0x42, 0x60, 0x82
]);

/**
 * מוסיף כרטיס חדש עם תמונה דרך טופס ה-admin. דורש שנמצאים כבר במסך
 * הקופסה הרצויה (`/admin/shelves/[shelfId]/[boxId]`).
 * מחכה לקבל אישור שהכרטיס מופיע ברשימה לפני שחוזר.
 */
export async function addCardWithImage(page: Page, word: string): Promise<void> {
	await page.getByRole('textbox', { name: 'מילה' }).fill(word);
	await page.locator('#card-image').setInputFiles({
		name: 'test.png',
		mimeType: 'image/png',
		buffer: TINY_PNG
	});
	await expect(page.getByText('תצוגה מקדימה')).toBeVisible();
	await page.getByRole('button', { name: 'הוסף' }).click();
	await expect(page.getByRole('heading', { level: 4, name: word })).toBeVisible();
}

/**
 * שולף את כל ה-entries מ-IndexedDB `wordys-game-images / cards`.
 * מחזיר רק שדות בטוחים לשליחה דרך CDP (ה-Blob עצמו לא מועבר).
 */
export async function getIDBCardImages(
	page: Page
): Promise<Array<{ id: string; mimeType: string; size: number }>> {
	return await page.evaluate(
		() =>
			new Promise<Array<{ id: string; mimeType: string; size: number }>>((resolve, reject) => {
				const req = indexedDB.open('wordys-game-images');
				req.onsuccess = () => {
					const db = req.result;
					if (!db.objectStoreNames.contains('cards')) {
						resolve([]);
						return;
					}
					const tx = db.transaction('cards', 'readonly');
					const store = tx.objectStore('cards');
					const getAll = store.getAll();
					getAll.onsuccess = () => {
						const entries = (getAll.result as Array<{ id: string; blob: Blob }>).map((e) => ({
							id: e.id,
							mimeType: e.blob?.type ?? '',
							size: e.blob?.size ?? 0
						}));
						resolve(entries);
					};
					getAll.onerror = () => reject(getAll.error);
				};
				req.onerror = () => reject(req.error);
			})
	);
}

/**
 * מאתר ב-DOM את ה-img של כרטיס לפי המילה. מחזיר locator שניתן לעשות עליו
 * `expect(...).toHaveAttribute('src', /.../)`.
 */
export function getCardImageLocator(page: Page, word: string) {
	return page.getByRole('heading', { level: 4, name: word }).locator('xpath=../..//img');
}
