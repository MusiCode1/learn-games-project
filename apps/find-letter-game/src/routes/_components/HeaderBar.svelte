<script lang="ts">
	import { goto } from '$app/navigation';
	import { AdminGate } from 'learn-booster-kit';
	import { language } from '$lib/services/language';
	import { gameState } from '$lib/stores/game-state.svelte';
</script>

<header class="header">
	<div class="left">
		<button class="repeat-btn" onclick={() => gameState.repeatTarget()} aria-label={language.listenAgainLabel}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
				<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
				<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
			</svg>
			<span>{language.listenAgainLabel}</span>
		</button>

		<button class="new-game-btn" onclick={() => gameState.resetGame()}>
			{language.newGameLabel}
		</button>
	</div>

	<div class="center">
		<h1 class="title">{language.gameTitle}</h1>
		<p class="subtitle">{language.headerSubtitle}</p>
	</div>

	<div class="right">
		<div class="score">
			<span class="score-label">{language.scoreLabel}:</span>
			<span class="score-value">{gameState.score}</span>
		</div>

		<!-- כפתור הגדרות מוגן בסיסמה (AdminGate חוסם תלמידים) -->
		<AdminGate onUnlock={() => goto('/settings')}>
			<button class="settings-btn" title={language.settingsLabel} aria-label={language.settingsLabel}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</button>
		</AdminGate>
	</div>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.25rem;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
		flex-shrink: 0;
	}

	.left,
	.right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.right {
		justify-content: flex-end;
	}

	.center {
		text-align: center;
		flex-shrink: 0;
	}

	.title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 900;
		color: #1e3a8a;
	}

	.subtitle {
		margin: 0;
		font-size: 0.85rem;
		color: #64748b;
	}

	.repeat-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		font-weight: 800;
		padding: 0.65rem 1.1rem;
		border-radius: 999px;
		box-shadow: 0 8px 22px rgba(249, 115, 22, 0.35);
		transition: transform 120ms ease;
	}

	.repeat-btn:hover {
		transform: translateY(-1px);
	}

	.repeat-btn:active {
		transform: translateY(0);
	}

	.new-game-btn {
		background: #f1f5f9;
		color: #0f172a;
		font-weight: 700;
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid #e2e8f0;
	}

	.new-game-btn:hover {
		background: #e2e8f0;
	}

	.score {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #eff6ff;
		color: #1d4ed8;
		font-weight: 800;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		border: 1px solid #bfdbfe;
	}

	.score-value {
		font-size: 1.2rem;
		min-width: 1.5rem;
		text-align: center;
	}

	.settings-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: #f1f5f9;
		color: #475569;
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		transition:
			background 120ms ease,
			color 120ms ease,
			transform 120ms ease;
	}

	.settings-btn:hover {
		background: #e2e8f0;
		color: #0f172a;
		transform: rotate(20deg);
	}
</style>
