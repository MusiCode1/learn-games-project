<script lang="ts">
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade, slide } from 'svelte/transition';
	import type { Shelf, Box, Card } from '$lib/types';
	import AdminGate from '$lib/components/AdminGate.svelte';
	import { goto } from '$app/navigation';

	// State for navigation
	type ViewState = 'shelves' | 'boxes' | 'cards';
	let view = $state<ViewState>('shelves');

	let selectedShelf = $state<Shelf | null>(null);
	let selectedBox = $state<Box | null>(null);
	let selectedCards = $state<Card[]>([]);

	// Selection helpers
	function selectShelf(shelf: Shelf) {
		selectedShelf = shelf;
		view = 'boxes';
	}

	function selectBox(box: Box) {
		selectedBox = box;
		// Default: select all cards
		selectedCards = [...box.cards];
		view = 'cards';
	}

	function toggleCard(card: Card) {
		if (selectedCards.find((c) => c.id === card.id)) {
			selectedCards = selectedCards.filter((c) => c.id !== card.id);
		} else {
			selectedCards = [...selectedCards, card];
		}
	}

	function startGame() {
		if (selectedCards.length > 0 && selectedShelf && selectedBox) {
			// Check if all cards in box are selected
			const allSelected = selectedCards.length === selectedBox.cards.length;

			if (allSelected) {
				// Navigate to game with clean URL
				goto(`/game/${selectedShelf.id}/${selectedBox.id}`);
			} else {
				// Navigate with query params for filtered cards
				const cardIds = selectedCards.map((c) => c.id).join(',');
				goto(`/game/${selectedShelf.id}/${selectedBox.id}?cards=${cardIds}`);
			}
		}
	}

	function goBack() {
		if (view === 'cards') {
			view = 'boxes';
			selectedBox = null;
		} else if (view === 'boxes') {
			view = 'shelves';
			selectedShelf = null;
		}
	}

	// Helpers for cover images
	function getBoxImage(box: Box): string | null {
		if (box.coverCardId) {
			const card = box.cards.find((c) => c.id === box.coverCardId);
			if (card) return card.imageUrl;
		}
		if (box.cards.length > 0) return box.cards[0].imageUrl;
		return null;
	}

	function getShelfImage(shelf: Shelf): string | null {
		if (shelf.coverBoxId) {
			const box = shelf.boxes.find((b) => b.id === shelf.coverBoxId);
			if (box) return getBoxImage(box);
		}
		if (shelf.boxes.length > 0) return getBoxImage(shelf.boxes[0]);
		return null;
	}
</script>

<div class="min-h-screen bg-linear-to-b from-orange-100 to-yellow-50 p-6 font-sans" dir="rtl">
	<!-- Header / Nav -->
	<div class="max-w-6xl mx-auto flex items-center justify-between mb-8">
		<div class="flex items-center gap-4">
			{#if view !== 'shelves'}
				<button
					onclick={goBack}
					class="p-2 bg-white rounded-full shadow-sm hover:bg-orange-100 text-orange-600 transition-colors"
				>
					➡️ חזרה
				</button>
			{/if}
			<h1 class="text-3xl font-bold text-slate-800">
				{#if view === 'shelves'}
					בחר מדף
				{:else if view === 'boxes'}
					מדף: {selectedShelf?.name}
				{:else if view === 'cards'}
					קופסה: {selectedBox?.name}
				{/if}
			</h1>
		</div>

		<AdminGate onUnlock={() => goto('/admin/shelves')}>
			<button
				class="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-slate-600 hover:text-slate-900"
				aria-label="הגדרות"
			>
				⚙️
			</button>
		</AdminGate>
	</div>

	<div class="max-w-6xl mx-auto">
		{#if view === 'shelves'}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
				{#if shelvesStore.shelves.length === 0}
					<div class="col-span-full text-center py-20 text-slate-500">
						<p class="text-xl">אין עדיין מדפים. היכנס להגדרות כדי להוסיף.</p>
					</div>
				{/if}
				{#each shelvesStore.shelves as shelf}
					<button
						onclick={() => selectShelf(shelf)}
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
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="text-4xl opacity-20">📚</div>
							{/if}
							<div
								class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"
							></div>
						</div>

						<div class="flex-1 p-6 bg-white flex flex-col justify-center">
							<h2 class="text-2xl font-black text-slate-800 group-hover:text-orange-600 mb-1">
								{shelf.name}
							</h2>
							<p class="text-slate-500 text-sm">{shelf.boxes.length} קופסאות</p>
						</div>
					</button>
				{/each}
			</div>
		{:else if view === 'boxes'}
			{#if selectedShelf?.boxes.length === 0}
				<div class="text-center py-20 text-slate-500 bg-white/50 rounded-3xl">
					<p class="text-xl">המדף הזה ריק...</p>
				</div>
			{/if}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
				{#each selectedShelf?.boxes ?? [] as box}
					<button
						onclick={() => selectBox(box)}
						class="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border-b-8 border-slate-100 group text-right overflow-hidden flex flex-col items-stretch h-56"
						style="border-color: {box.color || '#e2e8f0'}"
					>
						<!-- Cover Image Area -->
						<div
							class="h-32 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative"
						>
							{#if getBoxImage(box)}
								<img src={getBoxImage(box)} alt={box.name} class="w-full h-full object-cover" />
							{:else}
								<div class="text-4xl opacity-20">📦</div>
							{/if}
							<div
								class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"
							></div>
						</div>

						<div class="flex-1 p-5 bg-white flex flex-col justify-center">
							<h2 class="text-2xl font-black text-slate-800 group-hover:text-blue-600 mb-1">
								{box.name}
							</h2>
							<p class="text-slate-500 text-sm">{box.cards.length} כרטיסים</p>
						</div>
					</button>
				{/each}
			</div>
		{:else if view === 'cards'}
			<div class="flex flex-col gap-8" in:fade>
				<div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
					<div class="flex gap-4">
						<button
							onclick={() => (selectedCards = [...(selectedBox?.cards ?? [])])}
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
					{#each selectedBox?.cards ?? [] as card}
						<button
							onclick={() => toggleCard(card)}
							class="relative aspect-square bg-white rounded-2xl shadow-sm overflow-hidden transition-all border-4"
							class:border-green-500={selectedCards.find((c) => c.id === card.id)}
							class:border-transparent={!selectedCards.find((c) => c.id === card.id)}
							class:scale-95={!selectedCards.find((c) => c.id === card.id)}
							class:opacity-75={!selectedCards.find((c) => c.id === card.id)}
						>
							<img src={card.imageUrl} alt={card.word} class="w-full h-full object-cover" />
							<div
								class="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-lg drop-shadow-md opacity-0 hover:opacity-100 transition-opacity"
							>
								{card.word}
							</div>
							{#if selectedCards.find((c) => c.id === card.id)}
								<div
									class="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-md"
								>
									✓
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
