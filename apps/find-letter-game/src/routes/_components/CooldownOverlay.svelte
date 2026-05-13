<script lang="ts">
	import { language } from '$lib/services/language';
	import { computeCooldownView } from '$lib/utils/cooldown';

	// היקף מעגל ה-SVG: 2π × r = 2π × 56 ≈ 351.86
	const CIRC = 2 * Math.PI * 56;

	interface Props {
		/** timestamp לסיום ה-cooldown (מ-gameState.cooldownUntilTs) */
		untilTs: number;
		/** משך ה-cooldown הכולל במילישניות (מ-settings.cooldownMs) */
		durationMs: number;
	}

	let { untilTs, durationMs }: Props = $props();

	// שעון פנימי מתעדכן כל 50ms להנפשת ה-countdown
	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, 50);
		// ניקוי ה-interval בעת פירוק הקומפוננט
		return () => clearInterval(interval);
	});

	// חישוב מצב ה-cooldown הנוכחי — מחדש בכל שינוי של now
	const view = $derived(computeCooldownView(untilTs, now, durationMs));
</script>

{#if view.isActive}
	<!-- שכבת חסימה מלאה — מופיעה מעל כל התוכן בזמן עונש -->
	<div class="overlay">
		<div
			class="modal"
			role="alertdialog"
			aria-label={language.cooldownTitle}
		>
			<!-- עטיפת הטבעת עם המספר במרכז -->
			<div class="ring-wrap">
				<svg width="128" height="128" aria-hidden="true">
					<!-- מסלול הרקע (אפור בהיר אדמדם) -->
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="#fee2e2"
						stroke-width="10"
						fill="none"
					/>
					<!-- קשת ההתקדמות (אדום — מתקצרת עם הזמן) -->
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="#ef4444"
						stroke-width="10"
						fill="none"
						stroke-linecap="round"
						stroke-dasharray={CIRC}
						stroke-dashoffset={CIRC * (1 - view.progress)}
						style="transition: stroke-dashoffset 50ms linear"
					/>
				</svg>
				<!-- מספר השניות שנותרו, ממורכז מעל ה-SVG -->
				<span class="seconds">{view.remainingSec}</span>
			</div>
			<!-- הטקסט מתחת לטבעת -->
			<p class="hint">{language.cooldownHint}</p>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: absolute;
		inset: 0;
		background: rgba(15, 23, 42, 0.45);
		backdrop-filter: blur(3px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		pointer-events: auto;
	}

	.modal {
		background: white;
		border-radius: 1.5rem;
		padding: 2rem 2.5rem;
		box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.ring-wrap {
		position: relative;
		width: 128px;
		height: 128px;
	}

	/* סיבוב ה-SVG כך שהקשת מתחילה מלמעלה (ברירת מחדל היא מימין) */
	.ring-wrap svg {
		transform: rotate(-90deg);
	}

	.seconds {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.8rem;
		font-weight: 900;
		color: #b91c1c;
		font-variant-numeric: tabular-nums;
	}

	.hint {
		color: #475569;
		font-weight: 600;
		font-size: 1rem;
		margin: 0;
	}
</style>
