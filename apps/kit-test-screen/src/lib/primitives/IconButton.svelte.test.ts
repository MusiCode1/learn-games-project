import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import IconButton from 'learn-booster-kit/ui/primitives/IconButton.svelte';

const makeSnippet = (text: string) =>
	createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('IconButton', () => {
	it('חייב label לנגישות', async () => {
		render(IconButton, {
			icon: makeSnippet('🔊'),
			label: 'השמע שוב',
			onclick: () => {}
		});
		await expect
			.element(page.getByRole('button'))
			.toHaveAttribute('aria-label', 'השמע שוב');
	});

	it('לא מציג טקסט ה-label כברירת מחדל', async () => {
		render(IconButton, { icon: makeSnippet('🔊'), label: 'HIDDEN', onclick: () => {} });
		// label לא מופיע כ-text content כשאין showLabel
		const btn = page.getByRole('button').element() as HTMLElement;
		const visibleText = btn.querySelector('[data-label-text]');
		expect(visibleText).toBeNull();
	});

	it('מציג טקסט כש-showLabel=true', async () => {
		render(IconButton, {
			icon: makeSnippet('🔊'),
			label: 'השמע שוב',
			showLabel: true,
			onclick: () => {}
		});
		await expect.element(page.getByRole('button')).toHaveTextContent('השמע שוב');
	});

	it('קורא ל-onclick בלחיצה', async () => {
		const onclick = vi.fn();
		render(IconButton, { icon: makeSnippet('🔊'), label: 'X', onclick });
		await page.getByRole('button').click();
		expect(onclick).toHaveBeenCalledOnce();
	});
});
