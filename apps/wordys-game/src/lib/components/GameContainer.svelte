<script lang="ts">
	import { goto } from '$app/navigation';

	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import CompletionScreen from './CompletionScreen.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Card } from '$lib/types';

	import { playSuccess, speak } from '$lib/utils/sound';
	import VirtualKeyboard from './VirtualKeyboard.svelte';

	let { cards, onExit } = $props<{ cards: Card[]; onExit?: () => void }>();

	let currentIndex = $state(0);
	let showFeedback = $state(false);
	let typedValue = $state('');
	let isGameOver = $state(false);

	// Play Queue Logic
	let playQueue = $state<Card[]>([]);

	$effect(() => {
		// Initialize Queue when cards change or component mounts
		initGame();
	});

	function initGame() {
		if (!cards || cards.length === 0) return;

		const reps = settings.cardRepetitions;
		if (reps === 0) {
			// Unlimited: Initial queue acts as a buffer
			currentIndex = 0;
			playQueue = [cards[Math.floor(Math.random() * cards.length)]];
		} else {
			// Finite repetitions
			let queue: Card[] = [];
			for (let i = 0; i < reps; i++) {
				queue = [...queue, ...cards];
			}
			// Shuffle
			queue = queue.sort(() => Math.random() - 0.5);
			playQueue = queue;
			currentIndex = 0;
		}
	}

	function restartGame() {
		isGameOver = false;
		initGame();
	}

	function handleVirtualKeyPress(char: string) {
		typedValue += char;
	}

	function handleVirtualDelete() {
		typedValue = typedValue.slice(0, -1);
	}

	// Derived state for current word
	let currentWord = $derived(playQueue[currentIndex]);

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
		const reps = settings.cardRepetitions;

		if (reps === 0) {
			// Unlimited mode: Always add a new random card to the queue and advance
			const randomCard = cards[Math.floor(Math.random() * cards.length)];
			playQueue = [...playQueue, randomCard];
			currentIndex++;
		} else {
			// Finite mode
			if (currentIndex < playQueue.length - 1) {
				currentIndex++;
			} else {
				// Game Over
				isGameOver = true;
			}
		}
	}
</script>

<div
	class="h-screen w-full bg-linear-to-b from-orange-100 to-yellow-50 flex flex-col items-center relative overflow-hidden font-sans"
>
	{#if isGameOver}
		<CompletionScreen
			onReplay={restartGame}
			onExit={() => {
				if (onExit) onExit();
			}}
		/>
	{:else}
		<!-- Game Content Wrapper (Padded) -->
		<div class="flex-1 w-full flex flex-col items-center justify-center p-4 relative min-h-0">
			{#if currentWord}
				<div
					class="w-full max-w-[95vw] flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 landscape:px-4"
				>
					<!-- Image Section -->
					<div
						class="flex-shrink-1 landscape:w-auto max-h-[40vh] landscape:max-h-[80vh] flex justify-center"
					>
						<div
							class="w-full max-w-sm aspect-square bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden"
						>
							<ImageDisplay src={currentWord.imageUrl} alt={currentWord.word} />
						</div>
					</div>

					<!-- Controls Section -->
					<div class="flex-1 w-full flex flex-col items-center gap-6 landscape:gap-8 min-w-0">
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
				</div>
			{/if}
		</div>
		<!-- End of Game Content Wrapper -->
	{/if}

	<Feedback show={showFeedback} />

	{#if settings.virtualKeyboardMode !== 'none'}
		<div class="w-full mt-auto z-10">
			<VirtualKeyboard
				mode={settings.virtualKeyboardMode}
				targetWord={currentWord?.word}
				onKeyPress={handleVirtualKeyPress}
				onDelete={handleVirtualDelete}
			/>
		</div>
	{/if}
</div>
