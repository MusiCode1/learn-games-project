<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'elevated' | 'flat' | 'outlined';
	type Padding = 'none' | 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		padding?: Padding;
		interactive?: boolean;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'elevated',
		padding = 'md',
		interactive = false,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		elevated: 'bg-surface-elevated shadow-card border border-border-subtle/50 rounded-lg',
		flat: 'bg-surface-base rounded-lg',
		outlined: 'bg-transparent border-2 border-border-strong rounded-lg'
	};

	const paddingClasses: Record<Padding, string> = {
		none: '',
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-8'
	};

	const isButton = $derived(onclick !== undefined);
</script>

{#if isButton}
	<button
		type="button"
		{onclick}
		class="{variantClasses[variant]} {paddingClasses[padding]} {interactive
			? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-elevated'
			: ''} {className} w-full text-start"
	>
		{@render children()}
	</button>
{:else}
	<div
		class="{variantClasses[variant]} {paddingClasses[padding]} {interactive
			? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-elevated'
			: ''} {className}"
	>
		{@render children()}
	</div>
{/if}
