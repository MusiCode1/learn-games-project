<script lang="ts">
	import { goto } from '$app/navigation';
	import { wordsStore } from '$lib/stores/words.svelte';
	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import AdminGate from './AdminGate.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	import { playSuccess, speak } from '$lib/utils/sound';

	let currentIndex = $state(0);
	let showFeedback = $state(false);
	let typedValue = $state('');

	// Derived state for current word
	let currentWord = $derived(wordsStore.words[currentIndex]);

	$effect(() => {
		// Speak the word when it changes
		if (currentWord) {
			speak(currentWord.word);
		}
	});

	async function handleSuccess() {
		showFeedback = true;
		playSuccess();

		// 1. Wait for sound (approx 1s)
		await new Promise((r) => setTimeout(r, 1000));

		// 2. Speak word
		if (currentWord) {
			await speak(currentWord.word);
		}

		// 3. Speak feedback
		await speak('כל הכבוד!');

		// 4. Wait before next word (1s)
		await new Promise((r) => setTimeout(r, 1000));

		showFeedback = false;
		typedValue = ''; // Reset typed value on success
		nextWord();
	}

	function nextWord() {
		if (currentIndex < wordsStore.words.length - 1) {
			currentIndex++;
		} else {
			// Game Over / Restart
			currentIndex = 0;
			// Maybe show a "Game Complete" screen here
		}
	}
</script>

<div
	class="h-screen w-full overflow-hidden bg-linear-to-b from-orange-100 to-yellow-50 flex flex-col items-center justify-center p-4 font-sans relative"
>
	<!-- Settings Button with Gate -->
	<div class="absolute top-4 left-4 z-20">
		<AdminGate onUnlock={() => goto('/admin/words')}>
			<button
				class="p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all text-slate-600 hover:text-slate-900"
				aria-label="הגדרות"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
					/>
					<circle cx="12" cy="12" r="3" />
				</svg>
			</button>
		</AdminGate>
	</div>

	{#if currentWord}
		<div class="w-full max-w-4xl space-y-8">
			<!-- Header / Progress (Optional) -->
			<div class="text-center text-slate-400 text-sm">
				מילה {currentIndex + 1} מתוך {wordsStore.words.length}
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
</div>
