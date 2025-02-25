<script lang="ts">
	import WordCard from '$lib/components/ui/WordCard.svelte';
	import ImageCard from '$lib/components/ui/ImageCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
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
			<div class="relative">
				<div
					class="flex w-full items-center justify-between gap-[8vw] px-4 transition-transform duration-300 ease-in-out md:gap-[2vw] md:px-8 lg:gap-[4vw]"
					style="transform: {direction === 'next'
						? 'translateX(-100vw)'
						: direction === 'prev'
							? 'translateX(100vw)'
							: 'translateX(0)'}"
				>
					<Button
						variant="round"
						onclick={onPrev}
						disabled={isFirst}
						ariaLabel="למילה הקודמת"
						class="h-[8vw] max-h-16 min-h-10 w-[8vw] max-w-16 min-w-10"
					>
						<svg class="h-[60%] w-[60%]" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M20 12a1 1 0 0 0-.29-.71l-6-6a1 1 0 0 0-1.42 1.42L16.59 11H4a1 1 0 0 0 0 2h12.59l-4.3 4.29a1 1 0 0 0 1.42 1.42l6-6A1 1 0 0 0 20 12z"
							/>
						</svg>
					</Button>

					<div class="flex flex-1 flex-col items-center justify-center gap-8 sm:gap-8 md:flex-row">
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
							{isImageVisible}
							onClick={onImageCardClick}
						/>
					</div>

					<Button
						variant="round"
						onclick={handleNext}
						ariaLabel="למילה הבאה"
						class="h-[8vw] max-h-16 min-h-10 w-[8vw] max-w-16 min-w-10"
					>
						<svg class="h-[60%] w-[60%]" viewBox="0 0 24 24" style="transform: scaleX(-1)">
							<path
								fill="currentColor"
								d="M20 12a1 1 0 0 0-.29-.71l-6-6a1 1 0 0 0-1.42 1.42L16.59 11H4a1 1 0 0 0 0 2h12.59l-4.3 4.29a1 1 0 0 0 1.42 1.42l6-6A1 1 0 0 0 20 12z"
							/>
						</svg>
					</Button>
				</div>
			</div>

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
