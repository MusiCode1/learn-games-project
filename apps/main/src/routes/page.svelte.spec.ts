import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { AVAILABLE_GAMES } from '$lib/defaults';
import { language } from '$lib/services/language';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('מציג כותרת ראשית', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1, name: language.heroTitle });
		await expect.element(heading).toBeInTheDocument();
	});

	it('מציג קישור לכל משחק זמין', async () => {
		render(Page);

		for (const game of AVAILABLE_GAMES) {
			const gameText = language.games[game.id];
			const link = page.getByRole('link', { name: new RegExp(gameText.title) });

			await expect.element(link).toBeInTheDocument();
		}
	});
});
