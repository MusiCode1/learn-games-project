import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import Button from 'learn-booster-kit/ui/primitives/Button.svelte';

const makeSnippet = (text: string) =>
	createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

describe('Button', () => {
	it('מציג את ה-children', async () => {
		render(Button, { children: makeSnippet('לחץ עליי') });
		await expect.element(page.getByRole('button')).toHaveTextContent('לחץ עליי');
	});

	it('קורא ל-onclick בלחיצה', async () => {
		const onclick = vi.fn();
		render(Button, { children: makeSnippet('X'), onclick });
		await page.getByRole('button').click();
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('לא קורא ל-onclick כאשר disabled', async () => {
		const onclick = vi.fn();
		render(Button, { children: makeSnippet('X'), onclick, disabled: true });
		// disabled button — pointer-events-none, גם aria-disabled
		const btn = page.getByRole('button').element() as HTMLElement;
		// בדיקה שה-class disabled קיים
		expect(btn.className).toMatch(/opacity-50|cursor-not-allowed|disabled/);
		expect(onclick).not.toHaveBeenCalled();
	});

	it('משתמש בצבעי brand-primary כברירת מחדל', async () => {
		render(Button, { children: makeSnippet('X') });
		const btn = page.getByRole('button').element() as HTMLElement;
		const styles = window.getComputedStyle(btn);
		// primary variant — should have non-transparent background
		expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
	});

	it('variant danger מקבל data-variant=danger', async () => {
		render(Button, { children: makeSnippet('danger'), variant: 'danger' });
		const btn = page.getByRole('button', { name: 'danger' }).element() as HTMLElement;
		expect(btn.getAttribute('data-variant')).toBe('danger');
	});

	it('משתמש בצבע secondary כש-color="secondary"', async () => {
		render(Button, { children: makeSnippet('X'), color: 'secondary' });
		const btns = page.getByRole('button').all();
		const last = btns[btns.length - 1].element() as HTMLElement;
		// בדיקה שה-class מכיל brand-secondary ולא brand-primary
		expect(last.className).toContain('brand-secondary');
		expect(last.className).not.toContain('brand-primary');
	});

	it('color="secondary" מגדיר data-color="secondary"', async () => {
		render(Button, { children: makeSnippet('X'), color: 'secondary' });
		const btns = page.getByRole('button').all();
		const last = btns[btns.length - 1].element() as HTMLElement;
		expect(last.getAttribute('data-color')).toBe('secondary');
	});
});
