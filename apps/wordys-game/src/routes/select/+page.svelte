<script lang="ts">
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { getShelfImage } from '$lib/utils/image-helpers';

	function selectShelf(shelfId: string) {
		goto(`/select/${shelfId}`);
	}
</script>

<div class="max-w-6xl mx-auto p-6" in:fade>
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold text-slate-800">בחר מדף</h1>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#if shelvesStore.shelves.length === 0}
			<div class="col-span-full text-center py-20 text-slate-500">
				<p class="text-xl">אין עדיין מדפים. היכנס להגדרות כדי להוסיף.</p>
			</div>
		{/if}
		{#each shelvesStore.shelves as shelf}
			<button
				onclick={() => selectShelf(shelf.id)}
				class="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-b-8 border-slate-100 group text-right overflow-hidden flex flex-col items-stretch h-64"
				style="border-color: {shelf.color || '#e2e8f0'}"
			>
				<!-- Cover Image Area -->
				<div
					class="h-40 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative"
				>
					{#if getShelfImage(shelf)}
						<img
							src={getShelfImage(shelf)}
							alt={shelf.name}
							class="w-full h-full object-cover object-top"
						/>
					{:else}
						<div class="text-4xl opacity-20">📚</div>
					{/if}
					<div
						class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"
					></div>
				</div>

				<div class="flex-1 p-6 bg-white flex flex-col justify-center">
					<h2 class="text-2xl font-bold text-slate-800 group-hover:text-orange-600 mb-1">
						{shelf.name}
					</h2>
					<p class="text-slate-500 text-sm">{shelf.boxes.length} קופסאות</p>
				</div>
			</button>
		{/each}
	</div>
</div>
