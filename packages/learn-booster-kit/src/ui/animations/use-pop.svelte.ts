/**
 * Hook שמייצר state בוליאני שהופך true ל-durationMs ואז חוזר false.
 * משמש להפעלת class `lbk-anim-pop` באלמנט.
 *
 * @example
 * const pop = usePop();
 * <div class:lbk-anim-pop={pop.active}>...</div>
 * <button onclick={() => pop.trigger()}>Correct!</button>
 */
export function usePop(durationMs = 600) {
	let active = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return {
		get active() {
			return active;
		},
		trigger() {
			if (timeoutId) clearTimeout(timeoutId);
			active = false;
			// Force reflow trick: set true on next tick to retrigger animation
			queueMicrotask(() => {
				active = true;
				timeoutId = setTimeout(() => {
					active = false;
					timeoutId = undefined;
				}, durationMs);
			});
		}
	};
}
