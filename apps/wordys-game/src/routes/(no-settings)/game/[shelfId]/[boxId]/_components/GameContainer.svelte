<script lang="ts">
	import { goto } from '$app/navigation';

	import ImageDisplay from './ImageDisplay.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import TypingInput from './TypingInput.svelte';
	import Feedback from './Feedback.svelte';
	import CompletionScreen from './CompletionScreen.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Card } from '$lib/types';

	import { playSuccess, playError, speak, speakLetter, playAudio } from '$lib/utils/sound';
	import { getCardImage, getCardAudioUrl } from '$lib/services/assets';
	import VirtualKeyboard from './VirtualKeyboard.svelte';
	import { boosterService, ProgressWidget } from 'learn-booster-kit';
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
		if (isHintActive) return;

		// מצב מתחילים: חסימת אות שגויה
		if (settings.beginnerMode) {
			const nextExpected = currentWord?.word[typedValue.length];
			if (char !== nextExpected) {
				playError();
				if (settings.speakLetters) setTimeout(() => speakLetter(char), 500);
				return;
			}
		}

		// הקראת אות — אחרי צליל ההצלחה (שמגיע מ-TypingInput)
		if (settings.speakLetters) {
			setTimeout(() => speakLetter(char), 500);
		}

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

	function playCardAudio(): Promise<void> {
		const audioUrl = getCardAudioUrl(currentWord.id);
		if (audioUrl) {
			return playAudio(audioUrl);
		} else {
			return speak(currentWord.word);
		}
	}

	async function handleSuccess() {
		showFeedback = true;
		playSuccess();

		// 1. Wait for sound (approx 1s)
		await new Promise((r) => setTimeout(r, 1000));

		// 2. Speak word (or play recording)
		if (currentWord) {
			await playCardAudio();
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

	// מסך צר (טלפון): ProgressWidget עובר לראש העמוד במצב horizontal
	// כדי לא לגזור עוד רוחב מאזור המשחק. סף 500px מתאים לכל הטלפונים.
	let isNarrow = $derived(containerWidth > 0 && containerWidth < 500);

	// Progress Widget Logic
	let batchSize = $derived(playQueue.length);

	/* Math.min(
		settings.wordsPerBooster,
		playQueue.length -
			Math.floor(currentIndex / settings.wordsPerBooster) * settings.wordsPerBooster
	); */

	let progressInBatch = $derived(currentIndex % playQueue.length);
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
		<!-- Progress Widget — במצב narrow (טלפון) עובר לראש העמוד, אופקי.
		     זה חוסך רוחב יקר באזור המשחק. pt-16 דוחף את ה-widget מתחת
		     לכפתורי ⚙️ ו-X (שב-no-settings layout ב-top-4 left-4/right-4
		     ומסתיימים בערך ב-y=64). -->
		{#if settings.boosterEnabled && isNarrow}
			<div class="w-full shrink-0 flex items-center justify-center pt-16 pb-2 px-2 z-20">
				<ProgressWidget
					value={progressInBatch}
					max={batchSize}
					orientation="horizontal"
					label="עד המחזק"
				/>
			</div>
		{/if}

		<!-- Game Content Wrapper (Padded) -->
		<!-- שינוי ב-Flexbox:
             min-h-0: קריטי כדי לאפשר התכווצות כשיש תוכן גולש
             justify-center: מרכוז אנכי
        -->
		<div
			id="gameContent"
			class="flex-1 w-full flex flex-row items-center justify-center
			relative min-h-0 overflow-hidden"
		>
			<!-- Progress Widget בצד (אנכי) — רק כשלא narrow -->
			{#if settings.boosterEnabled && !isNarrow}
				<div class="shrink-0 flex items-center justify-center h-full mr-4 pl-2 md:pl-4 z-20">
					<ProgressWidget
						value={progressInBatch}
						max={batchSize}
						orientation="vertical"
						label="עד המחזק"
					/>
				</div>
			{/if}

			{#if currentWord}
				<div
					class="
					{/* הקונטיינר הראשי של האלמנטים */ ''}
					flex-1 w-full flex flex-col items-center
					gap-4 transition-all duration-300 h-full
                    justify-center
                    {isLandscape ? 'flex-row gap-8 p-4' : 'p-2'}"
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
					<!-- אזור התמונה: ה-section עצמו הוא container-type: size, והכרטיס בפנים
					     מחושב כריבוע הגדול ביותר שנכנס בו (min בין הרוחב לגובה).
					     זה מבטל את הצורך ב-aspect-square + max-h/max-w + h-auto/w-auto. -->
					<div
						id="imageSection"
						class="flex items-center justify-center transition-all duration-300 w-full
                        {isLandscape ? 'flex-1 h-full min-w-0' : 'flex-1 min-h-0'}"
					>
						<div
							class="
                                image-card-frame
                                bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden
                                transition-all duration-300
                            "
						>
							<ImageDisplay
								src={getCardImage(currentWord)}
								alt={currentWord.word}
								onclick={playCardAudio}
							/>
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
						<!-- ה-section של הקוביות:
						     ב-landscape (controls עם h-full ומקום פנוי): container-type: size + flex-1,
						     כך שהקוביות ימלאו את הגובה הזמין.
						     ב-portrait (controls הוא shrink-0): רק wrapper פשוט — הקוביות נשלטות
						     ע"י max(40svh, 100cqb) שייפול ל-svh כשאין container.  -->
						<div class="word-display-section {isLandscape ? 'is-landscape' : ''}">
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
						</div>

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

<style>
	/* כרטיס תמונה: ה-section הוא size container, והכרטיס בפנים הוא הריבוע
	   הגדול ביותר שנכנס גם ברוחב וגם בגובה. */
	#imageSection {
		container-type: size;
	}

	.image-card-frame {
		width: min(100cqi, 100cqb);
		height: min(100cqi, 100cqb);
	}

	/* Section של קוביות האותיות:
	   - תמיד: wrapper שמרכז את התוכן.
	   - ב-landscape בלבד: flex-1 + container-type: size, כדי שהקוביות
	     ידעו את הגובה הזמין דרך 100cqb וימלאו את ה-section.
	   ב-portrait controlsSection הוא shrink-0 ולכן flex-1 כאן יקרוס ל-0.
	   במצב כזה הקוביות נשלטות ע"י svh, ולא ע"י ה-section. */
	.word-display-section {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.word-display-section.is-landscape {
		flex: 1 1 0;
		min-height: 0;
		container-type: size;
	}
</style>
