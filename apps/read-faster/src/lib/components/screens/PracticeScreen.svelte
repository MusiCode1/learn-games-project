<script lang="ts">
import WordCard from '$lib/components/ui/WordCard.svelte';
import HiddenImage from '$lib/components/ui/HiddenImage.svelte';
import Navigation from '$lib/components/ui/Navigation.svelte';
import Progress from '$lib/components/ui/Progress.svelte';
import Container from '$lib/components/layout/Container.svelte';
import type { Word } from '$lib/types';

interface Props {
  word: Word;
  isFirst: boolean;
  isLast: boolean;
  currentWord: number;
  totalWords: number;
  currentSet: number;
  totalSets: number;
  currentRepetition: number;
  totalRepetitions: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onExit: () => void;
  direction: 'next' | 'prev' | null;
}

let { 
  word,
  isFirst,
  isLast,
  currentWord,
  totalWords,
  currentSet,
  totalSets,
  currentRepetition,
  totalRepetitions,
  onNext,
  onPrev,
  onFinish,
  onExit,
  direction
}: Props = $props();

function handleNext() {
  if (isLast) {
    onFinish();
  } else {
    onNext();
  }
}
</script>

<div class="flex items-center via-transparent">
  <Container>
    <div class="flex flex-col items-center gap-3">
      <button 
        class="fixed top-4 right-4 px-4 py-2 text-white bg-linear-to-r/oklch from-secondary to-accent rounded-lg shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm"
        onclick={onExit}
      >
        חזור למסך הבית
      </button>

      <div class="flex flex-row gap-6">
        <button type="button" onclick={handleNext}>
          <WordCard 
            word={word.text}
            {direction}
          />
        </button>

        <HiddenImage 
          image={word.image || ''}
          alt={word.text}
          {direction}
        />
      </div>
      
      <Navigation
        onNext={handleNext}
        onPrev={onPrev}
        isFirstWord={isFirst}
        isLastWord={isLast}
      />
      
      <Progress 
        {currentWord}
        {totalWords}
        {currentSet}
        {totalSets}
        {currentRepetition}
        {totalRepetitions}
      />
    </div>
  </Container>
</div>
