<script lang="ts">
	import type { Snippet } from 'svelte';

	type Background = 'base' | 'sunken';

	interface Props {
		header?: Snippet;
		footer?: Snippet;
		background?: Background;
		children: Snippet;
	}

	let { header, footer, background = 'base', children }: Props = $props();

	const bgClass = $derived(background === 'sunken' ? 'bg-surface-sunken' : 'bg-surface-base');
</script>

<div
	class="flex flex-col {bgClass} font-body text-text-primary"
	style="min-height: 100dvh"
>
	{#if header}
		<div class="shrink-0">
			{@render header()}
		</div>
	{/if}

	<main class="flex-1 overflow-hidden">
		{@render children()}
	</main>

	{#if footer}
		<div class="shrink-0">
			{@render footer()}
		</div>
	{/if}
</div>
