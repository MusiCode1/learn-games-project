<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'compact';

	interface Props {
		leftActions?: Snippet;
		centerInfo?: Snippet;
		rightActions?: Snippet;
		variant?: Variant;
		class?: string;
	}

	let {
		leftActions,
		centerInfo,
		rightActions,
		variant = 'default',
		class: className = ''
	}: Props = $props();

	const paddingClass = $derived(variant === 'compact' ? 'px-3 py-2' : 'px-5 py-3');
</script>

<header
	data-variant={variant}
	class="flex items-center justify-between bg-surface-header text-text-on-header border-b border-border-subtle shadow-card {paddingClass} {className}"
>
	<div class="flex items-center gap-3">
		{#if leftActions}
			{@render leftActions()}
		{/if}
	</div>
	<div class="flex items-center gap-3 flex-1 justify-center">
		{#if centerInfo}
			{@render centerInfo()}
		{/if}
	</div>
	<div class="flex items-center gap-3 justify-end">
		{#if rightActions}
			{@render rightActions()}
		{/if}
	</div>
</header>
