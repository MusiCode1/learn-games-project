<script lang="ts">
	import type { Card as CardType } from '$lib/utils/gameLogic';
	import Card from '$lib/components/Card.svelte';

	interface Props {
		cards: CardType[];
		onCardClick: (id: number) => void;
		isLocked: boolean;
	}

	let { cards, onCardClick, isLocked }: Props = $props();

	// חישוב גודל הגריד המרובע
	const gridSize = $derived(Math.ceil(Math.sqrt(cards.length)));

	// יצירת מערך תאים עם פיזור סימטרי של הריקים
	const cells = $derived.by(() => {
		const totalCells = gridSize * gridSize;
		const emptyCount = totalCells - cards.length;

		if (emptyCount === 0) {
			// אין ריקים - פשוט מחזיר את הכרטיסים
			return cards.map((card) => ({ type: 'card' as const, card }));
		}

		// חישוב מיקומים ריקים סימטריים
		const emptyPositions = getSymmetricEmptyPositions(gridSize, emptyCount);

		// יצירת מערך התאים
		const result: ({ type: 'card'; card: CardType } | { type: 'empty' })[] = [];
		let cardIndex = 0;

		for (let i = 0; i < totalCells; i++) {
			if (emptyPositions.has(i)) {
				result.push({ type: 'empty' });
			} else {
				result.push({ type: 'card', card: cards[cardIndex++] });
			}
		}

		return result;
	});

	/**
	 * מחזיר סט של אינדקסים שיהיו ריקים, מפוזרים סימטרית מהפינות והקצוות
	 */
	function getSymmetricEmptyPositions(size: number, count: number): Set<number> {
		const positions = new Set<number>();
		if (count === 0) return positions;

		// סדר עדיפות סימטרי: פינות, אמצעי קצוות, פנימה...
		const priorities: number[] = [];

		// 1. ארבע פינות
		priorities.push(0); // שמאל עליון
		priorities.push(size - 1); // ימין עליון
		priorities.push(size * (size - 1)); // שמאל תחתון
		priorities.push(size * size - 1); // ימין תחתון

		// 2. אמצעי שורה ראשונה ואחרונה (אם גריד אי-זוגי)
		if (size % 2 === 1) {
			const mid = Math.floor(size / 2);
			priorities.push(mid); // אמצע שורה עליונה
			priorities.push(size * (size - 1) + mid); // אמצע שורה תחתונה
			priorities.push(mid * size); // אמצע עמודה שמאלית
			priorities.push(mid * size + size - 1); // אמצע עמודה ימנית
		}

		// 3. תאים נוספים בשורה ראשונה ואחרונה (סימטרי)
		for (let offset = 1; offset < Math.floor(size / 2); offset++) {
			priorities.push(offset); // שורה עליונה משמאל
			priorities.push(size - 1 - offset); // שורה עליונה מימין
			priorities.push(size * (size - 1) + offset); // שורה תחתונה משמאל
			priorities.push(size * size - 1 - offset); // שורה תחתונה מימין
		}

		// 4. תאים בעמודות קיצוניות (סימטרי)
		for (let row = 1; row < size - 1; row++) {
			priorities.push(row * size); // עמודה שמאלית
			priorities.push(row * size + size - 1); // עמודה ימנית
		}

		// בחירת הכמות הנדרשת מהמיקומים לפי סדר העדיפות
		for (let i = 0; i < priorities.length && positions.size < count; i++) {
			positions.add(priorities[i]);
		}

		return positions;
	}
</script>

<div class="board" style="--grid-size: {gridSize};">
	{#each cells as cell, i (i)}
		{#if cell.type === 'card'}
			<Card card={cell.card} onclick={onCardClick} disabled={isLocked} />
		{:else}
			<div class="empty-cell"></div>
		{/if}
	{/each}
</div>

<style>
	@reference "tailwindcss";

	.board {
		/* Layout - Container Query (CSS טהור) */
		/* הלוח תמיד מרובע - 95% מהממד הקטן יותר של הקונטיינר */
		width: 95cqmin;
		height: 95cqmin;

		/* גריד דינמי לפי מספר העמודות/שורות */
		display: grid;
		grid-template-columns: repeat(var(--grid-size), 1fr);
		grid-template-rows: repeat(var(--grid-size), 1fr);
		gap: 0.5cqmin;
		padding: 1cqmin;

		/* Visual */
		@apply bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl;
	}

	.empty-cell {
		/* תא ריק - שקוף, לא נראה */
	}
</style>
