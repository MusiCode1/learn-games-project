<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onClick: () => void;
		mode?: '2:3' | '1:1';
	}

	let { children, onClick, mode }: Props = $props();

	if (!mode) mode = '2:3';
	const modeClass = 'mode-' + mode.replace(':', '-');
</script>

<button
	type="button"
	onclick={onClick}
	class="card overflow-hidden rounded-2xl border-2 bg-white
	shadow-lg transition-all duration-300 hover:-translate-y-1
	hover:shadow-xl {modeClass}"
	data-mode={mode}
>
	{@render children()}
</button>

<style type="text/postcss">
	.card {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card.mode-2-3 {
		width: 300px;
		height: 200px;
	}

	.card.mode-1-1 {
		width: 200px;
		height: 200px;
	}

	@media (max-width: 768px) {
		.card.mode-2-3 {
			width: min(300px, 60vw);
			height: min(200px, 40vw);
		}

		.card.mode-1-1 {
			width: min(200px, 40vw);
			height: min(200px, 40vw);
		}
	}
</style>
