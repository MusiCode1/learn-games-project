<script lang="ts">
	import { cooldownProgress } from './cooldown-math.js';

	// היקף מעגל ה-SVG: 2π × r = 2π × 56 ≈ 351.86
	const CIRC = 2 * Math.PI * 56;

	interface Props {
		untilTs: number;
		durationMs: number;
		message?: string;
		subMessage?: string;
		onComplete?: () => void;
	}

	let { untilTs, durationMs, message, subMessage, onComplete }: Props = $props();

	let now = $state(Date.now());
	let completed = $state(false);

	$effect(() => {
		// Reset כשuntilTs משתנה
		completed = false;
		const interval = setInterval(() => {
			now = Date.now();
			if (now >= untilTs && !completed) {
				completed = true;
				onComplete?.();
				clearInterval(interval);
			}
		}, 100);
		return () => clearInterval(interval);
	});

	const progress = $derived(cooldownProgress(now, untilTs, durationMs));
	const remainingSec = $derived(Math.ceil(Math.max(0, untilTs - now) / 1000));
	const isActive = $derived(untilTs > Date.now() || untilTs > now);
</script>

{#if isActive && untilTs > now}
	<div
		class="fixed inset-0 flex items-center justify-center z-50"
		style="background: var(--theme-surface-overlay)"
	>
		<div
			role="alertdialog"
			class="bg-surface-elevated rounded-lg p-8 flex flex-col items-center gap-4 shadow-elevated"
		>
			<!-- טבעת countdown -->
			<div class="relative w-32 h-32">
				<svg width="128" height="128" aria-hidden="true" style="transform: rotate(-90deg)">
					<!-- רקע טבעת -->
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="var(--theme-feedback-error-bg)"
						stroke-width="10"
						fill="none"
					/>
					<!-- קשת התקדמות -->
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="var(--theme-feedback-error)"
						stroke-width="10"
						fill="none"
						stroke-linecap="round"
						stroke-dasharray={CIRC}
						stroke-dashoffset={CIRC * progress}
						style="transition: stroke-dashoffset 100ms linear"
					/>
				</svg>
				<!-- מספר שניות -->
				<span
					class="absolute inset-0 flex items-center justify-center text-5xl font-bold tabular-nums"
					style="color: var(--theme-feedback-error)"
				>
					{remainingSec}
				</span>
			</div>

			{#if message}
				<p class="text-text-secondary font-medium text-lg m-0">{message}</p>
			{/if}
			{#if subMessage}
				<p class="text-text-tertiary text-sm m-0">{subMessage}</p>
			{/if}
		</div>
	</div>
{/if}
