import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ScoreBadge from 'learn-booster-kit/ui/primitives/ScoreBadge.svelte';

describe('ScoreBadge', () => {
	it('מציג את ה-value', async () => {
		render(ScoreBadge, { value: 42 });
		await expect.element(page.getByText('42')).toBeInTheDocument();
	});

	it('מציג label אם יש', async () => {
		render(ScoreBadge, { value: 7, label: 'ניקוד' });
		await expect.element(page.getByText('ניקוד')).toBeInTheDocument();
	});

	it('variant success מקבל data-variant', async () => {
		render(ScoreBadge, { value: 10, variant: 'success' });
		const el = page.getByText('10').element().closest('[data-variant]') as HTMLElement | null;
		expect(el?.getAttribute('data-variant')).toBe('success');
	});
});
