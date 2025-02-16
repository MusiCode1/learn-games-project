<script lang="ts">
import { goto } from '$app/navigation';
import { WordSetCalculator } from '$lib/utils/wordUtils';
import PracticeSettingsScreen from '$lib/components/screens/PracticeSettingsScreen.svelte';
import { CONFIG } from '$lib/constants/config';
import { words } from '$lib/data/words';

const state = $state({
  wordsPerSet: CONFIG.app.defaultWordsPerSet,
  currentSet: 1,
  totalSets: WordSetCalculator.calculateTotalSets(words, CONFIG.app.defaultWordsPerSet),
  repetitionsPerSet: CONFIG.app.defaultRepetitions
});

function handleStartPractice(newWordsPerSet: number, newSet: number, newRepetitions: number) {
  const params = new URLSearchParams({
    wordsPerSet: newWordsPerSet.toString(),
    set: newSet.toString(),
    repetitions: newRepetitions.toString()
  });
  goto(`/practice?${params.toString()}`);
}
</script>

<PracticeSettingsScreen 
  wordsPerSet={state.wordsPerSet}
  currentSet={state.currentSet}
  totalSets={state.totalSets}
  repetitionsPerSet={state.repetitionsPerSet}
  onStartPractice={handleStartPractice}
/>
