<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PracticeCompletionScreenProps } from '$lib/types';
	import { appState } from '$lib/state/appState'; // ייבוא הסטייט הגלובלי
	import { WordSetCalculator } from '$lib/utils/wordUtils'; // ייבוא מחשבון הסטים

	let { state, handlers }: PracticeCompletionScreenProps = $props();

	// חישוב totalSets כערך נגזר מהסטייט הגלובלי וההגדרות מה-props
	const calculatedTotalSets = $derived(
		WordSetCalculator.calculateTotalSets(
			appState.practice.wordsByLevel[state.user.progress.level] || [], // קריאה מהסטייט הגלובלי
			state.user.progress.wordsPerSet
		)
	);

	const derivedTotalWords = $derived(state.practice.session.words.length);
	const derivedRepetitions = $derived(state.user.progress.repetitionsPerSet);
	const derivedCurrentSet = $derived(state.user.progress.currentSet);

	const hasNextSet = $derived.by(() => derivedCurrentSet < calculatedTotalSets); // שימוש בערך המחושב
</script>

<div class="flex h-full items-center justify-center">
	<Container>
		<div class="flex flex-col items-center justify-center gap-8 py-8">
			<h1
				class="from-primary to-secondary animate-fade-in-up bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent"
			>
				כל הכבוד! סיימת את הסט
			</h1>

			<div class="rounded-2xl bg-white p-8 shadow-sm">
				<div class="flex flex-col gap-4 text-center">
					<div class="text-text-secondary">
						תרגלת
						<span class="text-primary font-bold">{derivedTotalWords}</span>
						מילים
					</div>
					<div class="text-text-secondary">
						ביצעת
						<span class="text-primary font-bold">{derivedRepetitions}</span>
						חזרות
					</div>
					<div class="text-text-secondary">
						השלמת סט
						<span class="text-primary font-bold">{derivedCurrentSet}</span>
						מתוך
						<span class="text-primary font-bold">{calculatedTotalSets}</span>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				{#if hasNextSet}
					<Button onclick={handlers.onNextSet} variant="primary" disabled={!hasNextSet}
						>המשך לסט הבא</Button
					>
					<!-- שימוש ב-hasNextSet -->
				{/if}
				<Button onclick={handlers.onRepeatSet} variant="secondary">חזור על הסט</Button>
				<Button onclick={handlers.onHome} variant="secondary">חזור לדף הבית</Button>
			</div>
		</div>
	</Container>
</div>
