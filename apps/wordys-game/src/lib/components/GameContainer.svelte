<script lang="ts">
	import { words } from '$lib/data/words';
	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';

	let currentIndex = $state(0);
	let showFeedback = $state(false);

	// Derived state for current word
	let currentWord = $derived(words[currentIndex]);

	function handleSuccess() {
		showFeedback = true;

		// Play success sound (placeholder)
		// const audio = new Audio('/sounds/success.mp3');
		// audio.play();

		setTimeout(() => {
			showFeedback = false;
			nextWord();
		}, 2000);
	}

	function nextWord() {
		if (currentIndex < words.length - 1) {
			currentIndex++;
		} else {
			// Game Over / Restart
			currentIndex = 0;
			// Maybe show a "Game Complete" screen here
		}
	}
</script>

<div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
	{#if currentWord}
		<div class="w-full max-w-4xl space-y-8">
			<!-- Header / Progress (Optional) -->
			<div class="text-center text-slate-400 text-sm">
				מילה {currentIndex + 1} מתוך {words.length}
			</div>

			<ImageDisplay src={currentWord.imageUrl} alt={currentWord.word} />

			<WordDisplay word={currentWord.word} />

			<!-- Key prop forces re-render of input on word change to reset state -->
			{#key currentWord.id}
				<TypingInput targetWord={currentWord.word} onSuccess={handleSuccess} />
			{/key}
		</div>
	{/if}

	<Feedback show={showFeedback} />
</div>
