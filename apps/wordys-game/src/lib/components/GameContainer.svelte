<script lang="ts">
	import { goto } from '$app/navigation';

	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import CompletionScreen from './CompletionScreen.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Card } from '$lib/types';

	import { playSuccess, speak, playAudio } from '$lib/utils/sound';
	import { getCardImageUrl, getCardAudioUrl } from '$lib/services/assets';
	import VirtualKeyboard from './VirtualKeyboard.svelte';
	import { boosterService } from 'learn-booster-kit';
	import HintButton from './HintButton.svelte';

	let { cards, onExit } = $props<{ cards: Card[]; onExit?: () => void }>();

	let currentIndex = $state(0);
	let showFeedback = $state(false);
	let typedValue = $state('');
	let isGameOver = $state(false);

	// Hint State
	let isHintActive = $state(false);
	let hintCooldownRemaining = $state(0);
	let hintTimer: ReturnType<typeof setInterval> | null = null;

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
		isHintActive = false;
		hintCooldownRemaining = 0;
		if (hintTimer) clearInterval(hintTimer);
		initGame();
	}

	function handleVirtualKeyPress(char: string) {
		if (isHintActive) return; // Prevent typing while hint is active? Optional.
		typedValue += char;
	}

	function handleVirtualDelete() {
		if (isHintActive) return;
		typedValue = typedValue.slice(0, -1);
	}

	function handleHint() {
		if (isHintActive || hintCooldownRemaining > 0 || !currentWord) return;

		// 1. Activate Hint
		isHintActive = true;

		// 2. Play Sound
		const audioUrl = getCardAudioUrl(currentWord.id);
		if (audioUrl) {
			playAudio(audioUrl);
		} else {
			speak(currentWord.word);
		}

		// 3. Set timer to hide hint
		setTimeout(() => {
			isHintActive = false;
			startHintCooldown();
		}, settings.hintDuration);
	}

	function startHintCooldown() {
		if (settings.hintCooldown <= 0) return;

		hintCooldownRemaining = settings.hintCooldown;

		if (hintTimer) clearInterval(hintTimer);

		hintTimer = setInterval(() => {
			hintCooldownRemaining -= 1;
			if (hintCooldownRemaining <= 0) {
				hintCooldownRemaining = 0;
				if (hintTimer) clearInterval(hintTimer);
			}
		}, 1000);
	}

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (hintTimer) clearInterval(hintTimer);
		};
	});

	// Derived state for current word
	let currentWord = $derived(playQueue[currentIndex]);

	async function handleSuccess() {
		showFeedback = true;
		playSuccess();

		// 1. Wait for sound (approx 1s)
		await new Promise((r) => setTimeout(r, 1000));

		// 2. Speak word (or play recording)
		if (currentWord) {
			const audioUrl = getCardAudioUrl(currentWord.id);
			if (audioUrl) {
				await playAudio(audioUrl);
			} else {
				await speak(currentWord.word);
			}
		}

		// 3. Speak feedback
		await speak('כל הכבוד!');

		// 4. Wait before next word (1s)
		await new Promise((r) => setTimeout(r, 1000));

		showFeedback = false;
		showFeedback = false;
		typedValue = ''; // Reset typed value on success
		isHintActive = false; // Reset hint just in case

		nextWord();
	}

	function handleReward() {
		// Manual trigger from CompletionScreen
		if (settings.boosterEnabled) {
			boosterService.triggerReward();
		}

		nextWord();
	}

	async function nextWord() {
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
				// End of Queue
				if (settings.boosterEnabled && settings.autoBoosterLoop) {
					// Loop Mode: Trigger reward then restart immediately
					await boosterService.triggerReward();
					restartGame();
				} else {
					// Standard Mode: Show Completion Screen
					isGameOver = true;
				}
			}
		}
	}

	let containerWidth = $state(0);
	let containerHeight = $state(0);

	// Calculate Aspect Ratio: Width / Height
	// Threshold: 0.85 (Triggers horizontal layout as soon as height is roughly equal to width + header space)
	let aspectRatio = $derived(containerHeight > 0 ? containerWidth / containerHeight : 0);
	let isLandscape = $derived(aspectRatio > 1.3);
</script>

<div
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
	class="h-screen w-full bg-linear-to-b from-orange-100 to-yellow-50 flex flex-col items-center relative overflow-hidden font-sans"
>
	{#if isGameOver}
		<CompletionScreen
			onReplay={restartGame}
			onExit={() => {
				if (onExit) onExit();
			}}
			onReward={() => handleReward()}
			rewardEnabled={settings.boosterEnabled}
		/>
	{:else}
		<!-- Game Content Wrapper (Padded) -->
		<!-- שינוי ב-Flexbox:
             min-h-0: קריטי כדי לאפשר התכווצות כשיש תוכן גולש
             justify-center: מרכוז אנכי
        -->
		<div
			id="gameContent"
			class="flex-1 w-full flex flex-col items-center justify-center
			p-2 md:p-4 relative min-h-0"
		>
			{#if currentWord}
				<div
					class="
					{/* הקונטיינר הראשי של האלמנטים */ ''}
					w-full max-w-[95vw] lg:max-w-[90vw] flex flex-col items-center
					gap-4 transition-all duration-300 h-full
                    {isLandscape ? 'flex-row gap-8 px-4' : ''}"
				>
					<!-- Image Section -->
					<!-- לוגיקת גודל תמונה:
                         במצב עמודה (Portrait):
                           flex-1: תופס את כל הגובה הפנוי
                           min-h-0: מאפשר הקטנה אם צריך
                           w-full: רוחב מלא (עד המקסימום של הקונטיינר)
                         במצב שורה (Landscape):
                           flex-1: תופס את שארית הרוחב שנותרה מהם-Controls
                    -->
					<div
						id="imageSection"
						class="flex items-center justify-center transition-all duration-300 w-full
                        {isLandscape ? 'flex-1 h-full min-w-0' : 'flex-1 min-h-0'}"
					>
						<div
							class="
                                bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden
                                aspect-square
                                transition-all duration-300
                                {/* אילוץ גודל:
                                   h-auto / w-auto בשילוב עם max-h/max-w מבטיח שהתמונה לא תחרוג
                                   במצב שורה: max-h-full מבטיח שלא תחרוג מהגובה, w-auto שומר יחס
                                   במצב עמודה: h-full מבטיח שתימתח לגובה המקסימלי האפשרי
                                */ ''}
                                {isLandscape
								? 'max-h-full max-w-full w-auto h-auto object-contain'
								: 'max-h-full max-w-full h-auto w-auto object-contain'}
                            "
							style="max-height: 100%; max-width: 100%;"
						>
							<ImageDisplay src={getCardImageUrl(currentWord.id)} alt={currentWord.word} />
						</div>
					</div>

					<!-- Controls Section -->
					<!-- לוגיקת אזור שליטה:
                         במצב שורה (Landscape):
                           flex-[1.5]: מקבל עדיפות גודל (פי 1.5 מהתמונה אם צריך)
                           min-w-[40%]: מבטיח שלא יימעך מדי
                         במצב עמודה (Portrait):
                           flex-shrink-0: גודל טבעי לפי התוכן, לא מתכווץ
                    -->
					<div
						id="controlsSection"
						class="flex flex-col items-center gap-6 transition-all duration-300
                        {isLandscape
							? 'flex-[1.5] justify-center h-full min-w-[350px]'
							: 'shrink-0 w-full pb-2'}"
					>
						<WordDisplay
							word={currentWord.word}
							compact={isLandscape}
							forceShow={isHintActive}
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
							<div
								id="typingInputSection"
								class="w-full relative flex items-center justify-center gap-4"
							>
								<div class="grow">
									<TypingInput
										targetWord={currentWord.word}
										onSuccess={handleSuccess}
										bind:value={typedValue}
									/>
								</div>

								<!-- Hint Button Section (Only if mode is hidden AND hint is enabled) -->
								{#if settings.wordDisplayMode === 'hidden' && settings.hintEnabled}
									<div class="shrink-0">
										<HintButton
											onClick={handleHint}
											disabled={isHintActive || hintCooldownRemaining > 0}
											cooldownRemaining={hintCooldownRemaining}
											totalCooldown={settings.hintCooldown}
										/>
									</div>
								{/if}
							</div>
						{/key}
					</div>
				</div>
			{/if}
		</div>
		<!-- End of Game Content Wrapper -->
	{/if}

	<Feedback show={showFeedback} />

	{#if settings.virtualKeyboardMode !== 'none'}
		<div class="w-full mt-auto z-10 shrink-0">
			<VirtualKeyboard
				mode={settings.virtualKeyboardMode}
				targetWord={currentWord?.word}
				onKeyPress={handleVirtualKeyPress}
				onDelete={handleVirtualDelete}
			/>
		</div>
	{/if}
</div>
