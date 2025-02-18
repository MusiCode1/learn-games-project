<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children } = $props();
</script>

<div class="mx-auto flex max-w-4xl flex-col items-center px-[var(--space-6)] py-[var(--space-6)]">
	{@render children()}
</div>
