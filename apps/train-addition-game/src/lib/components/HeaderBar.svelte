<!--
	בר עליון עם כפתור בית ואינדיקציית סיבוב
-->
<script lang="ts">
	import { gameState } from '$lib/stores/game-state.svelte';

	interface Props {
		/** פונקציה לאיפוס המשחק */
		onReset?: () => void;
	}
	let { onReset }: Props = $props();

	function handleReset() {
		gameState.reset();
		onReset?.();
	}
</script>

<header class="flex items-center justify-between bg-slate-800 px-4 py-3 text-white shadow-md">
	<!-- כפתור בית -->
	<button
		onclick={handleReset}
		class="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
		aria-label="חזרה לתפריט"
	>
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
			/>
		</svg>
	</button>

	<!-- אינדיקציית סיבוב -->
	<div class="flex items-center gap-4 text-lg">
		<span class="text-slate-400">סיבוב:</span>
		<span class="font-bold text-green-400">{gameState.roundNumber}</span>

		<span class="text-slate-400">|</span>

		<span class="text-slate-400">נכון:</span>
		<span class="font-bold text-yellow-400">{gameState.correctCount}</span>
	</div>

	<!-- ריווח -->
	<div class="w-10"></div>
</header>
