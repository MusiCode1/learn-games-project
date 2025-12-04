<script lang="ts">
	import { wordsStore } from '$lib/stores/words.svelte';
	import { slide } from 'svelte/transition';

	let newWordText = $state('');
	let newWordImage = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				newWordImage = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleAddWord() {
		if (newWordText && newWordImage) {
			wordsStore.addWord(newWordText, newWordImage);
			newWordText = '';
			newWordImage = null;
			if (fileInput) fileInput.value = '';
		}
	}
</script>

<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
	<h2 class="text-xl font-semibold text-slate-700">הוספת מילה חדשה</h2>
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
		<!-- Word Input -->
		<div class="space-y-2">
			<label for="word-text" class="block text-sm font-medium text-slate-600">מילה</label>
			<input
				id="word-text"
				type="text"
				bind:value={newWordText}
				placeholder="למשל: סוס"
				class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
			/>
		</div>

		<!-- Image Input -->
		<div class="space-y-2">
			<label for="word-image" class="block text-sm font-medium text-slate-600">תמונה</label>
			<input
				id="word-image"
				type="file"
				accept="image/*"
				onchange={handleFileSelect}
				bind:this={fileInput}
				class="block w-full text-sm text-slate-500
				file:mr-4 file:py-2 file:px-4
				file:rounded-full file:border-0
				file:text-sm file:font-semibold
				file:bg-orange-50 file:text-orange-700
				hover:file:bg-orange-100
				cursor-pointer"
			/>
		</div>

		<!-- Submit Button -->
		<button
			onclick={handleAddWord}
			disabled={!newWordText || !newWordImage}
			class="w-full px-6 py-2 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		>
			הוסף מילה
		</button>
	</div>

	<!-- Image Preview -->
	{#if newWordImage}
		<div transition:slide class="mt-4">
			<p class="text-sm text-slate-500 mb-2">תצוגה מקדימה:</p>
			<img
				src={newWordImage}
				alt="Preview"
				class="h-32 w-32 object-cover rounded-xl border-2 border-orange-100 shadow-sm"
			/>
		</div>
	{/if}
</div>
