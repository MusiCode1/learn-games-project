<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		wordsPerSet: number;
		currentSet: number;
		totalSets: number;
		repetitionsPerSet: number;
		hideAfterSeconds: number;
		onStartPractice: (
			wordsPerSet: number,
			set: number,
			repetitions: number,
			hideAfterSeconds: number
		) => void;
	}

	const {
		currentSet,
		hideAfterSeconds,
		onStartPractice,
		repetitionsPerSet,
		totalSets,
		wordsPerSet
	}: Props = $props();

	const state = $state({
		selectedWordsPerSet: wordsPerSet,
		selectedSet: currentSet,
		selectedRepetitions: repetitionsPerSet,
		hideAfterSeconds: hideAfterSeconds
	});

	function handleStartPractice() {
		onStartPractice(
			state.selectedWordsPerSet,
			state.selectedSet,
			state.selectedRepetitions,
			state.hideAfterSeconds
		);
	}

	function handleBack() {
		goto('/welcome');
	}
</script>

<div class="flex flex-col items-center justify-center space-y-8 px-4 py-12">
	<h1 class="text-4xl font-bold">הגדרות תרגול</h1>

	<div class="flex flex-col items-center space-y-6">
		<div class="space-y-2 text-center">
			<label for="words-num" class="block font-medium">מספר מילים בכל סט</label>
			<select
				id="words-num"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={state.selectedWordsPerSet}
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
				bind:value={state.selectedSet}
			>
				{#each Array(totalSets) as _, i}
					<option value={i + 1}>סט {i + 1}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label for="repetitions-num" class="block font-medium">מספר חזרות על כל סט</label>
			<select
				id="repetitions-num"
				class="w-32 rounded-lg border p-2 text-center"
				bind:value={state.selectedRepetitions}
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
					{#if state.hideAfterSeconds === 0}
						ללא הגבלת זמן
					{:else}
						{state.hideAfterSeconds} שניות
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
					bind:value={state.hideAfterSeconds}
				/>
				<span class="text-sm">10</span>
			</div>
			<div class="text-sm text-gray-500">
				{#if state.hideAfterSeconds === 0}
					המילה תוצג ללא הגבלת זמן
				{:else}
					המילה תוסתר אחרי {state.hideAfterSeconds} שניות
				{/if}
			</div>
		</div>
	</div>

	<div class="flex gap-4">
		<Button onclick={handleBack} variant="secondary">חזרה</Button>
		<Button onclick={handleStartPractice}>התחל תרגול</Button>
	</div>
</div>
