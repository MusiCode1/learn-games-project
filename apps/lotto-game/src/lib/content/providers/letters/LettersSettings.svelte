<script lang="ts">
	/**
	 * רכיב הגדרות לספק האותיות
	 */

	interface Props {
		selectedItems: string[];
		onUpdate: (items: string[]) => void;
		availableItems: string[];
	}

	let { selectedItems, onUpdate, availableItems }: Props = $props();

	function handleToggle(letter: string) {
		if (selectedItems.includes(letter)) {
			onUpdate(selectedItems.filter((l) => l !== letter));
		} else {
			onUpdate([...selectedItems, letter]);
		}
	}

	function handleSelectAll() {
		onUpdate([...availableItems]);
	}

	function handleDeselectAll() {
		onUpdate([]);
	}
</script>

<div class="letters-settings" dir="rtl">
	<div class="header">
		<h3 class="title">בחירת אותיות ({selectedItems.length})</h3>
		<div class="actions">
			<button onclick={handleSelectAll} class="action-btn select">בחר הכל</button>
			<span class="divider">|</span>
			<button onclick={handleDeselectAll} class="action-btn deselect">נקה הכל</button>
		</div>
	</div>

	<div class="letters-grid">
		{#each availableItems as letter}
			{@const isSelected = selectedItems.includes(letter)}
			<button
				onclick={() => handleToggle(letter)}
				class="letter-btn"
				class:selected={isSelected}
			>
				{letter}
			</button>
		{/each}
	</div>
</div>

<style>
	@reference "tailwindcss";

	.letters-settings {
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

	.letters-grid {
		/* Layout */
		@apply grid grid-cols-6 sm:grid-cols-8;

		/* Spacing */
		@apply gap-2;
	}

	.letter-btn {
		/* Layout */
		@apply flex items-center justify-center;
		@apply aspect-square;

		/* Visual */
		@apply rounded-lg;
		@apply font-bold text-lg;
		@apply bg-slate-100 text-slate-400;
		@apply border-0;

		/* Interactive */
		@apply transition-all cursor-pointer;
	}

	.letter-btn:hover:not(.selected) {
		/* Visual */
		@apply bg-slate-200;
	}

	.letter-btn.selected {
		/* Visual */
		@apply bg-indigo-600 text-white;
		@apply shadow-md;

		/* Interactive */
		@apply scale-105;
	}
</style>
