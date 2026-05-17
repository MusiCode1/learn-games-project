import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import SegmentedControl from 'learn-booster-kit/ui/primitives/SegmentedControl.svelte';

const opts = [
	{ value: 'a', label: 'A' },
	{ value: 'b', label: 'B' },
	{ value: 'c', label: 'C' }
] as const;

describe('SegmentedControl', () => {
	it('מסמן את הערך הנוכחי כ-aria-checked', async () => {
		render(SegmentedControl, { options: opts, value: 'b' });
		const radios = page.getByRole('radio').all();
		await expect.element(radios[1]).toHaveAttribute('aria-checked', 'true');
		await expect.element(radios[0]).toHaveAttribute('aria-checked', 'false');
	});

	it('מפעיל onchange בלחיצה', async () => {
		const onchange = vi.fn();
		render(SegmentedControl, {
			options: opts,
			value: 'a',
			onchange
		});
		await page.getByText('B').click();
		expect(onchange).toHaveBeenCalledWith('b');
	});

	it('מציג את כל האופציות', async () => {
		render(SegmentedControl, { options: opts, value: 'a' });
		const radios = page.getByRole('radio').all();
		expect(radios).toHaveLength(3);
	});
});
