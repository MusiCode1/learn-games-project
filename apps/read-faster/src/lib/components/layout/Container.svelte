<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div id="container" class="mx-auto flex h-full max-w-4xl flex-col items-center px-6">
	{@render children()}
</div>
