<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		disabled?: boolean;
		variant?: 'primary' | 'secondary';
		onclick?: () => void;
		children?: Snippet;
	}

	let { disabled = false, variant = 'primary', onclick, children } = $props();
</script>

<button
	{disabled}
	class="rounded-lg px-6 py-3 text-base {variant === 'primary'
		? 'from-primary to-secondary hover:shadow-primary/20 bg-linear-to-r/oklch text-white hover:shadow-lg'
		: 'from-secondary to-accent hover:shadow-secondary/20 bg-linear-to-r/oklch text-white hover:shadow-lg'} {disabled
		? 'cursor-not-allowed opacity-50'
		: 'cursor-pointer transition-[var(--transition-all)] hover:-translate-y-0.5'}"
	{onclick}
>
	{@render children()}
</button>
