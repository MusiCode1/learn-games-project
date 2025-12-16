<script lang="ts">
	import { page } from '$app/stores';
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { Card } from '$lib/types';
	import { getCardImageUrl } from '$lib/services/assets';

	const shelfId = $derived($page.params.shelfId);
	const boxId = $derived($page.params.boxId);

	// Derived state to find the current shelf and box
	const shelf = $derived(shelvesStore.shelves.find((s) => s.id === shelfId));
	const box = $derived(shelf?.boxes.find((b) => b.id === boxId));

	// Local state for selected cards
	let selectedCards = $state<Card[]>([]);

	// Track the last loaded box ID to prevent re-initialization when clearing selection
	let lastBoxId = $state('');

	// Initialize selected cards when a new box is loaded
	$effect(() => {
		if (box && box.id !== lastBoxId) {
			lastBoxId = box.id;
			if (browser) {
				const storageKey = `wordys_selection_${shelfId}_${boxId}`;
				const stored = localStorage.getItem(storageKey);
				if (stored) {
					try {
						const savedIds = JSON.parse(stored);
						// Filter box cards to match saved IDs, handling potential stale IDs
						selectedCards = box.cards.filter((c) => savedIds.includes(c.id));
					} catch (e) {
						console.error('Failed to parse saved selection', e);
						selectedCards = [...box.cards];
					}
				} else {
					// Default to all selected if no save found
					selectedCards = [...box.cards];
				}
			} else {
				selectedCards = [...box.cards];
			}
		}
	});

	// Save selection to local storage whenever it changes
	$effect(() => {
		if (browser && box && lastBoxId === box.id) {
			const storageKey = `wordys_selection_${shelfId}_${boxId}`;
			const cardIds = selectedCards.map((c) => c.id);
			localStorage.setItem(storageKey, JSON.stringify(cardIds));
		}
	});

	function toggleCard(card: Card) {
		if (selectedCards.find((c) => c.id === card.id)) {
			selectedCards = selectedCards.filter((c) => c.id !== card.id);
		} else {
			selectedCards = [...selectedCards, card];
		}
	}

	function startGame() {
		if (selectedCards.length > 0 && shelf && box) {
			// Check if all cards in box are selected
			const allSelected = selectedCards.length === box.cards.length;

			if (allSelected) {
				goto(`/game/${shelf.id}/${box.id}`);
			} else {
				const cardIds = selectedCards.map((c) => c.id).join(',');
				goto(`/game/${shelf.id}/${box.id}?cards=${cardIds}`);
			}
		}
	}
</script>

<div class="max-w-6xl mx-auto p-6" in:fade>
	<div class="flex items-center justify-between mb-8">
		<div class="flex items-center gap-4">
			<button
				onclick={() => goto(`/select/${shelfId}`)}
				class="p-2 bg-white rounded-full shadow-sm hover:bg-orange-100 text-orange-600 transition-colors"
			>
				➡️ חזרה
			</button>
			<div class="flex flex-col">
				<h1 class="text-3xl font-bold text-slate-800">
					קופסה: {box?.name ?? 'טוען...'}
				</h1>
				<span class="text-sm text-slate-500">מדף: {shelf?.name}</span>
			</div>
		</div>
	</div>

	{#if !box}
		<div class="text-center py-20 text-red-500">
			<p class="text-xl">הקופסה לא נמצאה.</p>
			<button onclick={() => goto(`/select/${shelfId}`)} class="text-blue-500 underline mt-4"
				>חזור למדף</button
			>
		</div>
	{:else}
		<div class="flex flex-col gap-8">
			<div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
				<div class="flex gap-4">
					<button
						onclick={() => (selectedCards = [...box.cards])}
						class="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
					>
						בחר הכל
					</button>
					<button
						onclick={() => (selectedCards = [])}
						class="text-sm font-bold text-slate-500 hover:bg-slate-50 px-3 py-1 rounded transition-colors"
					>
						נקה בחירה
					</button>
					<span class="text-slate-400 border-r pr-4 mr-2">
						נבחרו: {selectedCards.length}
					</span>
				</div>
				<button
					onclick={startGame}
					disabled={selectedCards.length === 0}
					class="px-8 py-3 bg-green-500 text-white font-black text-xl rounded-xl shadow-lg hover:bg-green-600 hover:shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
				>
					התחל משחק! ▶
				</button>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{#each box.cards as card}
					<button
						onclick={() => toggleCard(card)}
						class="relative aspect-square bg-white rounded-2xl shadow-sm overflow-hidden transition-all border-4 group"
						class:border-green-500={selectedCards.find((c) => c.id === card.id)}
						class:border-transparent={!selectedCards.find((c) => c.id === card.id)}
						class:scale-95={!selectedCards.find((c) => c.id === card.id)}
						class:opacity-75={!selectedCards.find((c) => c.id === card.id)}
					>
						<img
							src={getCardImageUrl(card.id)}
							alt={card.word}
							class="w-full h-full object-cover object-top"
						/>

						<div
							class="absolute inset-x-0 bottom-0 pt-8 pb-2 px-2 bg-linear-to-t from-black/80 via-black/50 to-transparent text-white font-semibold text-xl text-center"
						>
							{card.word}
						</div>

						{#if selectedCards.find((c) => c.id === card.id)}
							<div
								class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md z-10"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
