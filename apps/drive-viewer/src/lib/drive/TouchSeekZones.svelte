<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ seek: number }>();
	let flash = $state<'left' | 'right' | null>(null);

	function trigger(direction: 'left' | 'right') {
		dispatch('seek', direction === 'left' ? -10 : 10);
		flash = direction;
		setTimeout(() => {
			flash = null;
		}, 420);
	}
</script>

<div class="zones">
	<button class="zone left" type="button" aria-label="קפיצה אחורה 10 שניות" onclick={() => trigger('left')}></button>
	<button class="zone right" type="button" aria-label="קפיצה קדימה 10 שניות" onclick={() => trigger('right')}></button>
	<div class:active={flash === 'left'} class="flash left">10-</div>
	<div class:active={flash === 'right'} class="flash right">10+</div>
</div>

<style>
	.zones {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		pointer-events: none;
	}

	.zone {
		pointer-events: auto;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.zone:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: -6px;
	}

	.flash {
		position: absolute;
		top: 50%;
		transform: translateY(-50%) scale(0.95);
		padding: 18px 26px;
		border-radius: 999px;
		background: rgba(17, 17, 17, 0.6);
		color: #fff6ed;
		font-size: 2rem;
		font-weight: 700;
		opacity: 0;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	.flash.active {
		opacity: 1;
		transform: translateY(-50%) scale(1);
	}

	.flash.left {
		left: 8%;
	}

	.flash.right {
		right: 8%;
	}

	@media (prefers-reduced-motion: reduce) {
		.flash,
		.flash.active {
			transition: none;
		}
	}
</style>
