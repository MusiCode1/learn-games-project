<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'solid' | 'subtle' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';
	type Color = 'primary' | 'secondary';

	interface Props {
		icon?: Snippet;
		label: string;
		variant?: Variant;
		size?: Size;
		color?: Color;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		showLabel?: boolean;
		class?: string;
	}

	let {
		icon,
		label,
		variant = 'subtle',
		size = 'md',
		color = 'primary',
		disabled = false,
		onclick,
		showLabel = false,
		class: className = ''
	}: Props = $props();

	// variant + color combo — reactive via $derived.by
	const variantClass = $derived.by(() => {
		if (variant === 'solid') {
			// solid + shadow-elevated (theme-aware glow)
			return color === 'secondary'
				? 'bg-brand-secondary text-text-on-brand shadow-elevated'
				: 'bg-brand-primary text-text-on-brand shadow-elevated';
		}
		if (variant === 'ghost') {
			return color === 'secondary'
				? 'bg-transparent text-brand-secondary hover:bg-surface-sunken'
				: 'bg-transparent text-text-secondary hover:bg-surface-sunken';
		}
		// subtle — color prop ignored
		return 'bg-surface-sunken text-text-secondary hover:text-text-primary';
	});

	// Reactive: sizeClass depends on showLabel
	const sizeClass = $derived(
		showLabel
			? size === 'sm'
				? 'px-3 py-2 gap-2'
				: size === 'lg'
					? 'px-5 py-3 gap-3'
					: 'px-4 py-2 gap-2'
			: size === 'sm'
				? 'w-9 h-9'
				: size === 'lg'
					? 'w-[70px] h-[70px]'
					: 'w-10 h-10'
	);

	const baseClasses =
		'inline-flex items-center justify-center rounded-pill transition-colors focus-visible:shadow-focus focus-visible:outline-none';
</script>

<button
	type="button"
	aria-label={label}
	data-variant={variant}
	data-color={color}
	{onclick}
	class="{baseClasses} {variantClass} {sizeClass} {className}"
>
	{#if icon}
		{@render icon()}
	{/if}
	{#if showLabel}
		<span>{label}</span>
	{/if}
</button>
