<script lang="ts">
	import { goto } from '$app/navigation';
	import { WordSetCalculator, WordProgress } from '$lib/utils/wordUtils';
	import PracticeSettingsScreen from '$lib/components/screens/PracticeSettingsScreen.svelte';
	import { CONFIG } from '$lib/constants/config';
	import { words, getWordsByLevel } from '$lib/data/words';
	import type { PracticeSettings } from '$lib/types'; // ייבוא הטיפוס

	// טעינת הגדרות שמורות
	const savedProgress = WordProgress.load();

	// הגדרת ערכי ברירת מחדל
	const defaultWordsPerSet = CONFIG.app.defaultWordsPerSet;
	const defaultRepetitions = CONFIG.app.defaultRepetitions;
	const defaultHideSeconds = CONFIG.app.defaultHideSeconds;
	const defaultLevel = CONFIG.app.defaultLevel;

	// אתחול state ישירות עם ערכים שמורים או ברירת מחדל
	const state = $state({
		wordsPerSet: savedProgress?.wordsPerSet || defaultWordsPerSet,
		currentSet: savedProgress?.currentSet || 1,
		repetitionsPerSet: savedProgress?.repetitionsPerSet || defaultRepetitions,
		hideAfterSeconds: savedProgress?.hideAfterSeconds || defaultHideSeconds,
		level: savedProgress?.level || defaultLevel
	});

	// שימוש ב-$derived לחישוב totalSets
	const totalSets = $derived(
		WordSetCalculator.calculateTotalSets(getWordsByLevel(state.level), state.wordsPerSet)
	);

	function handleStartPractice(settings: PracticeSettings) {
		// שמירת ההגדרות
		WordProgress.save(
			settings.currentSet,
			settings.wordsPerSet,
			settings.repetitionsPerSet,
			settings.hideAfterSeconds,
			settings.level
		);

		const params = new URLSearchParams({
			wordsPerSet: settings.wordsPerSet.toString(),
			set: settings.currentSet.toString(),
			repetitions: settings.repetitionsPerSet.toString(),
			hideAfterSeconds: settings.hideAfterSeconds.toString(),
			level: settings.level.toString(),
			wordIndex: '1' // התחלה מהמילה הראשונה
		});
		goto(`/practice?${params.toString()}`);
	}

	import { defaultSession, defaultUIState } from '$lib/defaults';

	const componentState = $derived({
		user: {
			progress: {
				currentSet: state.currentSet,
				wordsPerSet: state.wordsPerSet,
				repetitionsPerSet: state.repetitionsPerSet,
				hideAfterSeconds: state.hideAfterSeconds,
				level: state.level,
				totalSets: totalSets // totalSets הוא כבר rune
			}
		},
		practice: {
			// Provide default/empty session and ui states as PracticeSettingsScreenProps expects them
			session: defaultSession,
			ui: defaultUIState
		}
	});

	const componentHandlers = {
		onStartPractice: handleStartPractice,
		onBack: () => goto('/'), // Example: navigate to home or previous relevant page
		onExit: () => goto('/') // Example: navigate to home
	};
</script>

<PracticeSettingsScreen state={componentState} handlers={componentHandlers} />
