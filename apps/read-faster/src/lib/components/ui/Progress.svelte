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
	class="mx-auto my-4 flex max-w-xl flex-col items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-8 text-[var(--color-text-secondary)] shadow-sm"
>
	<div class="flex gap-4">
		מילה <span class="font-bold text-[var(--color-primary)]">{currentTotalWord}</span> מתוך
		<span class="font-bold text-[var(--color-primary)]">{totalAllWords}</span>
	</div>

	<progress
		class="mt-4 h-4 w-full appearance-none overflow-hidden rounded-full
  		border-2 bg-clip-content"
		value={progress}
		max="100"
	></progress>

	<style>
		@layer utilities {
			progress {
				@apply appearance-none overflow-hidden rounded-full border-2 bg-clip-content;

				&::-webkit-progress-bar {
					background: var(--color-surface);
				}

				&::-webkit-progress-value,
				&::-moz-progress-bar,
				&[value] {
					background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
				}
			}
		}

		progress::-webkit-progress-bar {
			background: var(--color-surface);
		}

		progress,
		progress[value],
		progress[value]::-webkit-progress-value,
		progress[value]::-moz-progress-bar {
			transition: all 0.5s;
			background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
		}
	</style>
</div>
