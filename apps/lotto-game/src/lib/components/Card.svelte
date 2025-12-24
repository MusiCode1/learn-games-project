<script lang="ts">
	import { isShapeContent, type Card } from '$lib/utils/gameLogic';
	import { playCardFlip } from '$lib/utils/sound';
	import ShapeSvg from './ShapeSvg.svelte';

	interface Props {
		card: Card;
		onclick: (id: number) => void;
		disabled: boolean;
	}

	let { card, onclick, disabled }: Props = $props();

	function handleClick() {
		if (!disabled && !card.isMatched) {
			playCardFlip();
			onclick(card.id);
		}
	}

	// חישוב מצב הכרטיס
	const cardState = $derived.by(() => {
		if (card.isMatched) return 'matched';
		if (card.isError) return 'error';
		if (card.isSelected) return 'selected';
		return 'idle';
	});
</script>

<div class="card-wrapper">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="card"
		class:idle={cardState === 'idle'}
		class:matched={cardState === 'matched'}
		class:error={cardState === 'error'}
		class:selected={cardState === 'selected'}
		onclick={handleClick}
		role="button"
		tabindex="0"
	>
		{#if isShapeContent(card.content)}
			<!-- תצוגת צורה גיאומטרית -->
			<ShapeSvg shapeId={card.content.shapeId} color={card.content.color} />
		{:else}
			<!-- תצוגת אות -->
			{card.content}
		{/if}
	</div>
</div>

<style>
	@reference "tailwindcss";
	
	.card-wrapper {
		@apply w-full h-full p-[0.5vmin] flex items-center justify-center;
	}

	.card {
		@apply relative w-full h-full rounded-xl flex items-center justify-center;
		@apply text-[6vmin] font-bold transition-all duration-300 select-none;
	}

	/* מצב רגיל (idle) */
	.card.idle {
		@apply bg-white text-gray-800 border-2 border-blue-200 shadow-lg cursor-pointer;
	}
	.card.idle:hover {
		@apply scale-105;
	}

	/* מצב התאמה (matched) */
	.card.matched {
		@apply bg-green-100 text-green-600 border-2 border-green-400 opacity-50 scale-95 cursor-default;
	}

	/* מצב שגיאה (error) */
	.card.error {
		@apply bg-red-100 text-red-600 border-4 border-red-400 animate-pulse cursor-default;
	}

	/* מצב נבחר (selected) */
	.card.selected {
		@apply bg-blue-100 text-blue-700 border-4 border-blue-500 scale-110 shadow-xl z-10 cursor-default;
	}
</style>
