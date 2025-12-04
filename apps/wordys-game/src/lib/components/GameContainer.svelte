<script lang="ts">
	import { words } from '$lib/data/words';
	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import SettingsModal from './SettingsModal.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	import { playSuccess, speak } from '$lib/utils/sound';

	let currentIndex = $state(0);
	let showFeedback = $state(false);
	let isSettingsOpen = $state(false);
	let typedValue = $state('');

	// Derived state for current word
	let currentWord = $derived(words[currentIndex]);

	$effect(() => {
		// Speak the word when it changes
		speak(currentWord.word);
	});

	async function handleSuccess() {
		showFeedback = true;
		playSuccess();

		// 1. Wait for sound (approx 1s)
		await new Promise((r) => setTimeout(r, 1000));

		// 2. Speak word
		await speak(currentWord.word);

		// 3. Speak feedback
		await speak('כל הכבוד!');

		// 4. Wait before next word (1s)
		await new Promise((r) => setTimeout(r, 1000));

		showFeedback = false;
		typedValue = ''; // Reset typed value on success
		nextWord();
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

<div
	class="h-screen w-full overflow-hidden bg-gradient-to-b from-orange-100 to-yellow-50 flex flex-col items-center justify-center p-4 font-sans relative"
>
	<!-- Settings Button -->
	<button
		class="absolute top-4 left-4 p-2 bg-white/50 hover:bg-white rounded-full shadow-sm transition-all text-slate-600 hover:text-slate-900"
		onclick={() => (isSettingsOpen = true)}
		aria-label="הגדרות"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-8 w-8"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
	</button>

	{#if currentWord}
		<div class="w-full max-w-4xl space-y-8">
			<!-- Header / Progress (Optional) -->
			<div class="text-center text-slate-400 text-sm">
				מילה {currentIndex + 1} מתוך {words.length}
			</div>

			<ImageDisplay src={currentWord.imageUrl} alt={currentWord.word} />

			<WordDisplay
				word={currentWord.word}
				currentIndex={// Calculate index of first mismatch or length if correct so far
				(() => {
					for (let i = 0; i < typedValue.length; i++) {
						if (typedValue[i] !== currentWord.word[i]) return i;
					}
					return typedValue.length;
				})()}
			/>

			<!-- Key prop forces re-render of input on word change to reset state -->
			{#key currentWord.id}
				<TypingInput
					targetWord={currentWord.word}
					onSuccess={handleSuccess}
					bind:value={typedValue}
				/>
			{/key}
		</div>
	{/if}

	<Feedback show={showFeedback} />
	<SettingsModal isOpen={isSettingsOpen} onClose={() => (isSettingsOpen = false)} />
</div>
