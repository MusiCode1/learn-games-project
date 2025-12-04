<script lang="ts">
	import { settings } from '$lib/stores/settings.svelte';

	interface Props {
		word: string;
		currentIndex?: number;
	}

	let { word, currentIndex = 0 }: Props = $props();
</script>

<div class="flex justify-center gap-2 md:gap-4 p-6" dir="rtl">
	{#each word.split('') as char, i}
		<div
			class="
            w-16 h-24 md:w-28 md:h-40
            flex items-center justify-center
            {settings.highlightCurrentChar && i === currentIndex
				? 'bg-yellow-200 border-amber-600 ring-4 ring-amber-400 ring-opacity-50 scale-110 shadow-2xl animate-pulse-fast z-10'
				: 'bg-yellow-200 border-amber-500'}
            border-4 border-b-8
            rounded-2xl
            shadow-md
            text-6xl md:text-8xl font-bold text-slate-900
            select-none
            transition-all duration-200
            hover:-translate-y-1 hover:shadow-xl hover:border-amber-600
        "
			style="font-family: Arial, sans-serif;"
		>
			{#if settings.showWord || i < currentIndex}
				{char}
			{:else}
				&nbsp;
			{/if}
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
