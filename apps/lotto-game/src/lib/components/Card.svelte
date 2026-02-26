<script lang="ts">
	import type { Card } from '$lib/utils/gameLogic';
	import { settings } from '$lib/stores/settings.svelte';
	import { playCardFlip } from '$lib/utils/sound';
	import ContentRenderer from './ContentRenderer.svelte';
	import { contentRegistry } from '$lib/content/registry';

	interface Props {
		card: Card;
		onclick: (id: number) => void;
		disabled: boolean;
	}

	let { card, onclick, disabled }: Props = $props();

	const isMemoryMode = $derived(settings.gameMode === 'memory');

	function handleClick() {
		if (!disabled && !card.isMatched) {
			playCardFlip();
			onclick(card.id);
		}
	}

	// חישוב מצב הכרטיס
	const cardState = $derived.by(() => {
		if (card.isMatched) {
			return settings.hideMatchedCards ? 'hidden' : 'matched';
		}
		if (card.isSuccess) return 'success';
		if (card.isError) return 'error';
		if (card.isSelected) return 'selected';
		if (isMemoryMode) return 'facedown';
		return 'idle';
	});

	// האם הכרטיס חשוף (מצב זיכרון)
	const isRevealed = $derived(cardState !== 'facedown');

	// שליפת ה-provider לקבלת הגדרות עיצוב
	const provider = $derived(contentRegistry.get(card.content.providerId));
	const cardStyles = $derived(provider.cardStyles);
</script>

<div class="card-wrapper">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{#if isMemoryMode}
		<!-- מצב זיכרון: כרטיס עם אנימציית flip -->
		<div
			class="card-flip-container {cardStyles?.className ?? ''}"
			class:flipped={isRevealed}
			class:matched={cardState === 'matched'}
			class:hidden={cardState === 'hidden'}
			class:error={cardState === 'error'}
			class:success={cardState === 'success'}
			onclick={handleClick}
			role="button"
			tabindex="0"
		>
			<div class="card-flip-inner">
				<!-- גב הכרטיס -->
				<div class="card-face card-back">
					<div class="card-back-pattern">?</div>
				</div>
				<!-- פנים הכרטיס (תוכן) -->
				<div
					class="card-face card-front"
					class:layout-vertical={cardStyles?.contentLayout === 'vertical'}
					class:layout-horizontal={cardStyles?.contentLayout === 'horizontal'}
					style:font-size={cardStyles?.fontSize}
					style:padding={cardStyles?.padding}
				>
					<ContentRenderer content={card.content} />
				</div>
			</div>
		</div>
	{:else}
		<!-- מצב לוטו: כרטיס רגיל -->
		<div
			class="card {cardStyles?.className ?? ''}"
			class:idle={cardState === 'idle'}
			class:matched={cardState === 'matched'}
			class:hidden={cardState === 'hidden'}
			class:error={cardState === 'error'}
			class:selected={cardState === 'selected'}
			class:success={cardState === 'success'}
			class:layout-vertical={cardStyles?.contentLayout === 'vertical'}
			class:layout-horizontal={cardStyles?.contentLayout === 'horizontal'}
			style:font-size={cardStyles?.fontSize}
			style:padding={cardStyles?.padding}
			onclick={handleClick}
			role="button"
			tabindex="0"
		>
			<ContentRenderer content={card.content} />
		</div>
	{/if}
</div>

<style type="text/postcss">
	@reference "tailwindcss";

	.card-wrapper {
		@apply w-full h-full p-[0.5vmin] flex items-center justify-center;
	}

	/* ===== מצב לוטו (קיים) ===== */

	.card {
		@apply relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden;
		@apply text-[6vmin] font-bold transition-all duration-300 select-none;
		container-type: size;
	}

	.card.layout-vertical {
		@apply flex-col gap-2;
	}

	.card.layout-horizontal {
		@apply flex-row gap-2;
	}

	.card.idle {
		@apply bg-white text-gray-800 border-2 border-blue-200 shadow-lg cursor-pointer;
	}
	.card.idle:hover {
		@apply scale-105;
	}

	.card.matched {
		@apply bg-green-100 text-green-600 border-2 border-green-400 opacity-50 scale-95 cursor-default;
	}

	.card.hidden {
		@apply invisible opacity-0 pointer-events-none;
	}

	.card.error {
		@apply bg-red-100 text-red-600 border-4 border-red-400 animate-pulse cursor-default;
	}

	.card.selected {
		@apply bg-blue-100 text-blue-700 border-4 border-blue-500 scale-110 shadow-xl z-10 cursor-default;
	}

	/* מצב הצלחה (לוטו) — זוהר ירוק */
	.card.success {
		@apply bg-green-50 text-green-700 border-4 border-green-400 scale-110 z-10 cursor-default;
		animation: success-glow 0.8s ease-in-out infinite alternate;
	}

	@keyframes success-glow {
		from { box-shadow: 0 0 15px rgba(34, 197, 94, 0.5), 0 0 30px rgba(34, 197, 94, 0.2); }
		to { box-shadow: 0 0 25px rgba(34, 197, 94, 0.8), 0 0 50px rgba(34, 197, 94, 0.4); }
	}

	/* ===== מצב זיכרון: 3D Flip ===== */

	.card-flip-container {
		@apply relative w-full h-full cursor-pointer;
		perspective: 800px;
		container-type: size;
	}

	.card-flip-inner {
		@apply relative w-full h-full;
		transition: transform 0.5s ease;
		transform-style: preserve-3d;
	}

	.card-flip-container.flipped .card-flip-inner {
		transform: rotateY(180deg);
	}

	.card-face {
		@apply absolute inset-0 w-full h-full rounded-xl flex items-center justify-center overflow-hidden;
		@apply text-[6vmin] font-bold select-none;
		backface-visibility: hidden;
	}

	/* גב הכרטיס */
	.card-back {
		@apply bg-linear-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300;
		@apply shadow-lg;
	}

	.card-back-pattern {
		@apply w-[60%] h-[60%] rounded-lg border-2 border-white/30;
		@apply bg-white/10;
		@apply flex items-center justify-center;
		@apply text-white/40 text-[10cqmin] font-black;
	}

	.card-flip-container:not(.flipped):hover {
		@apply scale-105;
		transition: transform 0.2s ease;
	}

	/* פנים הכרטיס */
	.card-front {
		@apply bg-white text-gray-800 border-2 border-blue-200 shadow-lg;
		transform: rotateY(180deg);
	}

	.card-front.layout-vertical {
		@apply flex-col gap-2;
	}

	.card-front.layout-horizontal {
		@apply flex-row gap-2;
	}

	/* מצבים במצב זיכרון */
	.card-flip-container.matched .card-front {
		@apply bg-green-100 text-green-600 border-2 border-green-400 opacity-50;
	}
	.card-flip-container.matched {
		@apply scale-95 cursor-default;
	}

	.card-flip-container.hidden {
		@apply invisible opacity-0 pointer-events-none;
	}

	.card-flip-container.error .card-front {
		@apply bg-red-100 text-red-600 border-4 border-red-400 animate-pulse;
	}
	.card-flip-container.error {
		@apply cursor-default;
	}

	/* מצב הצלחה (זיכרון) — זוהר על card-front כדי שיסתובב עם הכרטיס */
	.card-flip-container.success .card-front {
		@apply bg-green-50 text-green-700 border-4 border-green-400;
		animation: success-glow 0.8s ease-in-out infinite alternate;
	}
	.card-flip-container.success {
		@apply cursor-default;
	}
</style>
