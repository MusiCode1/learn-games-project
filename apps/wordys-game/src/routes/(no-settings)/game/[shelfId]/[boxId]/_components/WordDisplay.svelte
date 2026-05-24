<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import spaceKeyIcon from '$lib/assets/space-key.svg';

	interface Props {
		word: string;
		currentIndex?: number;
		compact?: boolean;
		forceShow?: boolean;
	}

	let { word, currentIndex = 0, compact = false, forceShow = false }: Props = $props();

	type CubeData = { char: string; globalIndex: number };

	// פיצול המילה לשורות: רווח מתלווה לסוף המילה הקודמת ושובר שורה אחריו.
	// כך "מודיעין עילית" -> [[מ,ו,ד,י,ע,י,ן,⎵], [ע,י,ל,י,ת]]
	let rows = $derived.by<CubeData[][]>(() => {
		const result: CubeData[][] = [];
		let current: CubeData[] = [];
		for (let i = 0; i < word.length; i++) {
			const c = word[i];
			current.push({ char: c, globalIndex: i });
			if (/\s/.test(c)) {
				result.push(current);
				current = [];
			}
		}
		if (current.length > 0) result.push(current);
		return result;
	});

	// כל השורות יקבלו רוחב קובייה אחיד, מבוסס על השורה הארוכה ביותר.
	let maxRowLen = $derived(Math.max(...rows.map((r) => r.length), 1));

	// תקרה לרוחב הקובייה (במסכים גדולים מאוד). compact מקטין אותה.
	let maxCubeWidth = $derived(compact ? '4.5rem' : '6.5rem');
</script>

<!--
	מנגנון מידות:
	1. כל קובייה רחבה (100% - gaps) / maxRowLen, עם תקרה של max-cube-w.
	2. aspect-ratio שומר על יחס קלף.
	3. font-size בתוך הקובייה משתמש ב-cqw (האות מתאימה את עצמה לרוחב הקובייה
	   באמצעות container-type: inline-size על הקובייה עצמה).
	4. שורות שונות מתיישרות במרכז -> מילה קצרה לא נמתחת לרוחב המילה הארוכה.

	מצבי תצוגה לאות:
	- isCompleted: אות שכבר הוקלדה נכון (globalIndex < currentIndex)
	- isCurrent: האות הנוכחית להקלדה
	- isFuture: אות עתידית
	- במצב beginnerMode: completed=ירוק, future=מטושטש; current עם הדגשה רגילה.
-->
<div
	id="wordDisplayContainer"
	class="flex flex-col items-center w-full p-2 md:p-4 transition-all duration-300"
	style="--max-len: {maxRowLen}; --max-cube-w: {maxCubeWidth};"
	dir="rtl"
>
	{#if settings.wordDisplayMode === 'word'}
		<!-- מצב מילה שלמה -->
		<div
			class="
				whole-word flex items-center justify-center
				px-8 py-4
				bg-yellow-200 border-4 border-amber-500 border-b-8
				rounded-2xl shadow-md
				font-bold text-slate-900 select-none
				transition-all duration-200
				hover:-translate-y-1 hover:shadow-xl hover:border-amber-600
			"
			style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
		>
			{word}
		</div>
	{:else}
		{#each rows as row, rowIdx (rowIdx)}
			<div class="word-row">
				{#each row as item (item.globalIndex)}
					{@const isCompleted = item.globalIndex < currentIndex}
					{@const isCurrent = item.globalIndex === currentIndex}
					{@const isFuture = item.globalIndex > currentIndex}
					{@const shouldHighlight =
						settings.highlightCurrentChar &&
						isCurrent &&
						(settings.wordDisplayMode !== 'hidden' || forceShow)}
					{@const shouldShowChar =
						settings.wordDisplayMode !== 'hidden' || forceShow || isCompleted}
					<div
						class="
							cube
							flex items-center justify-center
							rounded-xl md:rounded-2xl
							border-4 border-b-8
							shadow-md
							font-bold text-slate-900 select-none
							transition-all duration-200
							hover:-translate-y-1 hover:shadow-xl hover:border-amber-600
							{settings.beginnerMode && isCompleted
							? 'bg-green-300 border-green-500 border-b-green-600'
							: shouldHighlight
								? 'bg-yellow-200 border-amber-600 ring-4 ring-amber-400 ring-opacity-50 scale-110 shadow-2xl animate-pulse-fast z-10'
								: 'bg-yellow-200 border-amber-500'}
							{settings.beginnerMode && isFuture ? 'opacity-25 blur-[2px]' : ''}
						"
						style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
					>
						{#if shouldShowChar}
							{#if /\s/.test(item.char)}
								<img
									src={spaceKeyIcon}
									alt="Space Key"
									class="w-full h-full object-contain p-2 opacity-80"
								/>
							{:else}
								{item.char}
							{/if}
						{:else}
							&nbsp;
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	/* רוחב כל שורה תופס את הרוחב הזמין; הקוביות מתמרכזות בה. */
	.word-row {
		--gap: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--gap);
		width: 100%;
	}

	@media (min-width: 768px) {
		.word-row {
			--gap: 0.75rem;
		}
	}

	.word-row + .word-row {
		margin-top: var(--gap);
	}

	/*
		רוחב קובייה = (100% מינוס סך הרווחים) חלקי מספר הקוביות בשורה הארוכה,
		עם תקרה של --max-cube-w. flex: 0 0 auto כדי שהדפדפן לא ימתח/יכווץ.
	*/
	.cube {
		flex: 0 0 auto;
		width: min(
			calc((100% - (var(--max-len) - 1) * var(--gap)) / var(--max-len)),
			var(--max-cube-w)
		);
		aspect-ratio: 5 / 7;
		container-type: inline-size;
		/* גודל גופן גדל ויורד עם רוחב הקובייה */
		font-size: clamp(1.25rem, 55cqw, 4.5rem);
	}

	.whole-word {
		font-size: clamp(2rem, 10vw, 6rem);
	}

	@keyframes pulse-fast {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
		}
		50% {
			box-shadow: 0 0 0 10px rgba(251, 191, 36, 0);
		}
	}
	.animate-pulse-fast {
		animation: pulse-fast 1.5s infinite;
	}
</style>
