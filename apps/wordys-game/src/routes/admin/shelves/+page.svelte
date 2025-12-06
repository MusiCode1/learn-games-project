<script lang="ts">
	import { shelvesStore } from '$lib/stores/shelves.svelte';
	import { fade } from 'svelte/transition';
	import { getShelfImage } from '$lib/utils/image-helpers';

	let newShelfName = $state('');
	let isEditing = $state<string | null>(null);
	let editName = $state('');
	let editColor = $state('');

	function handleAddShelf() {
		if (!newShelfName.trim()) return;
		shelvesStore.addShelf(newShelfName);
		newShelfName = '';
	}

	function startEdit(shelf: any) {
		isEditing = shelf.id;
		editName = shelf.name;
		editColor = shelf.color || '#FDBA74';
	}

	function saveEdit(id: string) {
		if (!editName.trim()) return;
		shelvesStore.updateShelf(id, editName, editColor);
		isEditing = null;
	}

	function handleDelete(id: string) {
		if (confirm('האם אתה בטוח שברצונך למחוק מדף זה? כל הקופסאות והכרטיסים בתוכו יימחקו.')) {
			shelvesStore.deleteShelf(id);
		}
	}

	function focus(node: HTMLElement) {
		node.focus();
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-slate-700">ניהול מדפים</h2>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={newShelfName}
				placeholder="שם מדף חדש..."
				class="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
				onkeydown={(e) => e.key === 'Enter' && handleAddShelf()}
			/>
			<button
				onclick={handleAddShelf}
				class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-sm"
				disabled={!newShelfName.trim()}
			>
				הוסף מדף
			</button>
		</div>
	</div>

	{#if shelvesStore.shelves.length === 0}
		<div
			class="text-center py-12 text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100"
			in:fade
		>
			<p class="text-lg">אין עדיין מדפים. צור את המדף הראשון!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each shelvesStore.shelves as shelf (shelf.id)}
				<div
					class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-hidden flex flex-col relative"
					style="border-top: 8px solid {shelf.color ?? '#ccc'}"
					in:fade
				>
					<!-- Cover Image Area -->
					<div
						class="h-32 w-full bg-slate-100 flex items-center justify-center overflow-hidden relative border-b border-slate-100"
					>
						{#if getShelfImage(shelf)}
							<img
								src={getShelfImage(shelf)}
								alt={shelf.name}
								class="w-full h-full object-cover object-top"
							/>
						{:else}
							<div class="text-3xl opacity-20">📚</div>
						{/if}
					</div>

					<div class="p-6 flex-1">
						{#if isEditing === shelf.id}
							<div class="flex flex-col gap-2 mb-4">
								<input
									type="text"
									bind:value={editName}
									class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
									use:focus
									onkeydown={(e) => e.key === 'Enter' && saveEdit(shelf.id)}
								/>
								<div class="flex items-center gap-2">
									<span class="text-sm text-slate-500">צבע:</span>
									<input
										type="color"
										bind:value={editColor}
										class="h-8 w-16 cursor-pointer border rounded"
									/>
								</div>
								<div class="flex justify-end gap-2 mt-2">
									<button
										onclick={() => saveEdit(shelf.id)}
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
							<div class="flex justify-between items-start mb-4">
								<h3 class="text-xl font-bold text-slate-800 break-words">{shelf.name}</h3>
								<div class="flex gap-2">
									<button
										onclick={() => startEdit(shelf)}
										class="p-1 text-slate-400 hover:text-blue-500 transition-colors"
										title="ערוך שם וצבע"
									>
										✎
									</button>
									<button
										onclick={() => handleDelete(shelf.id)}
										class="p-1 text-slate-400 hover:text-red-500 transition-colors"
										title="מחק מדף"
									>
										🗑️
									</button>
								</div>
							</div>
						{/if}

						<div class="text-sm text-slate-500 mb-2">
							{shelf.boxes.length} קופסאות
						</div>

						{#if shelf.coverBoxId}
							<div
								class="text-xs text-orange-500 font-medium bg-orange-50 inline-block px-2 py-1 rounded-full"
							>
								🌟 יש תמונת כיסוי
							</div>
						{/if}
					</div>

					<a
						href="/admin/shelves/{shelf.id}"
						class="block w-full py-3 bg-slate-50 text-center text-slate-600 font-medium hover:bg-slate-100 transition-colors border-t border-slate-100"
					>
						פתח מדף
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>
