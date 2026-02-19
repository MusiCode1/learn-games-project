<script lang="ts">
	import { createEventDispatcher } from 'svelte';

let { paused = true } = $props();
const dispatch = createEventDispatcher<{ toggle: void }>();
let pulse = $state(false);
let visible = $derived(paused || pulse);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function showPulse() {
	pulse = true;
	if (hideTimer) {
		clearTimeout(hideTimer);
	}
	hideTimer = setTimeout(() => {
		pulse = false;
	}, 700);
}

function toggle() {
	dispatch('toggle');
	showPulse();
}
</script>

<button class:visible class="center" type="button" aria-label="הפעלה או השהייה" onclick={toggle}>
	<span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
</button>

<style type="text/postcss">
	.center {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: none;
		background: rgba(17, 17, 17, 0.55);
		color: #fff7ee;
		font-size: 3rem;
		display: grid;
		place-items: center;
		cursor: pointer;
		opacity: 0;
		transform: scale(0.9);
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.center.visible {
		opacity: 1;
		transform: scale(1);
	}

	.center:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 6px;
	}

	@media (prefers-reduced-motion: reduce) {
		.center {
			transition: none;
		}
	}
</style>
