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
			<div class="hero" aria-hidden="true">
				<svg
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<!-- SVG של מחוון משחק מינימליסטי (D-pad + 2 כפתורים) -->
					<rect x="2" y="8" width="20" height="10" rx="3" />
					<circle cx="7" cy="13" r="1.5" />
					<circle cx="17" cy="13" r="1.5" />
					<line x1="5" y1="11" x2="5" y2="15" />
					<line x1="3" y1="13" x2="7" y2="13" />
				</svg>
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
		color: var(--theme-text-on-brand);
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
