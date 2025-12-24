<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import GameContainer from './_components/GameContainer.svelte';
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import type { Card } from '$lib/types';

	let { shelfId, boxId } = $derived($page.params);

	// Get query params for specific card selection
	// Expect ?cards=id1,id2,id3...
	// If empty/missing, use all cards in box
	let selectedCardsIds = $derived($page.url.searchParams.get('cards')?.split(',') ?? null);

	// Derived State: Resolve Shelf, Box, and Cards
	let shelf = $derived(shelvesStore.shelves.find((s) => s.id === shelfId));
	let box = $derived(shelf?.boxes.find((b) => b.id === boxId));

	let gameCards = $derived.by(() => {
		if (!box) return [];
		if (selectedCardsIds) {
			// Filter only selected
			return box.cards.filter((c) => selectedCardsIds.includes(c.id));
		}
		// Default: All cards
		return box.cards;
	});

	function handleExit() {
		// Navigate back to the card selection view
		goto(`/select/${shelfId}/${boxId}`);
	}
</script>

{#if !shelf || !box}
	<div class="h-screen w-full flex items-center justify-center bg-orange-50 text-slate-500">
		<div class="text-center">
			<p class="text-xl font-bold mb-2">שגיאה</p>
			<p>המשחק לא נמצא (מדף או קופסה חסרים)</p>
			<button
				onclick={handleExit}
				class="mt-4 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
			>
				חזור לדף הבית
			</button>
		</div>
	</div>
{:else if gameCards.length === 0}
	<div class="h-screen w-full flex items-center justify-center bg-orange-50 text-slate-500">
		<div class="text-center">
			<p class="text-xl font-bold mb-2">אין כרטיסים</p>
			<p>לא נבחרו כרטיסים למשחק זה.</p>
			<button
				onclick={handleExit}
				class="mt-4 px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
			>
				חזור לדף הבית
			</button>
		</div>
	</div>
{:else}
	<!-- Use key to force re-render if URL params change significantly -->
	{#key `${shelfId}-${boxId}-${selectedCardsIds?.join('-')}`}
		<GameContainer cards={gameCards} onExit={handleExit} />

		<!-- Exit button overlay (redundant if GameContainer has one, but good for safety) -->
		<button
			onclick={handleExit}
			class="absolute top-4 right-4 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm"
			title="יציאה"
		>
			✖️
		</button>
	{/key}
{/if}
