<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { boosterService, ProgressWidget, type Config } from 'learn-booster-kit';
	import HeaderBar from '../_components/HeaderBar.svelte';
	import Board from '../_components/Board.svelte';
	import CooldownOverlay from '../_components/CooldownOverlay.svelte';
	import { gameState } from '$lib/stores/game-state.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { language } from '$lib/services/language';

	// === Booster config (רק לאתחול — אנחנו לא משתמשים ב-turnsPerReward שלו;
	// המקור לפרגרס הוא ההגדרות המקומיות שלנו: boardsPerSet × questionsPerBoard) ===
	let boosterConfig = $state<Config>();
	let unsubscribeConfig: (() => void) | undefined;

	onMount(async () => {
		// אם נכנסו ישירות ל-/play (כתובת/רענון) — אין user gesture, ה-TTS ייחסם.
		// מחזירים למסך הפתיחה כדי שהמשתמש יתחיל דרך הכפתור.
		// `status === 'IDLE'` אומר ש-resetGame עוד לא רץ — כלומר זו לא כניסה דרך מסך הפתיחה.
		if (gameState.status === 'IDLE') {
			goto('/');
			return;
		}

		if (settings.boosterEnabled) {
			try {
				await boosterService.init();
				unsubscribeConfig = boosterService.config.subscribe((v) => {
					boosterConfig = v;
				});
			} catch (e) {
				console.warn('[booster] init in /play failed:', e);
			}
		}
	});

	onDestroy(() => unsubscribeConfig?.());

	const isLocked = $derived(
		gameState.status === 'SUCCESS' ||
			gameState.status === 'COOLDOWN' ||
			gameState.status === 'IDLE' ||
			gameState.status === 'REWARD'
	);

	// כרטיס המנצח (להבזק הצלחה)
	const successId = $derived(
		gameState.status === 'SUCCESS' && gameState.target ? gameState.target.id : null
	);

	// ה-progress max הוא מספר התשובות הנכונות הנדרש לפרס:
	// boardsPerSet × effectiveQuestionsPerBoard.
	const progressMax = $derived(settings.totalQuestionsPerSet);
</script>

<HeaderBar />

<main class="game-main">
	<!-- Progress Widget בצד הלוח (פינה שמאלית) — כמו במשחקים האחרים -->
	{#if settings.boosterEnabled && boosterConfig}
		<div class="progress-widget-pos">
			<ProgressWidget
				value={gameState.correctInCurrentSet}
				max={progressMax}
				orientation="vertical"
				label="לפרס"
			/>
		</div>
	{/if}

	{#if gameState.status === 'IDLE'}
		<div class="empty">{language.startPrompt}</div>
	{:else}
		<Board
			board={gameState.board}
			shakingId={gameState.shakingId}
			{successId}
			disabled={isLocked}
			gridSize={settings.gridSize}
			onCardClick={(card) => gameState.handleClick(card)}
		/>
	{/if}

	<!-- overlay ספירה לאחור — מוצג מעל הלוח בזמן עונש על טעות -->
	{#if gameState.status === 'COOLDOWN'}
		<CooldownOverlay
			untilTs={gameState.cooldownUntilTs}
			durationMs={settings.cooldownMs}
		/>
	{/if}
</main>

<style>
	.game-main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		min-height: 0;
		position: relative;
	}

	/* ProgressWidget מקובע בפינה השמאלית של אזור המשחק (RTL → "צד" של הלוח) */
	.progress-widget-pos {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 20;
		pointer-events: auto;
	}

	.empty {
		font-size: 1.5rem;
		color: #475569;
		text-align: center;
	}
</style>
