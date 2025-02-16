<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';

interface Props {
wordsPerSet: number;
currentSet: number;
totalSets: number;
repetitionsPerSet: number;
onStartPractice: (wordsPerSet: number, set: number, repetitions: number) => void;
	}

	const props: Props = $props();

const state = $state({
selectedWordsPerSet: props.wordsPerSet,
selectedSet: props.currentSet,
selectedRepetitions: props.repetitionsPerSet
	});

	function handleStartPractice() {
props.onStartPractice(state.selectedWordsPerSet, state.selectedSet, state.selectedRepetitions);
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
			<select id="words-num" class="w-32 rounded-lg border p-2 text-center" bind:value={state.selectedWordsPerSet}>
				<option value={3}>3 מילים</option>
				<option value={5}>5 מילים</option>
				<option value={10}>10 מילים</option>
			</select>
		</div>

		<div class="space-y-2 text-center">
			<label for="set-num" class="block font-medium">סט מספר</label>
			<select id="set-num" class="w-32 rounded-lg border p-2 text-center" bind:value={state.selectedSet}>
				{#each Array(props.totalSets) as _, i}
					<option value={i + 1}>סט {i + 1}</option>
				{/each}
</select>
</div>

<div class="space-y-2 text-center">
<label for="repetitions-num" class="block font-medium">מספר חזרות על כל סט</label>
<select id="repetitions-num" class="w-32 rounded-lg border p-2 text-center" bind:value={state.selectedRepetitions}>
<option value={1}>חזרה אחת</option>
<option value={2}>2 חזרות</option>
<option value={3}>3 חזרות</option>
<option value={5}>5 חזרות</option>
</select>
</div>
</div>

	<div class="flex gap-4">
		<Button onclick={handleBack} variant="secondary">חזרה</Button>
		<Button onclick={handleStartPractice}>התחל תרגול</Button>
	</div>
</div>
