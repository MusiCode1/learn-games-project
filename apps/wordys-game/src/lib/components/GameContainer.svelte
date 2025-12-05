<script lang="ts">
	import { goto } from '$app/navigation';

	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import AdminGate from './AdminGate.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Card } from '$lib/types';

	import { playSuccess, speak } from '$lib/utils/sound';

	let { cards, onExit } = $props<{ cards: Card[]; onExit?: () => void }>();

	let currentIndex = $state(0);
	let showFeedback = $state(false);
	let typedValue = $state('');

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
			// Unlimited: Initial queue acts as a buffer, but nextWord will refill/randomize
			// Actually, for unlimited, let's just use the 'cards' array directly and pick random index
			// But to keep 'currentIndex' logic similar, let's just generate a long random queue or just
			// treat currentIndex as "cards completed" count and currentWord is derived differently.
			// Simpler: Just generate a shuffled queue of, say, 10 items, and when reaching end, generate more?
			// "Unlimited" -> Just pick random each time.
			currentIndex = 0;
			// For unlimited, we still need a "current card".
			// Let's set initial one.
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

	// Derived state for current word
	let currentWord = $derived(playQueue[currentIndex]);

	// ... (rest same)

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
				if (onExit) onExit();
			}
		}
	}
</script>

<div
	class="h-screen w-full bg-linear-to-b from-orange-100 to-yellow-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden"
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
		<div
			class="w-full max-w-6xl flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-12 landscape:px-8"
		>
			<!-- Image Section -->
			<div class="w-full max-w-md landscape:w-1/2 landscape:max-w-lg flex justify-center">
				<ImageDisplay src={currentWord.imageUrl} alt={currentWord.word} />
			</div>

			<!-- Controls Section -->
			<div class="w-full landscape:w-1/2 flex flex-col items-center gap-6 landscape:gap-8">
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

	<Feedback show={showFeedback} />
</div>
