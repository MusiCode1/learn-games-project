<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';
	import spaceKeyIcon from '$lib/assets/space-key.svg';

	interface Props {
		word: string;
		currentIndex?: number;
	}

	let { word, currentIndex = 0 }: Props = $props();

	let isLongWord = $derived(word.length > 5);

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

<div class="flex flex-wrap justify-center gap-x-6 gap-y-6 md:gap-8 p-2 md:p-6" dir="rtl">
	{#each segments as segment}
		<!-- Wrap words in a non-breaking flex container, allow spaces to flow -->
		<div class="flex {segment.isSpace ? 'contents' : 'flex-nowrap gap-3'}">
			{#each segment.text.split('') as char, i}
				{@const globalIndex = segment.startIndex + i}
				<div
					class="
                flex items-center justify-center
                {settings.highlightCurrentChar && globalIndex === currentIndex
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
					class:w-16={isLongWord}
					class:h-24={isLongWord}
					class:text-4xl={isLongWord}
					class:md:w-24={isLongWord}
					class:md:h-32={isLongWord}
					class:md:text-7xl={isLongWord}
					class:w-24={!isLongWord}
					class:h-32={!isLongWord}
					class:text-6xl={!isLongWord}
					class:md:w-32={!isLongWord}
					class:md:h-44={!isLongWord}
					class:md:text-8xl={!isLongWord}
					style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;"
				>
					{#if settings.showWord || globalIndex < currentIndex}
						{#if char === ' '}
							<!-- SVG Space Key Icon -->
							<div class="flex items-center justify-center opacity-80 scale-125 w-full h-full">
								<img src={spaceKeyIcon} alt="Space Key" class="w-full h-full object-contain p-3" />
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
</div>

<style>
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
