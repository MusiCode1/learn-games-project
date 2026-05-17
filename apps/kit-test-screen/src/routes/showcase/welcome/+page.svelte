<script lang="ts">
	import { GameShell, StartScreen, IconButton, SettingsIcon } from 'learn-booster-kit';
	import { goto } from '$app/navigation';
</script>

<GameShell background="base">
	<StartScreen
		title="ברוכים הבאים"
		subtitle="משחק לדוגמה להמחשת ערכת הנושא הנבחרת"
		primaryAction={{ label: 'התחל לשחק', onclick: () => goto('/showcase/game') }}
	>
		{#snippet heroIllustration()}
			<div class="hero">
				<span class="emoji">🎮</span>
			</div>
		{/snippet}
		{#snippet secondaryActions()}
			<div class="secondary">
				<IconButton label="הגדרות" showLabel variant="ghost" onclick={() => alert('settings')}>
					{#snippet icon()}<SettingsIcon />{/snippet}
				</IconButton>
				<a class="back-link" href="/showcase">← חזרה לקטלוג</a>
			</div>
		{/snippet}
	</StartScreen>
</GameShell>

<style>
	.hero {
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--theme-radius-lg);
		background: linear-gradient(135deg, var(--theme-brand-primary), var(--theme-brand-secondary));
		box-shadow: var(--theme-shadow-elevated);
	}
	.emoji {
		font-size: 6rem;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}
	.secondary {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		margin-top: 1rem;
	}
	.back-link {
		color: var(--theme-text-secondary);
		text-decoration: none;
		font-size: var(--theme-font-size-sm);
	}
	.back-link:hover {
		color: var(--theme-brand-primary);
	}
</style>
