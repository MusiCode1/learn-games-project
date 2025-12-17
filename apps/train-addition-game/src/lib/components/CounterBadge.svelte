<!--
	Badge מונה - מציג "כבר יש X" או התקדמות
-->
<script lang="ts">
	import { gameState } from '$lib/stores/game-state.svelte';

	// טקסט דינמי
	const text = $derived.by(() => {
		if (gameState.state === 'ADD_B') {
			return `כבר יש ${gameState.round.a}`;
		} else if (gameState.state === 'CHOOSE_ANSWER' || gameState.state === 'FEEDBACK_CORRECT' || gameState.state === 'FEEDBACK_WRONG') {
			return `${gameState.round.a} + ${gameState.round.b} = ?`;
		}
		return '';
	});
</script>

{#if text}
	<div class="absolute -top-3 left-4 rounded-full bg-slate-700 px-4 py-1 text-sm font-bold text-white shadow-md">
		{text}
	</div>
{/if}
