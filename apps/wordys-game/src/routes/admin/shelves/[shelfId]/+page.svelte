<script lang="ts">
	import { page } from '$app/stores';
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade } from 'svelte/transition';
	import { getBoxImage } from '$lib/utils/image-helpers';

	let { shelfId } = $derived($page.params);
	let shelf = $derived(shelvesStore.shelves.find((s) => s.id === shelfId));

	let newBoxName = $state('');
	let isEditing = $state<string | null>(null);
	let editName = $state('');
	let editColor = $state('');

	function handleAddBox() {
		if (!newBoxName.trim() || !shelfId) return;
		shelvesStore.addBox(shelfId, newBoxName);
		newBoxName = '';
	}

	function startEdit(box: any) {
		isEditing = box.id;
		editName = box.name;
		editColor = box.color || '#ffffff';
	}

	function saveEdit(boxId: string) {
		if (!editName.trim() || !shelfId) return;
		shelvesStore.updateBox(shelfId, boxId, editName, editColor);
		isEditing = null;
	}

	function toggleCover(boxId: string) {
		if (!shelfId || !shelf) return;
		const isCover = shelf.coverBoxId === boxId;
		shelvesStore.updateShelf(shelfId, shelf.name, undefined, isCover ? '' : boxId);
	}

	function handleDelete(boxId: string) {
		if (!shelfId) return;
		if (confirm('האם אתה בטוח שברצונך למחוק קופסה זו? כל הכרטיסים בתוכה יימחקו.')) {
			shelvesStore.deleteBox(shelfId, boxId);
		}
	}

	function focus(node: HTMLElement) {
		node.focus();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a
			href="/admin/shelves"
			class="p-2 text-slate-500 hover:text-slate-700 bg-white rounded-lg shadow-sm"
		>
			➡️ חזרה
		</a>
		<h2 class="text-2xl font-bold text-slate-700">
			{#if shelf}
				קופסאות במדף: <span class="text-orange-600">{shelf.name}</span>
			{:else}
				מדף לא נמצא
			{/if}
		</h2>
	</div>

	{#if shelf}
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={newBoxName}
				placeholder="שם קופסה חדשה..."
				class="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
				onkeydown={(e) => e.key === 'Enter' && handleAddBox()}
			/>
			<button
				onclick={handleAddBox}
				class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
				disabled={!newBoxName.trim()}
			>
				הוסף קופסה
			</button>
		</div>

		{#if shelf.boxes.length === 0}
			<div
				class="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100"
				in:fade
			>
				<p class="text-lg">אין עדיין קופסאות במדף זה.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each shelf.boxes as box (box.id)}
					<div
						class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-4 flex flex-col gap-4 relative"
						style="border-top: 8px solid {box.color ?? '#ccc'}"
						in:fade
					>
						<!-- Cover Image Area -->
						<div
							class="h-24 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative border-b border-slate-100 rounded-t-lg -mt-4 -mx-4 mb-2"
						>
							{#if getBoxImage(box)}
								<img
									src={getBoxImage(box)}
									alt={box.name}
									class="w-full h-full object-cover object-top"
								/>
							{:else}
								<div class="text-2xl opacity-20">📦</div>
							{/if}
						</div>

						{#if isEditing === box.id}
							<div class="flex flex-col gap-2">
								<input
									type="text"
									bind:value={editName}
									class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
									use:focus
									onkeydown={(e) => e.key === 'Enter' && saveEdit(box.id)}
								/>
								<div class="flex items-center gap-2">
									<span class="text-sm text-slate-500">צבע:</span>
									<input
										type="color"
										bind:value={editColor}
										class="h-8 w-16 cursor-pointer border rounded"
									/>
								</div>
								<div class="flex justify-end gap-2">
									<button
										onclick={() => saveEdit(box.id)}
										class="text-green-600 hover:text-green-700 font-bold bg-green-50 px-2 py-1 rounded"
										>שמור</button
									>
									<button
										onclick={() => (isEditing = null)}
										class="text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded"
										>ביטול</button
									>
								</div>
							</div>
						{:else}
							<div class="flex justify-between items-start">
								<h3 class="text-lg font-bold text-slate-800">{box.name}</h3>
								<div class="flex gap-2">
									<button
										onclick={() => toggleCover(box.id)}
										class="p-1 transition-colors hover:scale-110"
										class:text-yellow-400={shelf.coverBoxId === box.id}
										class:text-slate-300={shelf.coverBoxId !== box.id}
										title={shelf.coverBoxId === box.id
											? 'תמונת כיסוי למדף'
											: 'הגדר כתמונת כיסוי למדף'}
									>
										⭐
									</button>
									<button
										onclick={() => startEdit(box)}
										class="p-1 text-slate-400 hover:text-blue-500 transition-colors"
									>
										✎
									</button>
									<button
										onclick={() => handleDelete(box.id)}
										class="p-1 text-slate-400 hover:text-red-500 transition-colors"
									>
										🗑️
									</button>
								</div>
							</div>
						{/if}

						<div class="text-sm text-slate-500">
							{box.cards.length} כרטיסים
						</div>

						{#if box.coverCardId}
							<div
								class="text-xs text-blue-500 font-medium bg-blue-50 inline-block px-2 py-1 rounded-full w-fit"
							>
								🌟 יש תמונת כיסוי
							</div>
						{/if}

						<a
							href="/admin/shelves/{shelf.id}/{box.id}"
							class="block w-full py-2 bg-orange-50 text-orange-700 text-center rounded-lg font-medium hover:bg-orange-100 transition-colors"
						>
							פתח קופסה
						</a>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="p-8 text-center text-red-500 bg-red-50 rounded-xl">
			המדף המבוקש לא נמצא (מזהה: {shelfId})
		</div>
	{/if}
</div>
