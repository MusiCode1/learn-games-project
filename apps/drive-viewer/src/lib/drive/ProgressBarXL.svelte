<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let { currentTime = 0, duration = 0 } = $props();
	const dispatch = createEventDispatcher<{ seek: number }>();

	let progress = $derived(duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0);

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		dispatch('seek', Number(target.value));
	}
</script>

<div class="bar">
	<div class="track" style={`--progress: ${progress}%`}>
		<input
			type="range"
			min="0"
			max={duration}
			step="1"
			value={currentTime}
			oninput={handleInput}
			aria-label="פס התקדמות"
		/>
	</div>
</div>

<style type="text/postcss">
	.bar {
		width: min(900px, 90vw);
		margin: 0 auto;
		padding: 6px 16px 20px;
	}

	.track {
		position: relative;
		height: 18px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
	}

	.track::before {
		content: '';
		position: absolute;
		inset: 0;
		width: var(--progress);
		background: linear-gradient(90deg, #f6b07c, #e57a52);
		border-radius: inherit;
		box-shadow: 0 0 18px rgba(229, 122, 82, 0.45);
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 18px;
		background: transparent;
		margin: 0;
		position: relative;
		z-index: 1;
	}

	input[type='range']:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 4px;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
		border: 3px solid #f3a06b;
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: #fff;
		border: 3px solid #f3a06b;
		cursor: pointer;
	}
</style>
