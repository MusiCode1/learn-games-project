<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';
	type Color = 'primary' | 'secondary';

	interface Props {
		variant?: Variant;
		size?: Size;
		color?: Color;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		'aria-label'?: string;
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'primary',
		size = 'md',
		color = 'primary',
		disabled = false,
		type = 'button',
		onclick,
		'aria-label': ariaLabel,
		children,
		class: className = ''
	}: Props = $props();

	// variant + color combo — reactive via $derived.by
	const variantClass = $derived.by(() => {
		if (variant === 'primary') {
			return color === 'secondary'
				? 'bg-brand-secondary text-text-on-brand hover:bg-brand-secondary-hover'
				: 'bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover';
		}
		if (variant === 'ghost') {
			return color === 'secondary'
				? 'bg-transparent text-brand-secondary hover:bg-surface-sunken'
				: 'bg-transparent text-text-primary hover:bg-surface-sunken';
		}
		if (variant === 'secondary') {
			// neutral surface — color prop ignored
			return 'bg-surface-sunken text-text-primary border border-border-subtle hover:bg-border-subtle';
		}
		// danger — always red, color prop ignored
		return 'bg-feedback-error text-text-on-feedback hover:opacity-90';
	});

	const sizeClasses: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-sm min-h-[44px]',
		md: 'px-4 py-2 text-base min-h-[52px]',
		lg: 'px-6 py-3 text-lg min-h-[70px]'
	};

	const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

	const baseClasses =
		'inline-flex items-center justify-center font-bold rounded-pill transition-colors focus-visible:shadow-focus focus-visible:outline-none';
</script>

<button
	{type}
	aria-label={ariaLabel}
	aria-disabled={disabled}
	data-variant={variant}
	data-color={color}
	class="{baseClasses} {variantClass} {sizeClasses[size]} {disabled
		? disabledClasses
		: ''} {className}"
	{onclick}
>
	{#if children}
		{@render children()}
	{/if}
</button>
