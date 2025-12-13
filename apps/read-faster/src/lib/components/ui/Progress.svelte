<script lang="ts">
	interface Props {
		currentWord: number;
		totalWords: number;
		currentSet: number;
		totalSets: number;
		currentRepetition: number;
		totalRepetitions: number;
	}

	let {
		currentWord,
		totalWords,
		currentSet,
		totalSets,
		currentRepetition,
		totalRepetitions
	}: Props = $props();

	const totalAllWords = $derived.by(() => totalWords * totalRepetitions);
	const currentTotalWord = $derived.by(() => (currentRepetition - 1) * totalWords + currentWord);
	const progress = $derived.by(() => (currentTotalWord / totalAllWords) * 100);
</script>

<div
	class="bg-surface text-text-secondary mx-auto my-4 flex max-w-xl flex-col
	items-center gap-2 rounded-2xl p-4 shadow-sm"
>
	<div class="flex gap-2">
		מילה
		<span class="num text-primary font-bold">{currentTotalWord}</span>
		מתוך
		<span class="num text-primary font-bold">{totalAllWords}</span>
	</div>

	<progress
		class="
		h-5 w-full
  		appearance-none overflow-hidden
		rounded-full border-2 bg-clip-content"
		value={progress}
		max="100"
	></progress>

	<style>
		progress::-webkit-progress-value {
			transition: all 0.5s;
			background: linear-gradient(to right, oklch(0.55 0.18 250), oklch(0.75 0.12 190));
		}
		progress,
		progress::-webkit-progress-bar {
			background-color: oklch(0.98 0 0);
		}

		progress::-moz-progress-bar {
			transition: all 0.5s;
			background: linear-gradient(to right, oklch(0.55 0.18 250), oklch(0.75 0.12 190));
		}
	</style>
</div>
