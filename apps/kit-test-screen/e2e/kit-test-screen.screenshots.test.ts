import { test } from '@playwright/test';

test('kit test screen screenshots', async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('http://localhost:4173/');
	await page.waitForLoadState('networkidle');

	await page.screenshot({
		path: testInfo.outputPath('kit-test-screen-home.png'),
		fullPage: true
	});

	const triggerButton = page.getByRole('button', { name: 'הפעל מחזק' });
	await triggerButton.click();
	await page.waitForTimeout(1500);

	await page.screenshot({
		path: testInfo.outputPath('kit-test-screen-after-trigger.png'),
		fullPage: true
	});
});
