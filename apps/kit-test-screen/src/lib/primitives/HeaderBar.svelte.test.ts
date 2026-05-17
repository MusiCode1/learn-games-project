import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import HeaderBar from 'learn-booster-kit/ui/shell/HeaderBar.svelte';

const makeSnippet = (text: string) =>
	createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('HeaderBar', () => {
	it('מציג snippets בשלושת האזורים', async () => {
		render(HeaderBar, {
			leftActions: makeSnippet('LEFT'),
			centerInfo: makeSnippet('CENTER'),
			rightActions: makeSnippet('RIGHT')
		});
		await expect.element(page.getByText('LEFT')).toBeInTheDocument();
		await expect.element(page.getByText('CENTER')).toBeInTheDocument();
		await expect.element(page.getByText('RIGHT')).toBeInTheDocument();
	});

	it('פועל גם בלי snippets', async () => {
		render(HeaderBar, {});
		const header = page.getByRole('banner');
		await expect.element(header).toBeInTheDocument();
	});

	it('variant compact מקבל data-variant', async () => {
		render(HeaderBar, { variant: 'compact' });
		const header = page.getByRole('banner').element() as HTMLElement;
		expect(header.getAttribute('data-variant')).toBe('compact');
	});
});
