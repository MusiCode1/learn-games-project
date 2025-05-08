<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import { CONFIG } from '$lib/constants/config';
	import type { PracticeSettingsScreenProps, PracticeSettings } from '$lib/types';
	import { appState } from '$lib/state/appState'; // ייבוא הסטייט הגלובלי
	import { WordSetCalculator } from '$lib/utils/wordUtils'; // ייבוא מחשבון הסטים

	let { state: externalState, handlers }: PracticeSettingsScreenProps = $props();

	// מצב פנימי של הקומפוננטה, מאותחל מה-props
	const progress = externalState.user.progress; // שימוש במשתנה רגיל לקיצור הנתיב

	const internalState = $state({
		selectedWordsPerSet: progress.wordsPerSet,
		selectedSet: progress.currentSet,
		selectedRepetitions: progress.repetitionsPerSet,
		selectedHideAfterSeconds: progress.hideAfterSeconds,
		selectedLevel: progress.level
	});

	// חישוב totalSets כערך נגזר מהסטייט הגלובלי והבחירות המקומיות
	const calculatedTotalSets = $derived(
		WordSetCalculator.calculateTotalSets(
			appState.practice.wordsByLevel[internalState.selectedLevel] || [], // קריאה מהסטייט הגלובלי
			internalState.selectedWordsPerSet
		)
	);

	function handleStartPractice() {
		const currentSettings: PracticeSettings = {
			wordsPerSet: internalState.selectedWordsPerSet,
			currentSet: internalState.selectedSet,
			repetitionsPerSet: internalState.selectedRepetitions,
			hideAfterSeconds: internalState.selectedHideAfterSeconds,
			level: internalState.selectedLevel
		};
		handlers.onStartPractice(currentSettings);
	}

	const enabledLevels = [1, 2]; // This was hardcoded, using maxLevel prop now
</script>

<div class="flex flex-col items-center justify-center space-y-8 px-4 py-12">
	<h1 class="text-4xl font-bold">הגדרות תרגול</h1>

	<div class="flex flex-col items-center space-y-6">
		<!-- הוספת בחירת שלב -->
		<div class="space-y-2 text-center">
			<label for="level-select" class="block font-medium">שלב</label>
			<select
				id="level-select"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={internalState.selectedLevel}
			>
				{#each Array(CONFIG.app.maxLevel) as _, i}
					<option value={i + 1} disabled={!enabledLevels.includes(i + 1)}
						>שלב {i + 1} {!enabledLevels.includes(i + 1) ? '(לא זמין עדיין)' : ''}</option
					>
				{/each}
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label for="words-num" class="block font-medium">מספר מילים בכל סט</label>
			<select
				id="words-num"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={internalState.selectedWordsPerSet}
			>
				<option value={3}>3 מילים</option>
				<option value={5}>5 מילים</option>
				<option value={10}>10 מילים</option>
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label for="set-num" class="block font-medium">סט מספר</label>
			<select
				id="set-num"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={internalState.selectedSet}
			>
				{#each Array(calculatedTotalSets) as _, i}
					<option value={i + 1}>סט {i + 1}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label for="repetitions-num" class="block font-medium">מספר חזרות על כל סט</label>
			<select
				id="repetitions-num"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={internalState.selectedRepetitions}
			>
				<option value={1}>חזרה אחת</option>
				<option value={2}>2 חזרות</option>
				<option value={3}>3 חזרות</option>
				<option value={5}>5 חזרות</option>
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label class="block font-medium" for="hide-after-seconds">
				זמן הצגת המילה:
				<span>
					{#if internalState.selectedHideAfterSeconds === 0}
						ללא הגבלת זמן
					{:else}
						{internalState.selectedHideAfterSeconds} שניות
					{/if}
				</span>
			</label>
			<div class="flex items-center gap-2">
				<span class="text-sm">0</span>
				<input
					id="hide-after-seconds"
					type="range"
					min="0"
					max="10"
					step="1"
					class="accent-primary h-2 w-48 cursor-pointer appearance-none rounded-lg bg-gray-200"
					bind:value={internalState.selectedHideAfterSeconds}
				/>
				<span class="text-sm">10</span>
			</div>
			<div class="text-sm text-gray-500">
				{#if internalState.selectedHideAfterSeconds === 0}
					המילה תוצג ללא הגבלת זמן
				{:else}
					המילה תוסתר אחרי {internalState.selectedHideAfterSeconds} שניות
				{/if}
			</div>
		</div>
	</div>

	<div class="flex gap-4">
		<Button onclick={handlers.onBack} variant="secondary">חזרה</Button>
		<Button onclick={handleStartPractice}>התחל תרגול</Button>
	</div>
</div>
