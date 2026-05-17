<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'solid' | 'subtle' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		icon?: Snippet;
		label: string;
		variant?: Variant;
		size?: Size;
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
		disabled = false,
		onclick,
		showLabel = false,
		class: className = ''
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		solid: 'bg-brand-primary text-text-on-brand',
		subtle: 'bg-surface-sunken text-text-secondary hover:text-text-primary',
		ghost: 'bg-transparent text-text-secondary hover:bg-surface-sunken'
	};

	// Reactive: sizeClasses depends on showLabel which is a prop
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
	{onclick}
	class="{baseClasses} {variantClasses[variant]} {sizeClass} {className}"
>
	{#if icon}
		{@render icon()}
	{/if}
	{#if showLabel}
		<span>{label}</span>
	{/if}
</button>
