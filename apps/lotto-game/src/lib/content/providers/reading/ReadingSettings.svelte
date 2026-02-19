<script lang="ts">
	/**
	 * רכיב הגדרות לספק "ציור של קריאה"
	 * מאפשר בחירת אותיות ספציפיות למשחק
	 */
	import type { ReadingItem } from './index';

	interface Props {
		selectedItems: string[];
		onUpdate: (items: string[]) => void;
		availableItems: ReadingItem[];
	}

	let { selectedItems, onUpdate, availableItems }: Props = $props();

	function handleToggle(itemId: string) {
		if (selectedItems.includes(itemId)) {
			onUpdate(selectedItems.filter((id) => id !== itemId));
		} else {
			onUpdate([...selectedItems, itemId]);
		}
	}

	function handleSelectAll() {
		onUpdate(availableItems.map((item) => item.id));
	}

	function handleDeselectAll() {
		onUpdate([]);
	}
</script>

<div class="reading-settings" dir="rtl">
	<div class="header">
		<h3 class="title">בחירת אותיות ({selectedItems.length})</h3>
		<div class="actions">
			<button onclick={handleSelectAll} class="action-btn select">בחר הכל</button>
			<span class="divider">|</span>
			<button onclick={handleDeselectAll} class="action-btn deselect">נקה הכל</button>
		</div>
	</div>

	<div class="items-grid">
		{#each availableItems as item}
			{@const isSelected = selectedItems.includes(item.id)}
			<button onclick={() => handleToggle(item.id)} class="item-btn" class:selected={isSelected}>
				<span class="item-letter">{item.letter}</span>
				<img src={item.imagePath} alt={item.helper} class="item-image" />
				<span class="item-helper">{item.helper}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	@reference "tailwindcss";

	.reading-settings {
		/* Layout */
		@apply w-full;
	}

	.header {
		/* Layout */
		@apply flex justify-between items-center;

		/* Spacing */
		@apply mb-4;
	}

	.title {
		/* Visual */
		@apply font-bold text-slate-700;
		@apply m-0;
	}

	.actions {
		/* Layout */
		@apply flex items-center;

		/* Spacing */
		@apply gap-2;

		/* Visual */
		@apply text-sm;
	}

	.divider {
		/* Visual */
		@apply text-slate-300;
	}

	.action-btn {
		/* Spacing */
		@apply px-2 py-1;

		/* Visual */
		@apply rounded bg-transparent;
		@apply border-0 font-medium;

		/* Interactive */
		@apply cursor-pointer transition-all;
	}

	.action-btn.select {
		/* Visual */
		@apply text-indigo-600;
	}

	.action-btn.select:hover {
		/* Visual */
		@apply text-indigo-800 bg-indigo-50;
	}

	.action-btn.deselect {
		/* Visual */
		@apply text-slate-500;
	}

	.action-btn.deselect:hover {
		/* Visual */
		@apply text-slate-700 bg-slate-100;
	}

	.items-grid {
		/* Layout */
		@apply grid grid-cols-4;

		/* Spacing */
		@apply gap-3;
	}

	.item-btn {
		/* Layout */
		@apply flex flex-col items-center justify-center;

		/* Spacing */
		@apply p-2 gap-1;

		/* Visual */
		@apply rounded-xl;
		@apply bg-slate-100 text-slate-400;
		@apply border-0;

		/* Interactive */
		@apply transition-all cursor-pointer;
	}

	.item-btn:hover:not(.selected) {
		/* Visual */
		@apply bg-slate-200;
	}

	.item-btn.selected {
		/* Visual */
		@apply bg-indigo-600 text-white;
		@apply shadow-md;

		/* Interactive */
		@apply scale-105;
	}

	.item-letter {
		/* Visual */
		@apply font-bold text-xl;
	}

	.item-btn.selected .item-letter {
		/* Visual */
		@apply text-white;
	}

	.item-image {
		/* Layout */
		@apply w-10 h-10;

		/* Visual */
		@apply object-contain rounded;
	}

	.item-helper {
		/* Visual */
		@apply text-xs;
	}

	.item-btn.selected .item-helper {
		/* Visual */
		@apply text-indigo-100;
	}
</style>
