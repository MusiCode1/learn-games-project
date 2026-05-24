<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'elevated' | 'flat' | 'outlined' | 'framed' | 'ribbon';
	type Padding = 'none' | 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		padding?: Padding;
		interactive?: boolean;
		ribbonColor?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'elevated',
		padding = 'md',
		interactive = false,
		ribbonColor,
		onclick,
		class: className = '',
		children
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		elevated: 'bg-surface-elevated shadow-card border border-border-subtle/50 rounded-lg',
		flat: 'bg-surface-base rounded-lg',
		outlined: 'bg-transparent border-2 border-border-strong rounded-lg',
		framed: 'bg-surface-elevated border-4 border-accent-frame rounded-lg',
		ribbon: 'bg-surface-elevated rounded-lg overflow-hidden relative'
	};

	const paddingClasses: Record<Padding, string> = {
		none: '',
		sm: 'p-3',
		md: 'p-5',
		lg: 'p-8'
	};

	const isButton = $derived(onclick !== undefined);

	const ribbonStyle = $derived(ribbonColor ? `--ribbon-color: ${ribbonColor}` : undefined);
</script>

{#if isButton}
	<button
		type="button"
		data-card-variant={variant}
		{onclick}
		style={ribbonStyle}
		class="{variantClasses[variant]} {paddingClasses[padding]} {interactive
			? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-elevated'
			: ''} {className} w-full text-start"
	>
		{@render children()}
		{#if variant === 'ribbon'}
			<span class="card-ribbon-bar" aria-hidden="true"></span>
		{/if}
	</button>
{:else}
	<div
		data-card-variant={variant}
		style={ribbonStyle}
		class="{variantClasses[variant]} {paddingClasses[padding]} {interactive
			? 'cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-elevated'
			: ''} {className}"
	>
		{@render children()}
		{#if variant === 'ribbon'}
			<span class="card-ribbon-bar" aria-hidden="true"></span>
		{/if}
	</div>
{/if}

<style>
	.card-ribbon-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--ribbon-color, var(--theme-brand-secondary));
		border-radius: 0;
	}
</style>
