<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AdminGate from '$lib/components/AdminGate.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-orange-100 to-yellow-50 font-sans relative" dir="rtl">
	<div class="absolute top-4 left-4 z-50">
		<AdminGate
			onUnlock={() => goto(`/admin/shelves?returnUrl=${encodeURIComponent($page.url.pathname)}`)}
		>
			<button
				class="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-slate-600 hover:text-slate-900"
				aria-label="הגדרות"
			>
				⚙️
			</button>
		</AdminGate>
	</div>
	{@render children()}
</div>
