import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useShake } from '../../../src/ui/animations/use-shake.svelte';

describe('useShake', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('starts inactive', () => {
		const shake = useShake();
		expect(shake.active).toBe(false);
	});

	it('becomes active after trigger and after microtask flushes', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve(); // flush microtask
		expect(shake.active).toBe(true);
	});

	it('returns to inactive after durationMs', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(101);
		expect(shake.active).toBe(false);
	});

	it('re-triggering during active resets the timer', async () => {
		const shake = useShake(100);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(50);
		shake.trigger();
		await Promise.resolve();
		vi.advanceTimersByTime(80);
		expect(shake.active).toBe(true); // עדיין פעיל, כי טיימר אופס
		vi.advanceTimersByTime(30);
		expect(shake.active).toBe(false);
	});
});
