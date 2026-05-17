import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePop } from '../../../src/ui/animations/use-pop.svelte';

describe('usePop', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('starts inactive', () => {
		const pop = usePop();
		expect(pop.active).toBe(false);
	});

	it('becomes active after trigger and after microtask flushes', async () => {
		const pop = usePop(100);
		pop.trigger();
		await Promise.resolve();
		expect(pop.active).toBe(true);
	});

	it('returns to inactive after durationMs', async () => {
		const pop = usePop(100);
		pop.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(101);
		expect(pop.active).toBe(false);
	});

	it('default duration is 600ms', async () => {
		const pop = usePop();
		pop.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(599);
		expect(pop.active).toBe(true);
		vi.advanceTimersByTime(2);
		expect(pop.active).toBe(false);
	});
});
