<script lang="ts">
	import { page } from '$app/stores';
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { getBoxImage } from '$lib/utils/image-helpers';

	const shelfId = $derived($page.params.shelfId);
	const shelf = $derived(shelvesStore.shelves.find((s) => s.id === shelfId));

	function selectBox(boxId: string) {
		goto(`/select/${shelfId}/${boxId}`);
	}
</script>

<div class="max-w-6xl mx-auto p-6" in:fade>
	<div class="flex items-center justify-between mb-8">
		<div class="flex items-center gap-4">
			<button
				onclick={() => goto('/select')}
				class="p-2 bg-white rounded-full shadow-sm hover:bg-orange-100 text-orange-600 transition-colors"
			>
				➡️ חזרה
			</button>
			<h1 class="text-3xl font-bold text-slate-800">
				מדף: {shelf?.name ?? 'טוען...'}
			</h1>
		</div>
	</div>

	{#if !shelf}
		<div class="text-center py-20 text-red-500">
			<p class="text-xl">המדף לא נמצא.</p>
			<button onclick={() => goto('/select')} class="text-blue-500 underline mt-4"
				>חזור לרשימה</button
			>
		</div>
	{:else}
		{#if shelf.boxes.length === 0}
			<div class="text-center py-20 text-slate-500 bg-white/50 rounded-3xl">
				<p class="text-xl">המדף הזה ריק...</p>
			</div>
		{/if}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each shelf.boxes as box}
				<button
					onclick={() => selectBox(box.id)}
					class="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-b-8 border-slate-100 group text-right overflow-hidden flex flex-col items-stretch h-56"
					style="border-color: {box.color || '#e2e8f0'}"
				>
					<!-- Cover Image Area -->
					<div
						class="h-32 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative"
					>
						{#if getBoxImage(box)}
							<img
								src={getBoxImage(box)}
								alt={box.name}
								class="w-full h-full object-cover object-top"
							/>
						{:else}
							<div class="text-4xl opacity-20">📦</div>
						{/if}
						<div
							class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"
						></div>
					</div>

					<div class="flex-1 p-5 bg-white flex flex-col justify-center">
						<h2 class="text-2xl font-bold text-slate-800 group-hover:text-blue-600 mb-1">
							{box.name}
						</h2>
						<p class="text-slate-500 text-sm">{box.cards.length} כרטיסים</p>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
