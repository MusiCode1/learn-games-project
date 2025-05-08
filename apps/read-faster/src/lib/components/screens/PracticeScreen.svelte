<script lang="ts">
	import WordCard from '$lib/components/ui/WordCard.svelte';
	import ImageCard from '$lib/components/ui/ImageCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Progress from '$lib/components/ui/Progress.svelte';
	import Container from '$lib/components/layout/Container.svelte';
	import type { PracticeScreenProps } from '$lib/types';
	import { WordSession, WordSetCalculator } from '$lib/utils/wordUtils'; // הוספת WordSetCalculator
	import { appState } from '$lib/state/appState'; // הוספת appState

	let { state, handlers }: PracticeScreenProps = $props();

	// נגזרות מהמצב
	const currentWordObject = $derived(
		state.practice.session.words[state.practice.session.currentIndex]
	);
	const isFirst = $derived(state.practice.session.currentIndex === 0);
	const isLast = $derived(
		state.practice.session.currentIndex === state.practice.session.words.length - 1
	);
	const displayCurrentWord = $derived(state.practice.session.currentIndex + 1); // This is the overall index
	const totalWordsInSession = $derived(state.practice.session.words.length); // This is the overall total words

	// Word index within the current repetition
	const currentWordInRepetition = $derived.by(() => {
		if (
			state.practice.session.wordsPerRepetition &&
			state.practice.session.wordsPerRepetition > 0
		) {
			return (state.practice.session.currentIndex % state.practice.session.wordsPerRepetition) + 1;
		}
		return state.practice.session.currentIndex + 1; // Fallback if wordsPerRepetition is not set
	});

	// חישוב totalSets כערך נגזר מהסטייט הגלובלי וההגדרות מה-props
	const calculatedTotalSets = $derived(
		WordSetCalculator.calculateTotalSets(
			appState.practice.wordsByLevel[state.user.progress.level] || [], // קריאה מהסטייט הגלובלי
			state.user.progress.wordsPerSet
		)
	);

	// currentRepetition מחושב כעת מנתוני הסשן
	const currentRepetition = $derived(
		state.practice.session && state.practice.session.words.length > 0
			? WordSession.getCurrentRepetition(state.practice.session)
			: 0
	);

	function handleNext() {
		if (isLast) {
			handlers.onFinish();
		} else {
			handlers.onNext();
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
					style="transform: {state.practice.ui.direction === 'next'
						? 'translateX(-100vw)'
						: state.practice.ui.direction === 'prev'
							? 'translateX(100vw)'
							: 'translateX(0)'}"
				>
					<Button
						variant="round"
						onclick={handlers.onPrev}
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
						{#if currentWordObject}
							<WordCard
								word={currentWordObject.text}
								direction={state.practice.ui.direction}
								lastDirection={state.practice.ui.lastDirection}
								hideAfterSeconds={state.user.progress.hideAfterSeconds}
								isVisible={state.practice.ui.isWordVisible}
								onClick={handlers.onWordCardClick}
							/>

							<ImageCard
								image={currentWordObject.image || ''}
								alt={currentWordObject.text}
								isImageVisible={state.practice.ui.isImageVisible}
								onClick={handlers.onImageCardClick}
							/>
						{/if}
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
				currentWord={currentWordInRepetition}
				totalWords={state.practice.session.wordsPerRepetition}
				currentSet={state.user.progress.currentSet}
				totalSets={calculatedTotalSets}
				{currentRepetition}
				totalRepetitions={state.practice.session.totalRepetitions}
			/>
		</div>
	</Container>
</div>
