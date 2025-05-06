<script lang="ts">
	import { goto } from '$app/navigation';
	import { WordSession, WordSetCalculator, WordProgress } from '$lib/utils/wordUtils';
	import { CONFIG } from '$lib/constants/config';
	import PracticeScreen from '$lib/components/screens/PracticeScreen.svelte';
	import PracticeCompletionScreen from '$lib/components/screens/PracticeCompletionScreen.svelte';
	import { words, getWordsByLevel } from '$lib/data/words';
	import { setupKeyboardShortcuts } from '$lib/core/keyboard';
	import { fade } from '$lib/utils/transitions';
	import type { Word, WordSessionState } from '$lib/types';

	// פרמטרים מהניתוב
	const { data } = $props();
	const hideAfterSeconds = data.hideAfterSeconds ?? CONFIG.app.defaultHideSeconds;
	let { set, wordsPerSet, repetitions, wordIndex, level } = data;

	// סינון מילים לפי שלב
	const levelWords = $derived.by(() => getWordsByLevel(level));

	let currentSetWords: Word[] = [];
	let sessionState: WordSessionState;
	let session: WordSessionState = $state({
		words: [],
		currentIndex: 0,
		wordsPerRepetition: 0,
		totalRepetitions: 0
	});

	// חישוב מספר הסטים הכולל
	const totalSets = $derived.by(() =>
		WordSetCalculator.calculateTotalSets(levelWords, data.wordsPerSet)
	);

	// מצב השלמת הסט
	let isCompleted = $state(false);

	startSession();

	// מצב גלוי/מוסתר של התמונה והמילה
	let isImageVisible = $state(false);
	let isWordVisible = $state(false);
	let hideWordTimeout: number;

	function startSession() {
		// יצירת סט המילים הנוכחי - עם סינון לפי שלב
		currentSetWords = WordSetCalculator.getWordsForSet(levelWords, set, wordsPerSet);

		// יצירת הסשן עם אינדקס התחלתי מה-URL
		sessionState = WordSession.create(currentSetWords, repetitions, wordIndex);
		// חישוב מילים לסט
		isCompleted = false;

		session = {
			words: sessionState.words,
			currentIndex: sessionState.currentIndex,
			wordsPerRepetition: sessionState.wordsPerRepetition,
			totalRepetitions: sessionState.totalRepetitions
		};
	}

	function setupWordVisibility() {
		// איפוס מצב התמונה והמילה
		isImageVisible = false;
		isWordVisible = true;
		startHideWordTimer();
	}

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

	function handleNextWord() {
		const nextState = WordSession.next({
			words: session.words,
			currentIndex: session.currentIndex,
			wordsPerRepetition: session.wordsPerRepetition,
			totalRepetitions: session.totalRepetitions
		});
		session.currentIndex = nextState.currentIndex;

		setupWordVisibility();

		// עדכון ה-URL עם האינדקס החדש (המרה ל-1-based)
		const url = new URL(window.location.href);
		url.searchParams.set('wordIndex', (nextState.currentIndex + 1).toString());
		goto(url.toString());
	}

	function handlePrevWord() {
		const prevState = WordSession.prev({
			words: session.words,
			currentIndex: session.currentIndex,
			wordsPerRepetition: session.wordsPerRepetition,
			totalRepetitions: session.totalRepetitions
		});
		session.currentIndex = prevState.currentIndex;

		setupWordVisibility();

		// עדכון ה-URL עם האינדקס החדש (המרה ל-1-based)
		const url = new URL(window.location.href);
		url.searchParams.set('wordIndex', (prevState.currentIndex + 1).toString());
		goto(url.toString());
	}

	// הפעלת מצב נראות ראשוני
	$effect(() => {
		setupWordVisibility();
	});

	function handleFinishSet() {
		// שמירת התקדמות
		WordProgress.save(data.set, data.wordsPerSet, data.repetitions, hideAfterSeconds, level);

		// אם סיימנו את כל החזרות, מציגים את מסך הסיום
		if (WordSession.isComplete(session)) {
			isCompleted = true;
		}
	}

	function handleNextSet() {
		goto(
			`/practice?set=${data.set + 1}&wordsPerSet=${data.wordsPerSet}&repetitions=${data.repetitions}&hideAfterSeconds=${hideAfterSeconds}&wordIndex=1&level=${level}`
		);
		set++; // עדכון הסט לסט הבא
		startSession();
	}

	function handleRepeatSet() {
		goto(
			`/practice?set=${data.set}&wordsPerSet=${data.wordsPerSet}&repetitions=${data.repetitions}&hideAfterSeconds=${hideAfterSeconds}&wordIndex=1&level=${level}`
		);
		startSession();
	}

	function handleHome() {
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
		if (WordSession.isComplete(session)) {
			handleFinishSet();
		} else {
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
			onEscape: handleHome,
			onSpace: handleImageCardClick
		});
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

{#if isCompleted}
	<div in:fade={{ duration: 500 }}>
		<PracticeCompletionScreen
			totalWords={progress.total}
			repetitions={data.repetitions}
			currentSet={data.set}
			{totalSets}
			onNextSet={handleNextSet}
			onRepeatSet={handleRepeatSet}
			onHome={handleHome}
		/>
	</div>
{:else}
	<div in:fade={{ duration: 500 }}>
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
			onExit={handleHome}
			onImageCardClick={handleImageCardClick}
			onWordCardClick={handleWordCardClick}
			{direction}
			{lastDirection}
			{isImageVisible}
			{isWordVisible}
		/>
	</div>
{/if}
