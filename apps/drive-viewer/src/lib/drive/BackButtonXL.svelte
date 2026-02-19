<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let { label = 'חזור', hint = '' } = $props();
	const dispatch = createEventDispatcher<{ click: void }>();
</script>

<button
	class="back"
	type="button"
	aria-label={label}
	onclick={() => dispatch('click')}
>
	<span class="icon" aria-hidden="true">
		<svg viewBox="0 0 48 48" role="presentation">
			<path
				d="M30 10L16 24l14 14"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="5"
			/>
		</svg>
	</span>
	<span class="labels">
		<span class="label">{label}</span>
		{#if hint}
			<span class="hint">{hint}</span>
		{/if}
	</span>
</button>

<style>
	.back {
		position: fixed;
		top: 24px;
		right: 24px;
		z-index: 10;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 22px;
		font-size: 1.2rem;
		border: none;
		border-radius: 999px;
		background: #fff1dc;
		color: var(--ink);
		box-shadow: 0 10px 24px rgba(43, 29, 23, 0.18);
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.back:hover {
		transform: translateY(-2px);
		box-shadow: 0 14px 30px rgba(43, 29, 23, 0.2);
	}

	.back:focus-visible {
		outline: 3px solid var(--focus);
		outline-offset: 4px;
	}

	.icon {
		width: 42px;
		height: 42px;
		display: grid;
		place-items: center;
		background: #fff;
		border-radius: 50%;
		box-shadow: inset 0 0 0 2px rgba(43, 29, 23, 0.15);
	}

	svg {
		width: 26px;
		height: 26px;
		transform: scaleX(-1);
	}

	.labels {
		display: grid;
		text-align: right;
	}

	.label {
		font-weight: 700;
	}

	.hint {
		font-size: 0.85rem;
		color: var(--ink-muted);
	}

	@media (max-width: 600px) {
		.back {
			top: 16px;
			right: 16px;
			padding: 12px 18px;
		}

		.icon {
			width: 36px;
			height: 36px;
		}
	}
</style>
