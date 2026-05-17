import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import Card from 'learn-booster-kit/ui/primitives/Card.svelte';

const makeSnippet = (text: string) =>
	createRawSnippet(() => ({ render: () => `<p>${text}</p>` }));

describe('Card', () => {
	it('מציג children', async () => {
		render(Card, { children: makeSnippet('תוכן הכרטיס') });
		await expect.element(page.getByText('תוכן הכרטיס')).toBeInTheDocument();
	});

	it('onclick — הכרטיס מקבל role=button', async () => {
		const onclick = vi.fn();
		render(Card, { children: makeSnippet('X'), onclick });
		await expect.element(page.getByRole('button')).toBeInTheDocument();
	});

	it('ללא onclick — לא role=button', async () => {
		render(Card, { children: makeSnippet('X') });
		const btn = page.getByRole('button');
		// כרטיס רגיל הוא div, לא button
		expect(btn.elements()).toHaveLength(0);
	});

	it('framed variant מכיל class border-4 ו-data-card-variant', async () => {
		render(Card, { children: makeSnippet('X'), variant: 'framed' });
		const card = document.querySelector('[data-card-variant="framed"]') as HTMLElement | null;
		expect(card).not.toBeNull();
		// Tailwind border-4 → class attribute מכיל 'border-4'
		expect(card!.className).toContain('border-4');
	});

	it('ribbon variant קיים בDOM', async () => {
		render(Card, { children: makeSnippet('ribbon content'), variant: 'ribbon' });
		await expect.element(page.getByText('ribbon content')).toBeInTheDocument();
	});
});
