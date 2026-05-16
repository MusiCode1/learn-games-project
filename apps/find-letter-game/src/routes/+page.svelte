<script lang="ts">
	import { goto } from '$app/navigation';
	import { AdminGate } from 'learn-booster-kit';
	import { language } from '$lib/services/language';
	import { gameState } from '$lib/stores/game-state.svelte';

	/**
	 * לחיצת ה-CTA — מתחילה את המשחק.
	 *
	 * **הסיבה ש-`resetGame()` רץ כאן ולא ב-onMount של `/play`:**
	 * הדפדפן דורש user gesture בשביל לאפשר `Audio.play()` (autoplay policy).
	 * `gameState.resetGame()` קורא ל-`startBoard()` שמתזמן `setTimeout(250)` ובו
	 * `repeatTarget()` שעושה `Audio.play()`. אם הקריאה לא רצה תחת call-stack של
	 * gesture חי, ה-`play()` עלול להיחסם (במיוחד ב-iOS Safari).
	 * כאן ה-resetGame רץ בתוך ה-click handler — gesture חי, האודיו עובר.
	 */
	function handleStart() {
		gameState.resetGame();
		goto('/play');
	}
</script>

<svelte:head>
	<title>{language.pageTitle}</title>
</svelte:head>

<div class="start-screen" dir="rtl">
	<!-- אייקון הגדרות (AdminGate) — מורה יכול לעבור להגדרות בלי להיכנס למשחק -->
	<div class="settings-corner">
		<AdminGate onUnlock={() => goto('/settings')}>
			<button
				class="settings-btn"
				title={language.settingsLabel}
				aria-label={language.settingsLabel}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
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

	<div class="content">
		<div class="hero-letter" aria-hidden="true">בַּ</div>

		<h1 class="title">{language.gameTitle}</h1>
		<p class="subtitle">{language.startScreenSubtitle}</p>

		<button class="start-btn" onclick={handleStart}>
			<svg
				class="play-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			<span>{language.startButtonLabel}</span>
		</button>

		<p class="tip">{language.startScreenTip}</p>
	</div>
</div>

<style>
	.start-screen {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		position: relative;
		min-height: 0;
	}

	.settings-corner {
		position: absolute;
		top: 1rem;
		/* RTL — אנו רוצים את הגלגל בפינה השמאלית כמו ב-HeaderBar */
		left: 1rem;
		z-index: 20;
	}

	.settings-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: white;
		color: #64748b;
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
		transition:
			background 120ms ease,
			color 120ms ease,
			transform 120ms ease;
	}

	.settings-btn:hover {
		background: #f1f5f9;
		color: #0f172a;
		transform: rotate(20deg);
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		max-width: 480px;
		text-align: center;
	}

	.hero-letter {
		font-size: clamp(7rem, 22vmin, 12rem);
		font-weight: 900;
		color: #1e3a8a;
		line-height: 1;
		/* אנימציית נשימה עדינה — מושכת תשומת לב בלי להיות מטרידה */
		animation: breathe 3.2s ease-in-out infinite;
		text-shadow: 0 8px 30px rgba(30, 58, 138, 0.15);
		user-select: none;
	}

	@keyframes breathe {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.06);
		}
	}

	.title {
		font-size: clamp(2rem, 5vmin, 2.75rem);
		font-weight: 900;
		color: #1e3a8a;
		margin: 0;
	}

	.subtitle {
		font-size: clamp(1rem, 2.5vmin, 1.25rem);
		color: #475569;
		margin: 0;
	}

	.start-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		font-size: clamp(1.1rem, 2.8vmin, 1.4rem);
		font-weight: 800;
		padding: 1rem 2.25rem;
		border-radius: 999px;
		box-shadow: 0 12px 30px rgba(249, 115, 22, 0.4);
		margin-top: 1rem;
		transition:
			transform 150ms ease,
			box-shadow 150ms ease;
		/* אנימציית pulse עדינה כדי למשוך את העין לכפתור */
		animation: pulse 2.4s ease-in-out infinite;
	}

	.start-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 16px 36px rgba(249, 115, 22, 0.5);
		animation-play-state: paused;
	}

	.start-btn:active {
		transform: translateY(0);
		box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
	}

	.play-icon {
		/* בעברית RTL — האייקון אמור להופיע אחרי הטקסט (כלומר משמאל בכיוון הקריאה).
		 * flexbox עם dir="rtl" כבר עושה את זה אוטומטית */
		flex-shrink: 0;
	}

	@keyframes pulse {
		0%, 100% {
			box-shadow: 0 12px 30px rgba(249, 115, 22, 0.4);
		}
		50% {
			box-shadow: 0 12px 30px rgba(249, 115, 22, 0.4),
				0 0 0 12px rgba(249, 115, 22, 0.12);
		}
	}

	.tip {
		font-size: 0.95rem;
		color: #64748b;
		margin: 0.5rem 0 0;
	}
</style>
