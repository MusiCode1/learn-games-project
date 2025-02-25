import { type TransitionConfig } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';

export function createTransition(duration: number) {
	return () => new Promise((resolve) => setTimeout(resolve, duration));
}

export function fade(
	node: Element,
	{ delay = 0, duration = 300 }: { delay?: number; duration?: number } = {}
): TransitionConfig {
	return {
		delay,
		duration,
		easing: cubicInOut,
		css: (t) => `opacity: ${t}`
	};
}
