<script lang="ts">
	import { onMount } from 'svelte';
	import type { LetterCard as LetterCardType } from '$lib/utils/letters';
	import LetterCard from './LetterCard.svelte';
	import { gridDims, type GridSize } from '$lib/stores/settings.svelte';

	interface Props {
		board: LetterCardType[];
		shakingId: string | null;
		successId: string | null;
		disabled: boolean;
		gridSize: GridSize;
		onCardClick: (card: LetterCardType) => void;
	}

	let { board, shakingId, successId, disabled, gridSize, onCardClick }: Props = $props();

	const dims = $derived(gridDims(gridSize));

	// קונטיינר חיצוני (מקבל את הגודל הזמין מהמסך)
	let container = $state<HTMLDivElement>();
	let containerWidth = $state(0);
	let containerHeight = $state(0);

	// קבועי עיצוב — חייבים להיות זהים לערכים ב-CSS למטה
	const BORDER = 6; // border של הלוח
	const PADDING = 16; // padding פנימי ממוצע (clamp ב-CSS)
	const GAP = 12; // gap בין כרטיסים (clamp ב-CSS)

	/**
	 * חישוב גודל התא בפועל: מינימום בין הרוחב הזמין לעמודה לבין
	 * הגובה הזמין לשורה — כך הלוח אף פעם לא חורג מהמסך.
	 */
	const cellSize = $derived.by(() => {
		if (!containerWidth || !containerHeight) return 0;

		const innerW = containerWidth - 2 * BORDER - 2 * PADDING;
		const innerH = containerHeight - 2 * BORDER - 2 * PADDING;

		const cellW = (innerW - GAP * (dims.cols - 1)) / dims.cols;
		const cellH = (innerH - GAP * (dims.rows - 1)) / dims.rows;

		return Math.max(0, Math.floor(Math.min(cellW, cellH)));
	});

	const boardWidth = $derived(
		cellSize > 0 ? cellSize * dims.cols + GAP * (dims.cols - 1) + 2 * PADDING + 2 * BORDER : 0
	);
	const boardHeight = $derived(
		cellSize > 0 ? cellSize * dims.rows + GAP * (dims.rows - 1) + 2 * PADDING + 2 * BORDER : 0
	);

	onMount(() => {
		if (!container) return;
		const ro = new ResizeObserver((entries) => {
			for (const e of entries) {
				containerWidth = e.contentRect.width;
				containerHeight = e.contentRect.height;
			}
		});
		ro.observe(container);
		return () => ro.disconnect();
	});
</script>

<div class="board-wrapper" bind:this={container}>
	{#if cellSize > 0}
		<div
			class="board"
			style:width="{boardWidth}px"
			style:height="{boardHeight}px"
			style:grid-template-columns="repeat({dims.cols}, {cellSize}px)"
			style:grid-template-rows="repeat({dims.rows}, {cellSize}px)"
		>
			{#each board as card (card.id)}
				<LetterCard
					{card}
					isShaking={shakingId === card.id}
					isSuccess={successId === card.id}
					{disabled}
					onclick={onCardClick}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.board-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		min-width: 0;
	}

	.board {
		display: grid;
		gap: 12px;
		padding: 16px;
		border: 6px solid var(--color-frame, #ff6a3d);
		border-radius: 1.5rem;
		background: white;
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
		box-sizing: border-box;
	}
</style>
