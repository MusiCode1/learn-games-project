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

	let isLongWord = $derived(word.length > 5);

	// $inspect(isLongWord, compact);

	// Group characters into segments (words and spaces) to control wrapping
	let segments = $derived.by(() => {
		const parts = word.match(/(\S+|\s)/g) || [];
		let acc = [];
		let currentIdx = 0;
		for (const part of parts) {
			acc.push({
				text: part,
				startIndex: currentIdx,
				isSpace: /^\s$/.test(part)
			});
			currentIdx += part.length;
		}
		return acc;
	});
</script>

<!-- Gap Logic: gap-2 (8px) on mobile to save space, gap-6 (24px) on desktop for breathing room -->
<!-- If Compact: force gap-2 always -->
<!-- הסבר CSS:
    flex-wrap: מאפשר שבירת שורות אם המילה ארוכה מדי
    justify-center: מרכוז האלמנטים
    p-2 / md:p-6: ריווח פנימי שגדל במסכים גדולים
-->
<div
	id="wordDisplayContainer"
	class="flex flex-wrap justify-center w-full p-2 md:p-6 transition-all duration-300 @container
	{compact ? 'gap-x-2 gap-y-2' : 'gap-x-2 gap-y-2 md:gap-x-6 md:gap-y-6'}"
	dir="rtl"
>
	{#if settings.wordDisplayMode === 'word'}
		<!-- Whole Word Mode (or Forced Show) -->
		<div
			class="
			flex items-center justify-center
			px-8 py-4
			bg-yellow-200 border-4 border-amber-500 border-b-8
			rounded-2xl shadow-md
			font-bold text-slate-900 select-none
			transition-all duration-200
			hover:-translate-y-1 hover:shadow-xl hover:border-amber-600
			{isLongWord || compact ? 'text-[clamp(1.5rem,12cqw,10rem)]' : 'text-[clamp(2rem,12cqw,12rem)]'}
			"
			style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
		>
			{word}
		</div>
	{:else}
		<!-- Letters / Hidden Mode -->
		{#each segments as segment}
			<!-- Wrap words in a non-breaking flex container, allow spaces to flow -->
			<div class="flex {segment.isSpace ? 'contents' : 'flex-nowrap gap-2 md:gap-4'}">
				{#each segment.text.split('') as char, i}
					{@const globalIndex = segment.startIndex + i}
					<div
						id="charDisplay"
						class="
					flex items-center justify-center
					{/* aspect-square/roughly portrait: אנו רוצים יחס של קלף (בערך 2:3 או 5:7) */ ''}
					aspect-[5/7]
					
					{/* Sizing Logic (Container Queries):
					   השתדרגנו ל-Container Queries (@container).
					   כעת הגודל נקבע לפי רוחב המיכל (cqw) ולא רוחב המסך (vw).
					   הסרנו את "תקרת הזכוכית" הנמוכה (80px), ועכשיו הכרטיס יכול לגדול עד 200px/150px
					   בהתאם למקום הפנוי, אך שומר על מינימום קריא (45px).
					*/ ''}
					{isLongWord || compact
							? 'w-[clamp(45px,11cqh,150px)] text-[clamp(1.5rem,12cqw,10rem)]'
							: 'w-[clamp(60px,15cqw,220px)] text-[clamp(2rem,12cqw,10rem)]'}
					
					{settings.highlightCurrentChar &&
						globalIndex === currentIndex &&
						(settings.wordDisplayMode !== 'hidden' || forceShow)
							? 'bg-yellow-200 border-amber-600 ring-4 ring-amber-400 ring-opacity-50 scale-110 shadow-2xl animate-pulse-fast z-10'
							: 'bg-yellow-200 border-amber-500'}
					border-4 border-b-8
					rounded-xl md:rounded-2xl
					shadow-md
					font-bold text-slate-900
					select-none
					transition-all duration-200
					hover:-translate-y-1 hover:shadow-xl hover:border-amber-600
				"
						style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
					>
						{#if settings.wordDisplayMode !== 'hidden' || forceShow || globalIndex < currentIndex}
							{#if char === ' '}
								<!-- SVG Space Key Icon -->
								<div class="flex items-center justify-center opacity-80 scale-125 w-full h-full">
									<img
										src={spaceKeyIcon}
										alt="Space Key"
										class="w-full h-full object-contain p-3"
									/>
								</div>
							{:else}
								{char}
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

<style type="text/postcss">
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
