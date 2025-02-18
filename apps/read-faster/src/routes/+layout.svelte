<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div
	class="flex min-h-screen flex-col [background-image:var(--gradient-background)] font-['Rubik'] text-[var(--color-text-primary)]"
	dir="rtl"
>
	<Header />
	<main class="flex-1 overflow-x-hidden pt-[var(--space-16)]">
		{@render children()}
	</main>
	<Footer />
</div>
