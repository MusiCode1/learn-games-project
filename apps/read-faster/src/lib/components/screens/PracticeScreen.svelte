<script lang="ts">
	import WordCard from '$lib/components/ui/WordCard.svelte';
	import ImageCard from '$lib/components/ui/ImageCard.svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import Progress from '$lib/components/ui/Progress.svelte';
	import Container from '$lib/components/layout/Container.svelte';
	import type { Word } from '$lib/types';

	interface Props {
		word: Word;
		isFirst: boolean;
		isLast: boolean;
		currentWord: number;
		totalWords: number;
		currentSet: number;
		totalSets: number;
		currentRepetition: number;
		totalRepetitions: number;
		hideAfterSeconds: number;
		onNext: () => void;
		onPrev: () => void;
		onFinish: () => void;
		onExit: () => void;
		onImageCardClick: () => void;
		onWordCardClick: () => void;
		direction: 'next' | 'prev' | null;
		lastDirection: 'next' | 'prev';
		isImageVisible: boolean;
		isWordVisible: boolean;
	}

	let {
		word,
		isFirst,
		isLast,
		currentWord,
		totalWords,
		currentSet,
		totalSets,
		currentRepetition,
		totalRepetitions,
		hideAfterSeconds,
		onNext,
		onPrev,
		onFinish,
		onExit,
		onImageCardClick,
		onWordCardClick,
		direction,
		lastDirection,
		isImageVisible = $bindable(false),
		isWordVisible = $bindable(false)
	}: Props = $props();

	function handleNext() {
		if (isLast) {
			onFinish();
		} else {
			onNext();
		}
	}
</script>

<div class="flex items-center via-transparent">
	<Container>
		<div class="flex flex-col items-center gap-3">
			<button
				class="from-secondary to-accent hover:shadow-secondary/20 fixed top-4 right-4 rounded-lg bg-linear-to-r/oklch px-4 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
				onclick={onExit}
			>
				חזור למסך הבית
			</button>

			<div
				class="flex flex-row gap-6 transition-transform duration-300 ease-in-out"
				style="transform: {direction === 'next'
					? 'translateX(-100vw)'
					: direction === 'prev'
						? 'translateX(100vw)'
						: 'translateX(0)'}"
			>
				<WordCard
					word={word.text}
					{direction}
					{lastDirection}
					{hideAfterSeconds}
					isVisible={isWordVisible}
					onClick={onWordCardClick}
				/>

				<ImageCard
					image={word.image || ''}
					alt={word.text}
					{direction}
					{lastDirection}
					{isImageVisible}
					onClick={onImageCardClick}
				/>
			</div>

			<Navigation onNext={handleNext} {onPrev} isFirstWord={isFirst} isLastWord={isLast} />

			<Progress
				{currentWord}
				{totalWords}
				{currentSet}
				{totalSets}
				{currentRepetition}
				{totalRepetitions}
			/>
		</div>
	</Container>
</div>
