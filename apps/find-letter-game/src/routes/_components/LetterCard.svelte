<script lang="ts">
	import type { LetterCard as LetterCardType } from '$lib/utils/letters';

	interface Props {
		card: LetterCardType;
		isShaking: boolean;
		isSuccess: boolean;
		disabled: boolean;
		onclick: (card: LetterCardType) => void;
	}

	let { card, isShaking, isSuccess, disabled, onclick }: Props = $props();
</script>

<button
	type="button"
	class="letter-card"
	class:shake={isShaking}
	class:pop-success={isSuccess}
	class:disabled
	{disabled}
	onclick={() => onclick(card)}
	aria-label={card.speak}
>
	<span class="letter">{card.display}</span>
</button>

<style>
	.letter-card {
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		border: 2px solid #e5e7eb;
		border-radius: 1.25rem;
		box-shadow:
			0 1px 0 rgba(15, 23, 42, 0.04),
			0 8px 20px rgba(15, 23, 42, 0.06);
		cursor: pointer;
		transition:
			transform 120ms ease,
			box-shadow 160ms ease,
			border-color 160ms ease,
			background 160ms ease;
		/* הגריד מכתיב את המידות (rows/cols) — אין צורך ב-aspect-ratio */
		width: 100%;
		height: 100%;
		min-height: 0;
		min-width: 0;
		padding: 0;
		/* container query — מאפשר לתוכן הפנימי להגיב לגודל הכרטיס */
		container-type: size;
		container-name: card;
	}

	.letter-card:hover:not(.disabled) {
		transform: translateY(-2px);
		border-color: #fdba74;
		box-shadow: 0 12px 30px rgba(249, 115, 22, 0.18);
	}

	.letter-card:active:not(.disabled) {
		transform: translateY(0);
	}

	.letter-card.disabled {
		cursor: default;
	}

	.letter-card.pop-success {
		background: #dcfce7;
		border-color: #22c55e;
	}

	.letter {
		font-family: 'David', 'Frank Ruehl CLM', 'Times New Roman', serif;
		font-weight: 800;
		color: #1e3a8a;
		/* גודל הפונט מתאים את עצמו לגודל הכרטיס — 60% מהגובה הזמין */
		font-size: 60cqh;
		line-height: 1;
	}
</style>
