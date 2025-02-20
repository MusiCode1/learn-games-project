<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div
	class="font-primary flex min-h-screen
	flex-col [background-image:var(--gradient-background)]
	text-[var(--color-text-primary)]"
	dir="rtl"
>
	<Header />
	<main class="flex flex-1 flex-col justify-center overflow-x-hidden">
		{@render children()}
	</main>
	<Footer />
</div>
