import { test as base, expect } from '@playwright/test';
import { trackErrors, type ErrorTracker } from './console';

/**
 * Fixture שמספק errorTracker אוטומטי לכל טסט.
 * השימוש: const { page, errorTracker } = test args; ובסוף expect על הרשימות.
 */
export const test = base.extend<{ errorTracker: ErrorTracker }>({
	errorTracker: async ({ page }, use) => {
		const tracker = trackErrors(page);
		await use(tracker);
	}
});

export { expect };
