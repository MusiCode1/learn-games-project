<script lang="ts">
	import WelcomeScreen from '$lib/components/screens/WelcomeScreen.svelte';
	import type { PracticeSettings, SessionState, UIState, WelcomeScreenProps } from '$lib/types';
	import { goto } from '$app/navigation'; // לייבוא עבור onExit לדוגמה

	// ערכי ברירת מחדל
	const defaultSettings: PracticeSettings = {
		currentSet: 1,
		wordsPerSet: 5,
		repetitionsPerSet: 3,
		hideAfterSeconds: 2,
		level: 1
	};

	const defaultSession: SessionState = {
		words: [],
		currentIndex: 0,
		wordsPerRepetition: 0,
		totalRepetitions: 0
	};

	const defaultUIState: UIState = {
		isWordVisible: false,
		isImageVisible: false,
		direction: null,
		lastDirection: 'next'
	};

	// הגדרת state ו-handlers
	const state: WelcomeScreenProps['state'] = {
		user: {
			progress: defaultSettings
		},
		practice: {
			session: defaultSession,
			ui: defaultUIState
		}
	};

	const handlers: WelcomeScreenProps['handlers'] = {
		onExit: () => {
			// לדוגמה, ניווט לדף הבית או פעולה אחרת
			console.log('Exiting welcome screen (from /welcome)...');
			// goto('/'); // אם רוצים לנווט
		}
		// אין handlers ספציפיים ל-WelcomeScreen מעבר ל-onExit
	};
</script>

<WelcomeScreen {state} {handlers} />
