<!--
	Overlay הדרכה - מוצג אחרי 2 טעויות
-->
<script lang="ts">
	import { gameState } from '$lib/stores/game-state.svelte';

	const isVisible = $derived(gameState.state === 'ASSIST_OVERLAY');

	function handleClose() {
		gameState.closeAssist();
	}
</script>

{#if isVisible}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-4 max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
			<h2 class="mb-6 text-2xl font-bold text-slate-800">בוא נספור יחד</h2>

			<!-- ויזואליזציה של הקבוצות -->
			<div class="mb-6 flex flex-wrap items-center justify-center gap-2">
				<!-- קבוצה A -->
				{#each Array(gameState.round.a) as _}
					<div class="h-10 w-10 rounded-lg bg-green-500 shadow"></div>
				{/each}

				<!-- סימן פלוס -->
				<div class="mx-2 text-3xl font-bold text-slate-600">+</div>

				<!-- קבוצה B -->
				{#each Array(gameState.round.b) as _}
					<div class="h-10 w-10 rounded-lg bg-blue-500 shadow"></div>
				{/each}

				<!-- שווה -->
				<div class="mx-2 text-3xl font-bold text-slate-600">=</div>

				<!-- תשובה -->
				<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-2xl font-bold text-white shadow">
					{gameState.round.correct}
				</div>
			</div>

			<!-- הסבר טקסטואלי -->
			<p class="mb-6 text-lg text-slate-600">
				<span class="font-bold text-green-600">{gameState.round.a}</span>
				+
				<span class="font-bold text-blue-600">{gameState.round.b}</span>
				=
				<span class="font-bold text-purple-600">{gameState.round.correct}</span>
			</p>

			<!-- כפתור סגירה -->
			<button
				onclick={handleClose}
				class="rounded-xl bg-amber-500 px-8 py-3 text-xl font-bold text-white shadow-lg transition-transform hover:bg-amber-600 active:scale-95"
			>
				הבנתי! נמשיך
			</button>
		</div>
	</div>
{/if}
