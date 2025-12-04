<script lang="ts">
	import { wordsStore } from '$lib/stores/words.svelte';
	import { fade } from 'svelte/transition';

	function handleDeleteWord(id: string) {
		if (confirm('האם אתה בטוח שברצונך למחוק מילה זו?')) {
			wordsStore.removeWord(id);
		}
	}
</script>

<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
	<div class="flex items-center justify-between mb-6">
		<h2 class="text-xl font-semibold text-slate-700">רשימת מילים ({wordsStore.words.length})</h2>
		<button
			onclick={() => {
				if (confirm('האם לאפס את כל המילים לברירת המחדל?')) wordsStore.resetToDefaults();
			}}
			class="text-sm text-red-500 hover:text-red-700 underline"
		>
			אפס לברירת מחדל
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each wordsStore.words as word (word.id)}
			<div
				transition:fade
				class="flex items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-all group"
			>
				<img
					src={word.imageUrl}
					alt={word.word}
					class="w-16 h-16 object-cover rounded-lg bg-white"
				/>
				<div class="mr-4 flex-1">
					<h3 class="text-lg font-bold text-slate-800">{word.word}</h3>
				</div>
				<button
					onclick={() => handleDeleteWord(word.id)}
					class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
					aria-label="מחק"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
				</button>
			</div>
		{/each}
	</div>

	{#if wordsStore.words.length === 0}
		<div class="text-center py-12 text-slate-400">
			<p>אין מילים ברשימה. הוסף מילה חדשה למעלה.</p>
		</div>
	{/if}
</div>
