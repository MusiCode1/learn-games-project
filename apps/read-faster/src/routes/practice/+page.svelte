<script lang="ts">
	import { goto } from '$app/navigation';
	import { WordSession, WordSetCalculator, WordProgress } from '$lib/utils/wordUtils';
	import { CONFIG } from '$lib/constants/config';
	import PracticeScreen from '$lib/components/screens/PracticeScreen.svelte';
	import { words } from '$lib/data/words';
	import { setupKeyboardShortcuts } from '$lib/core/keyboard';

	// פרמטרים מהניתוב
	const { data } = $props();
	const { set, wordsPerSet, repetitions } = data;
	const hideAfterSeconds = data.hideAfterSeconds ?? CONFIG.app.defaultHideSeconds;

	// יצירת סט המילים הנוכחי
	const currentSetWords = WordSetCalculator.getWordsForSet(words, set, wordsPerSet);

	// יצירת הסשן
	const sessionState = WordSession.create(currentSetWords, data.repetitions);

	// מצב גלוי/מוסתר של התמונה והמילה
	let isImageVisible = $state(false);
	let isWordVisible = $state(false);
	let hideWordTimeout: number;

	function startHideWordTimer() {
		// ניקוי טיימר קודם אם קיים
		if (hideWordTimeout) {
			clearTimeout(hideWordTimeout);
		}

		// הגדרת טיימר חדש אם hideAfterSeconds גדול מ-0
		if (hideAfterSeconds > 0) {
			hideWordTimeout = setTimeout(() => {
				isWordVisible = false;
			}, hideAfterSeconds * 1000);
		}
	}

	const session = $state({
		words: sessionState.words,
		currentIndex: sessionState.currentIndex,
		wordsPerRepetition: sessionState.wordsPerRepetition,
		totalRepetitions: sessionState.totalRepetitions
	});

	// חישוב מספר הסטים הכולל
	const totalSets = $derived.by(() =>
		WordSetCalculator.calculateTotalSets(words, data.wordsPerSet)
	);

	function handleNextWord() {
		const nextState = WordSession.next({
			words: session.words,
			currentIndex: session.currentIndex,
			wordsPerRepetition: session.wordsPerRepetition,
			totalRepetitions: session.totalRepetitions
		});
		session.currentIndex = nextState.currentIndex;
	}

	function handlePrevWord() {
		const prevState = WordSession.prev({
			words: session.words,
			currentIndex: session.currentIndex,
			wordsPerRepetition: session.wordsPerRepetition,
			totalRepetitions: session.totalRepetitions
		});
		session.currentIndex = prevState.currentIndex;
	}

	function handleFinishSet() {
		// שמירת התקדמות
		WordProgress.save(data.set, data.wordsPerSet, data.repetitions);

		// אם סיימנו את כל החזרות, עוברים לסט הבא
		if (WordSession.isComplete(session)) {
			if (data.set < totalSets) {
				goto(
					`/practice?set=${data.set + 1}&wordsPerSet=${data.wordsPerSet}&repetitions=${data.repetitions}&hideAfterSeconds=${hideAfterSeconds}`
				);
			} else {
				goto('/');
			}
		}
	}

	function handleFinishPractice() {
		goto('/');
	}

	// ניהול אנימציה
	let direction = $state<'next' | 'prev' | null>(null);
	let lastDirection = $state<'next' | 'prev'>('next');

	// חישוב ערכים נגזרים לתצוגה
	const currentWord = $derived.by(() => WordSession.getCurrentWord(session));
	const progress = $derived.by(() => WordSession.getProgress(session));
	const currentRepetition = $derived.by(() => WordSession.getCurrentRepetition(session));

	function delayedHandleNextWord(callback: () => void) {
		setTimeout(callback, CONFIG.app.transitionDuration);
	}

	async function handleNext() {
		if (!WordSession.isComplete(session)) {
			direction = 'next';
			lastDirection = 'next';
			delayedHandleNextWord(handleNextWord);
		}
	}

	async function handlePrev() {
		if (session.currentIndex > 0) {
			direction = 'prev';
			lastDirection = 'prev';
			delayedHandleNextWord(handlePrevWord);
		}
	}

// ניהול מקשי מקלדת
function handleImageCardClick() {
isImageVisible = true;
isWordVisible = true;
startHideWordTimer(); // הפעלת טיימר להסתרת המילה
}

function handleWordCardClick() {
if (!isWordVisible) {
isWordVisible = true;
startHideWordTimer(); // הפעלת טיימר להסתרת המילה
}
}

$effect(() => {
return setupKeyboardShortcuts({
onArrowLeft: handleNext,
onArrowRight: handlePrev,
onEscape: handleFinishPractice,
onSpace: handleImageCardClick
});
});

	// איפוס מצב התמונה והמילה בכל מעבר מילה
	$effect(() => {
		session.currentIndex; // track changes
		isImageVisible = false;
		isWordVisible = true; // המילה תמיד מוצגת במעבר
		startHideWordTimer(); // מפעיל טיימר להסתרת המילה
	});

	// ניקוי טיימר כשהקומפוננטה מתפרקת
	$effect(() => {
		return () => {
			if (hideWordTimeout) {
				clearTimeout(hideWordTimeout);
			}
		};
	});

	// איפוס כיוון האנימציה
	$effect(() => {
		if (direction) {
			const timer = setTimeout(() => {
				direction = null;
			}, CONFIG.app.transitionDuration);
			return () => clearTimeout(timer);
		}
	});
</script>

<PracticeScreen
	word={currentWord}
	isFirst={session.currentIndex === 0}
	isLast={WordSession.isComplete(session)}
	currentWord={progress.current}
	totalWords={progress.total}
	currentSet={data.set}
	{totalSets}
	{currentRepetition}
	totalRepetitions={session.totalRepetitions}
	{hideAfterSeconds}
	onNext={handleNext}
	onPrev={handlePrev}
	onFinish={handleFinishSet}
	onExit={handleFinishPractice}
onImageCardClick={handleImageCardClick}
onWordCardClick={handleWordCardClick}
	{direction}
	{lastDirection}
	{isImageVisible}
	{isWordVisible}
/>
