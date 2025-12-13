<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		variant?: 'primary' | 'secondary' | 'icon' | 'round';
		onclick?: () => void;
		children?: Snippet;
		ariaLabel?: string;
		class?: string;
	}

	let {
		disabled = false,
		variant = 'primary',
		onclick,
		children,
		ariaLabel,
		class: className = ''
	}: Props = $props();
</script>

<button
	{disabled}
	class="
		{variant === 'round' ? 'rounded-full' : 'rounded-lg'}

		{variant === 'primary'
		? 'from-primary to-secondary hover:shadow-primary/20 bg-linear-to-r/oklch text-white hover:shadow-lg'
		: variant === 'secondary'
			? 'from-secondary to-accent hover:shadow-secondary/20 bg-linear-to-r/oklch text-white hover:shadow-lg'
			: variant === 'round'
				? 'bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center'
				: 'text-primary hover:bg-primary/10 bg-transparent'}

		{disabled
		? 'cursor-not-allowed opacity-50'
		: variant === 'round'
			? 'cursor-pointer transition-all hover:scale-110'
			: 'cursor-pointer transition-all hover:-translate-y-0.5'}

		{variant === 'icon' ? 'p-2' : variant === 'round' ? '' : 'px-6 py-3'}

		{className}
	"
	{onclick}
	aria-label={ariaLabel}
>
	{#if children}
		{@render children()}
	{/if}
</button>
