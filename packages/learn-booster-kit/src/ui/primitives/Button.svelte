<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
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
		disabled = false,
		type = 'button',
		onclick,
		'aria-label': ariaLabel,
		children,
		class: className = ''
	}: Props = $props();

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover',
		secondary:
			'bg-surface-sunken text-text-primary border border-border-subtle hover:bg-border-subtle',
		ghost: 'bg-transparent text-text-primary hover:bg-surface-sunken',
		danger: 'bg-feedback-error text-text-on-feedback hover:opacity-90'
	};

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
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {disabled
		? disabledClasses
		: ''} {className}"
	{onclick}
>
	{#if children}
		{@render children()}
	{/if}
</button>
