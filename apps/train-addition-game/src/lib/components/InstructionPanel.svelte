<!--
	פאנל הוראות - מציג את ההוראה הנוכחית עם מספר גדול
-->
<script lang="ts">
	import { gameState } from '$lib/stores/game-state.svelte';
	import { speakBuildA, speakAddB, speakChooseAnswer } from '$lib/utils/tts';

	// חישוב ההוראה לפי המצב
	const instruction = $derived.by(() => {
		switch (gameState.state) {
			case 'BUILD_A':
				return `שים ${gameState.round.a} קרונות`;
			case 'ADD_B':
				return `הוסף עוד ${gameState.round.b} קרונות`;
			case 'CHOOSE_ANSWER':
			case 'FEEDBACK_WRONG':
				return 'כמה קרונות יש עכשיו?';
			case 'FEEDBACK_CORRECT':
				return 'נכון! 🎉';
			case 'ASSIST_OVERLAY':
				return 'בוא נראה יחד...';
			default:
				return 'לחץ להתחלה';
		}
	});

	// המספר להצגה ליד ההוראה
	const targetNumber = $derived(
		gameState.state === 'BUILD_A'
			? gameState.round.a
			: gameState.state === 'ADD_B'
				? gameState.round.b
				: null
	);

	// צבע המספר לפי השלב
	const numberColor = $derived(
		gameState.state === 'BUILD_A'
			? 'bg-green-500 ring-green-300'
			: 'bg-blue-500 ring-blue-300'
	);

	// השמעה חוזרת של ההוראה
	function replay() {
		if (!gameState.settings.voiceEnabled) return;

		switch (gameState.state) {
			case 'BUILD_A':
				speakBuildA(gameState.round.a);
				break;
			case 'ADD_B':
				speakAddB(gameState.round.b);
				break;
			case 'CHOOSE_ANSWER':
				speakChooseAnswer();
				break;
		}
	}
</script>

<div class="flex flex-col items-center gap-4 rounded-xl bg-white/90 px-6 py-4 shadow-lg">
	<!-- הוראה עם מספר גדול -->
	<div class="flex items-center gap-4">
		<!-- מספר גדול -->
		{#if targetNumber !== null}
			<div class="flex h-20 w-20 items-center justify-center rounded-full {numberColor} text-5xl font-bold text-white shadow-xl ring-4 md:h-24 md:w-24 md:text-6xl">
				{targetNumber}
			</div>
		{/if}

		<!-- הוראה טקסטית -->
		<div class="flex flex-col items-start gap-1">
			<p class="text-2xl font-bold text-slate-800 md:text-3xl">{instruction}</p>

			<!-- כפתור השמעה -->
			{#if gameState.state === 'BUILD_A' || gameState.state === 'ADD_B' || gameState.state === 'CHOOSE_ANSWER'}
				<button
					onclick={replay}
					class="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
					aria-label="השמע שוב"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
						/>
					</svg>
					<span class="text-sm font-medium">השמע</span>
				</button>
			{/if}
		</div>
	</div>
</div>
