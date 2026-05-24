<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'success' | 'warning';

	interface Props {
		label?: string;
		value: number | string;
		variant?: Variant;
		icon?: Snippet;
		class?: string;
	}

	let { label, value, variant = 'default', icon, class: className = '' }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'bg-surface-sunken text-text-primary border-border-subtle',
		success: 'bg-feedback-success-bg text-feedback-success border-transparent',
		warning: 'bg-feedback-warning-bg text-feedback-warning border-transparent'
	};
</script>

<span
	data-variant={variant}
	class="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border {variantClasses[variant]} {className}"
>
	{#if icon}
		{@render icon()}
	{/if}
	{#if label}
		<span class="text-sm">{label}</span>
	{/if}
	<span class="font-bold">{value}</span>
</span>
