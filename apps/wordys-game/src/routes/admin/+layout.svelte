<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	let activeTab = $derived(
		$page.url.pathname.includes('/admin/settings')
			? 'settings'
			: $page.url.pathname.includes('/admin/shelves')
				? 'shelves'
				: 'words'
	);
</script>

<div class="min-h-screen bg-slate-50 p-8 font-sans" dir="rtl">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold text-slate-800">ממשק ניהול</h1>
			<a
				href="/"
				class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hovder:bg-slate-300 transition-colors"
			>
				חזרה למשחק
			</a>
		</div>

		<!-- Tabs -->
		<div class="flex space-x-4 space-x-reverse border-b border-slate-200">
			<a
				href="/admin/shelves"
				class="px-4 py-2 font-medium transition-colors border-b-2"
				class:text-orange-600={activeTab === 'shelves'}
				class:border-orange-600={activeTab === 'shelves'}
				class:text-slate-500={activeTab !== 'shelves'}
				class:border-transparent={activeTab !== 'shelves'}
				class:hover:text-slate-700={activeTab !== 'shelves'}
			>
				ניהול מדפים
			</a>
			<a
				href="/admin/words"
				class="px-4 py-2 font-medium transition-colors border-b-2"
				class:text-orange-600={activeTab === 'words'}
				class:border-orange-600={activeTab === 'words'}
				class:text-slate-500={activeTab !== 'words'}
				class:border-transparent={activeTab !== 'words'}
				class:hover:text-slate-700={activeTab !== 'words'}
			>
				ניהול מילים (ישן)
			</a>
			<a
				href="/admin/settings"
				class="px-4 py-2 font-medium transition-colors border-b-2"
				class:text-orange-600={activeTab === 'settings'}
				class:border-orange-600={activeTab === 'settings'}
				class:text-slate-500={activeTab !== 'settings'}
				class:border-transparent={activeTab !== 'settings'}
				class:hover:text-slate-700={activeTab !== 'settings'}
			>
				הגדרות משחק
			</a>
		</div>

		<!-- Content -->
		<div in:fade={{ duration: 200 }}>
			{@render children()}
		</div>
	</div>
</div>
