<script lang="ts">
	/**
	 * רכיב הגדרות לספק הצורות
	 */
	import ShapeSvg from './ShapeSvg.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import type { ShapeDefinition } from './index';

	interface Props {
		selectedItems: string[];
		onUpdate: (items: string[]) => void;
		availableShapes: ShapeDefinition[];
		colorMode: 'uniform' | 'random';
		onColorModeUpdate: (mode: 'uniform' | 'random') => void;
	}

	let { selectedItems, onUpdate, availableShapes, colorMode, onColorModeUpdate }: Props = $props();

	function handleToggle(shapeId: string) {
		if (selectedItems.includes(shapeId)) {
			onUpdate(selectedItems.filter((s) => s !== shapeId));
		} else {
			onUpdate([...selectedItems, shapeId]);
		}
	}

	function handleSelectAll() {
		onUpdate(availableShapes.map((s) => s.id));
	}

	function handleDeselectAll() {
		onUpdate([]);
	}
</script>

<div class="shapes-settings" dir="rtl">
	<!-- מצב צבעים -->
	<div class="section">
		<h3 class="title">מצב צבעים</h3>
		<SegmentedControl
			options={[
				{ id: 'random', label: 'רנדומלי', icon: '🌈' },
				{ id: 'uniform', label: 'אחיד', icon: '🔵' }
			]}
			value={colorMode}
			onchange={(id) => onColorModeUpdate(id as 'uniform' | 'random')}
		/>
	</div>

	<!-- בחירת צורות -->
	<div class="section">
		<div class="header">
			<h3 class="title">בחירת צורות ({selectedItems.length})</h3>
			<div class="actions">
				<button onclick={handleSelectAll} class="action-btn select">בחר הכל</button>
				<span class="divider">|</span>
				<button onclick={handleDeselectAll} class="action-btn deselect">נקה הכל</button>
			</div>
		</div>

		<div class="shapes-grid">
			{#each availableShapes as shape}
				{@const isSelected = selectedItems.includes(shape.id)}
				<button onclick={() => handleToggle(shape.id)} class="shape-btn" class:selected={isSelected}>
					<div class="shape-icon">
						<ShapeSvg shapeId={shape.id} color={isSelected ? '#4F46E5' : '#9CA3AF'} />
					</div>
					<span class="shape-label" class:selected={isSelected}>{shape.name}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	@reference "tailwindcss";

	.shapes-settings {
		/* Layout */
		@apply w-full flex flex-col;

		/* Spacing */
		@apply gap-6;
	}

	.section {
		/* Layout */
		@apply w-full;
	}

	.title {
		/* Spacing */
		@apply m-0 mb-4;

		/* Visual */
		@apply font-bold text-slate-700;
	}

	.header {
		/* Layout */
		@apply flex justify-between items-center;

		/* Spacing */
		@apply mb-4;
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

	.shapes-grid {
		/* Layout */
		@apply grid grid-cols-5;

		/* Spacing */
		@apply gap-3;
	}

	.shape-btn {
		/* Layout */
		@apply flex flex-col items-center;

		/* Spacing */
		@apply gap-2 p-3;

		/* Visual */
		@apply rounded-xl;
		@apply bg-slate-100;
		@apply border-2 border-transparent;

		/* Interactive */
		@apply transition-all cursor-pointer;
	}

	.shape-btn:hover:not(.selected) {
		/* Visual */
		@apply bg-slate-200;
	}

	.shape-btn.selected {
		/* Visual */
		@apply bg-indigo-100 border-indigo-600;
		@apply shadow-md;

		/* Interactive */
		@apply scale-105;
	}

	.shape-icon {
		/* Layout */
		@apply w-12 h-12 flex items-center justify-center;
	}

	.shape-label {
		/* Visual */
		@apply text-xs font-medium text-slate-500;
	}

	.shape-label.selected {
		/* Visual */
		@apply text-indigo-700;
	}
</style>
