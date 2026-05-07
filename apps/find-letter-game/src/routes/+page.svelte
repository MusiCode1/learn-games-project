<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { boosterService, ProgressWidget, type Config } from 'learn-booster-kit';
	import HeaderBar from './_components/HeaderBar.svelte';
	import Board from './_components/Board.svelte';
	import { gameState } from '$lib/stores/game-state.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { language } from '$lib/services/language';

	// === Booster config (לתצוגת ProgressWidget) ===
	let boosterConfig = $state<Config>();
	let unsubscribeConfig: (() => void) | undefined;

	onMount(async () => {
		// התחלת סיבוב ראשון רק כשנטענים בדפדפן
		gameState.startBoard();

		if (settings.boosterEnabled) {
			try {
				await boosterService.init();
				unsubscribeConfig = boosterService.config.subscribe((v) => {
					boosterConfig = v;
				});
			} catch (e) {
				console.warn('[booster] init in +page failed:', e);
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

	const progressMax = $derived(boosterConfig?.turnsPerReward ?? 3);

	// === Cooldown countdown — מציג ספירה לאחור ויזואלית בזמן עונש על טעות ===
	let now = $state(Date.now());
	$effect(() => {
		if (gameState.status !== 'COOLDOWN') return;
		const interval = setInterval(() => {
			now = Date.now();
		}, 100);
		return () => clearInterval(interval);
	});

	const cooldownRemaining = $derived(
		gameState.status === 'COOLDOWN'
			? Math.max(0, Math.ceil((gameState.cooldownUntilTs - now) / 1000))
			: 0
	);
</script>

<HeaderBar />

<main class="game-main">
	<!-- Progress Widget בצד הלוח (פינה שמאלית) — כמו במשחקים האחרים -->
	{#if settings.boosterEnabled && boosterConfig}
		<div class="progress-widget-pos">
			<ProgressWidget
				value={gameState.winsSinceLastReward}
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

	<!-- מחוון cooldown — נצמד לחלק העליון של אזור המשחק במהלך עונש על טעות -->
	{#if cooldownRemaining > 0}
		<div class="cooldown-pill" aria-live="polite">
			<svg
				class="cooldown-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<polyline points="12 6 12 12 16 14" />
			</svg>
			<span class="cooldown-num">{cooldownRemaining}</span>
		</div>
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

	/* פתק "עונש בגלל טעות" — מופיע בראש אזור המשחק עם ספירה לאחור */
	.cooldown-pill {
		position: absolute;
		top: 1rem;
		right: 50%;
		transform: translateX(50%);
		z-index: 30;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: #fef2f2;
		color: #b91c1c;
		font-weight: 800;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		border: 2px solid #fecaca;
		box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
		animation: pulse 1s ease-in-out infinite;
	}

	.cooldown-icon {
		font-size: 1.2rem;
	}

	.cooldown-num {
		font-size: 1.4rem;
		min-width: 1.5rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	@keyframes pulse {
		0%, 100% {
			transform: translateX(50%) scale(1);
		}
		50% {
			transform: translateX(50%) scale(1.05);
		}
	}
</style>
