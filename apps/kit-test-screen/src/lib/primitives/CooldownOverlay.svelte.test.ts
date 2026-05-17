import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CooldownOverlay from 'learn-booster-kit/ui/primitives/CooldownOverlay.svelte';

describe('CooldownOverlay', () => {
	it('מציג overlay כשuntilTs בעתיד', async () => {
		const untilTs = Date.now() + 5000;
		render(CooldownOverlay, { untilTs, durationMs: 5000 });
		await expect.element(page.getByRole('alertdialog')).toBeInTheDocument();
	});

	it('מסתיר overlay כשuntilTs בעבר', async () => {
		const untilTs = Date.now() - 1000;
		render(CooldownOverlay, { untilTs, durationMs: 5000 });
		const dialog = page.getByRole('alertdialog');
		expect(dialog.elements()).toHaveLength(0);
	});

	it('מציג message אם יש', async () => {
		const untilTs = Date.now() + 5000;
		render(CooldownOverlay, { untilTs, durationMs: 5000, message: 'נסה שוב' });
		await expect.element(page.getByText('נסה שוב')).toBeInTheDocument();
	});
});
