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
		if (card.isError) return 'error';
		if (card.isSelected) return 'selected';
		return 'idle';
	});

	// שליפת ה-provider לקבלת הגדרות עיצוב
	const provider = $derived(contentRegistry.get(card.content.providerId));
	const cardStyles = $derived(provider.cardStyles);
</script>

<div class="card-wrapper">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="card {cardStyles?.className ?? ''}"
		class:idle={cardState === 'idle'}
		class:matched={cardState === 'matched'}
		class:hidden={cardState === 'hidden'}
		class:error={cardState === 'error'}
		class:selected={cardState === 'selected'}
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
</div>

<style type="text/postcss">
	@reference "tailwindcss";
	
	.card-wrapper {
		@apply w-full h-full p-[0.5vmin] flex items-center justify-center;
	}

	.card {
		@apply relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden;
		@apply text-[6vmin] font-bold transition-all duration-300 select-none;
		container-type: size;
	}

	/* פריסות מיוחדות */
	.card.layout-vertical {
		@apply flex-col gap-2;
	}

	.card.layout-horizontal {
		@apply flex-row gap-2;
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

	/* מצב מוסתר (hidden) */
	.card.hidden {
		@apply invisible opacity-0 pointer-events-none;
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
