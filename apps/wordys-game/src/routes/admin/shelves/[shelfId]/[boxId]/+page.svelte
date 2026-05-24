<script lang="ts">
	import { page } from '$app/stores';
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { slide, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import type { Card } from '$lib/types';
	import { getCardImage } from '$lib/services/assets';
	import { cardImageStore } from '$lib/services/card-images.svelte';

	let { data }: { data: PageData } = $props();
	let { shelfId, boxId } = $derived($page.params);
	let shelf = $derived(shelvesStore.shelves.find((s) => s.id === shelfId));
	let box = $derived(shelf?.boxes.find((b) => b.id === boxId));

	let newCardWord = $state('');
	// קובץ התמונה החדש שנבחר (מקור האמת); ה-URL לתצוגה נגזר ממנו דרך URL.createObjectURL
	let newCardImageFile = $state<File | null>(null);
	// URL זמני לתצוגה מקדימה — מנוהל ידנית כדי שנוכל לשחרר אותו (revokeObjectURL)
	let newCardImagePreview = $state<string | null>(null);
	let newCardAudio = $state('');
	let editingCardId = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	let availableSounds = $derived(data.sounds);

	// סטטוס שליחה: יש מילה + תמונה (חדשה או קיימת לכרטיס שעורכים)
	let canSubmit = $derived.by(() => {
		if (!newCardWord) return false;
		if (newCardImageFile) return true;
		// במצב עריכה — מותר לשמור גם בלי לשנות תמונה
		if (editingCardId && cardImageStore.get(editingCardId)) return true;
		return false;
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			// שחרור preview קודם אם קיים
			if (newCardImagePreview) URL.revokeObjectURL(newCardImagePreview);
			newCardImageFile = file;
			newCardImagePreview = URL.createObjectURL(file);
		}
	}

	async function handleSubmitCard() {
		if (!canSubmit || !shelfId || !boxId) return;

		let cardId: string;

		if (editingCardId) {
			shelvesStore.updateCard(shelfId, boxId, editingCardId, { word: newCardWord });
			cardId = editingCardId;
		} else {
			cardId = shelvesStore.addCard(shelfId, boxId, { word: newCardWord });
		}

		// אם נבחר קובץ חדש — שמירה ל-IndexedDB
		if (newCardImageFile) {
			try {
				await cardImageStore.save(cardId, newCardImageFile);
			} catch (e) {
				console.error('Failed to save image to IndexedDB', e);
				alert('שמירת התמונה נכשלה. ראה Console.');
			}
		}

		resetForm();
	}

	function startEdit(card: Card) {
		editingCardId = card.id;
		newCardWord = card.word;
		newCardImageFile = null;
		// אין צורך ב-preview נפרד — התצוגה המקדימה תיקח את התמונה הקיימת (IDB או CDN)
		if (newCardImagePreview) URL.revokeObjectURL(newCardImagePreview);
		newCardImagePreview = null;
		newCardAudio = '';

		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function resetForm() {
		newCardWord = '';
		newCardImageFile = null;
		if (newCardImagePreview) URL.revokeObjectURL(newCardImagePreview);
		newCardImagePreview = null;
		newCardAudio = '';
		editingCardId = null;
		if (fileInput) fileInput.value = '';
	}

	function handleDeleteCard(cardId: string) {
		if (!shelfId || !boxId) return;
		if (confirm('האם אתה בטוח שברצונך למחוק כרטיס זה?')) {
			shelvesStore.deleteCard(shelfId, boxId, cardId);
			if (editingCardId === cardId) resetForm();
		}
	}

	function toggleCover(cardId: string) {
		if (!shelfId || !boxId || !box) return;
		const isCover = box.coverCardId === cardId;
		shelvesStore.updateBox(shelfId, boxId, box.name, undefined, isCover ? '' : cardId);
	}

	// URL שמוצג ב-preview — קובץ חדש > תמונה קיימת בעריכה > כלום
	let previewUrl = $derived.by(() => {
		if (newCardImagePreview) return newCardImagePreview;
		if (editingCardId) {
			const card = box?.cards.find((c) => c.id === editingCardId);
			if (card) return getCardImage(card);
		}
		return null;
	});
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<a
			href="/admin/shelves/{shelfId}"
			class="p-2 text-slate-500 hover:text-slate-700 bg-white rounded-lg shadow-sm"
		>
			➡️ חזרה
		</a>
		<h2 class="text-2xl font-bold text-slate-700">
			{#if shelf && box}
				כרטיסים בקופסה: <span class="text-orange-600">{box.name}</span>
				<span class="text-sm font-normal text-slate-400">(במדף: {shelf.name})</span>
			{:else}
				קופסה לא נמצאת
			{/if}
		</h2>
	</div>

	{#if box}
		<!-- Add/Edit Card Form -->
		<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
			<h3 class="text-lg font-semibold text-slate-700">
				{#if editingCardId}
					עריכת כרטיס
				{:else}
					הוספת כרטיס חדש
				{/if}
			</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
				<!-- Word -->
				<div class="space-y-2">
					<label for="card-word" class="block text-sm font-medium text-slate-600">מילה</label>
					<input
						id="card-word"
						type="text"
						bind:value={newCardWord}
						placeholder="למשל: סוס"
						class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
					/>
				</div>

				<!-- Image -->
				<div class="space-y-2">
					<label for="card-image" class="block text-sm font-medium text-slate-600">תמונה</label>
					<input
						id="card-image"
						type="file"
						accept="image/*"
						onchange={handleFileSelect}
						bind:this={fileInput}
						class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
					/>
				</div>

				<!-- Audio -->
				<div class="space-y-2">
					<label for="card-audio" class="block text-sm font-medium text-slate-600"
						>שמע (מתוך static/sounds)</label
					>
					<select
						id="card-audio"
						bind:value={newCardAudio}
						class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none bg-white"
					>
						<option value="">-- ללא שמע --</option>
						{#each availableSounds as sound}
							<option value={sound}>{sound}</option>
						{/each}
					</select>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-2">
					<button
						onclick={handleSubmitCard}
						disabled={!canSubmit}
						class="flex-1 px-4 py-2 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						class:bg-orange-500={!editingCardId}
						class:hover:bg-orange-600={!editingCardId}
						class:bg-blue-500={editingCardId}
						class:hover:bg-blue-600={editingCardId}
					>
						{#if editingCardId}
							עדכן
						{:else}
							הוסף
						{/if}
					</button>
					{#if editingCardId}
						<button
							onclick={resetForm}
							class="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-all"
						>
							ביטול
						</button>
					{/if}
				</div>
			</div>

			{#if previewUrl}
				<div transition:slide class="mt-4">
					<p class="text-sm text-slate-500 mb-2">
						תצוגה מקדימה{newCardImageFile ? ' (קובץ חדש)' : ' (תמונה קיימת)'}:
					</p>
					<div class="flex items-center gap-4">
						<img
							src={previewUrl}
							alt="Preview"
							class="h-24 w-24 object-cover rounded-xl border-2 border-orange-100 shadow-sm"
						/>
						{#if newCardAudio}
							<audio controls src={`/sounds/${newCardAudio}`} class="h-10"></audio>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<!-- Cards List -->
		<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
			<h3 class="text-lg font-semibold text-slate-700 mb-6">רשימת כרטיסים ({box.cards.length})</h3>

			{#if box.cards.length === 0}
				<div class="text-center py-12 text-slate-400">
					<p>אין כרטיסים בקופסה זו.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{#each box.cards as card (card.id)}
						<div
							transition:fade
							class="relative group p-3 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all flex flex-col items-center text-center gap-3"
							class:ring-2={editingCardId === card.id || box.coverCardId === card.id}
							class:ring-blue-400={editingCardId === card.id}
							class:ring-yellow-400={box.coverCardId === card.id && editingCardId !== card.id}
						>
							<img
								src={getCardImage(card)}
								alt={card.word}
								class="w-full h-32 object-cover object-top rounded-lg bg-white"
							/>
							<div class="w-full">
								<h4 class="text-lg font-bold text-slate-800">{card.word}</h4>
								<!-- Removed explicit audioUrl check as it's dynamic now. Could verify against manifest here if needed. -->
							</div>

							<!-- Actions -->
							<div class="absolute top-2 left-2 flex gap-1 transition-opacity">
								<button
									onclick={() => toggleCover(card.id)}
									class="p-2 bg-white/90 rounded-full shadow-sm hover:scale-110"
									class:text-yellow-400={box.coverCardId === card.id}
									class:text-slate-300={box.coverCardId !== card.id}
									title={box.coverCardId === card.id
										? 'תמונת כיסוי לקופסה'
										: 'הגדר כתמונת כיסוי לקופסה'}
								>
									⭐
								</button>
								<button
									onclick={() => startEdit(card)}
									class="p-2 bg-white/90 text-blue-500 rounded-full shadow-sm hover:bg-blue-50"
									title="ערוך כרטיס"
								>
									✎
								</button>
								<button
									onclick={() => handleDeleteCard(card.id)}
									class="p-2 bg-white/90 text-red-500 rounded-full shadow-sm hover:bg-red-50"
									title="מחק כרטיס"
								>
									🗑️
								</button>
							</div>

							{#if box.coverCardId === card.id}
								<div class="absolute top-2 right-2 text-yellow-400 text-xl drop-shadow-md">⭐</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
