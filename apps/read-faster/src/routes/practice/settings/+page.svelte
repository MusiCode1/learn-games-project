<script lang="ts">
	import { goto } from '$app/navigation';
	import { WordSetCalculator, WordProgress } from '$lib/utils/wordUtils';
	import PracticeSettingsScreen from '$lib/components/screens/PracticeSettingsScreen.svelte';
	import { CONFIG } from '$lib/constants/config';
	import { words, getWordsByLevel } from '$lib/data/words';

	// טעינת הגדרות שמורות
	const savedProgress = WordProgress.load();

	// הגדרת ערכי ברירת מחדל
	const defaultWordsPerSet = CONFIG.app.defaultWordsPerSet;
	const defaultRepetitions = CONFIG.app.defaultRepetitions;
	const defaultHideSeconds = CONFIG.app.defaultHideSeconds;
	const defaultLevel = CONFIG.app.defaultLevel;

	// שימוש בהגדרות שמורות אם קיימות
	const wordsPerSet = savedProgress?.wordsPerSet || defaultWordsPerSet;
	const repetitionsPerSet = savedProgress?.repetitionsPerSet || defaultRepetitions;
	const hideAfterSeconds = savedProgress?.hideAfterSeconds || defaultHideSeconds;
	const level = savedProgress?.level || defaultLevel;
	const currentSet = savedProgress?.currentSet || 1;

	// סינון מילים לפי שלב
	const levelWords = getWordsByLevel(level);

	const state = $state({
		wordsPerSet,
		currentSet,
		repetitionsPerSet,
		hideAfterSeconds,
		level,
		totalSets: WordSetCalculator.calculateTotalSets(levelWords, wordsPerSet)
	});

	// עדכון מספר הסטים כאשר משתנה השלב או מספר המילים בסט
	$effect(() => {
		const levelWords = getWordsByLevel(state.level);
		state.totalSets = WordSetCalculator.calculateTotalSets(levelWords, state.wordsPerSet);
	});

	function handleStartPractice(
		newWordsPerSet: number,
		newSet: number,
		newRepetitions: number,
		newHideAfterSeconds: number,
		newLevel: number
	) {
		// שמירת ההגדרות
		WordProgress.save(newSet, newWordsPerSet, newRepetitions, newHideAfterSeconds, newLevel);

		const params = new URLSearchParams({
			wordsPerSet: newWordsPerSet.toString(),
			set: newSet.toString(),
			repetitions: newRepetitions.toString(),
			hideAfterSeconds: newHideAfterSeconds.toString(),
			level: newLevel.toString(),
			wordIndex: '1' // התחלה מהמילה הראשונה
		});
		goto(`/practice?${params.toString()}`);
	}
</script>

<PracticeSettingsScreen
	wordsPerSet={state.wordsPerSet}
	currentSet={state.currentSet}
	totalSets={state.totalSets}
	repetitionsPerSet={state.repetitionsPerSet}
	hideAfterSeconds={state.hideAfterSeconds}
	level={state.level}
	maxLevel={CONFIG.app.maxLevel}
	onStartPractice={handleStartPractice}
/>
