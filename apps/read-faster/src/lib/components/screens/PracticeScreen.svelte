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

<div class="flex h-full items-center justify-center via-transparent">
	<Container>
		<div
			class="flex h-full flex-col items-center justify-center py-4
			md:gap-4"
		>
			<div
				class="flex flex-row gap-4 transition-transform duration-300 ease-in-out sm:gap-3 md:gap-8"
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
