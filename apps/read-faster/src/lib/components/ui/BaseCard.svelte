<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		onClick: () => void;
	}

	let { children, onClick } = $props();
</script>

<button
	type="button"
	onclick={onClick}
	class="card mx-auto overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
>
	{@render children()}
</button>

<style>
	.card {
		width: 300px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.card {
			width: min(300px, 90vw);
			height: min(200px, 60vw);
		}
	}
</style>
