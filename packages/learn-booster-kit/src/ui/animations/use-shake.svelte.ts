/**
 * Hook שמייצר state בוליאני שהופך true ל-durationMs ואז חוזר false.
 * משמש להפעלת class `lbk-anim-shake` באלמנט.
 *
 * @example
 * const shake = useShake();
 * <div class:lbk-anim-shake={shake.active}>...</div>
 * <button onclick={() => shake.trigger()}>Wrong!</button>
 */
export function useShake(durationMs = 500) {
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
