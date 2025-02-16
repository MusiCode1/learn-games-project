<script lang="ts">
import { goto } from '$app/navigation';
import { WordSession, WordSetCalculator, WordProgress } from '$lib/utils/wordUtils';
import { CONFIG } from '$lib/constants/config';
import PracticeScreen from '$lib/components/screens/PracticeScreen.svelte';
import { words } from '$lib/data/words';

// פרמטרים מהניתוב
const { data } = $props();

// יצירת סט המילים הנוכחי
const currentSetWords = WordSetCalculator.getWordsForSet(
  words, 
  data.set, 
  data.wordsPerSet
);

// יצירת הסשן (לא ריאקטיבי)
const sessionState = WordSession.create(currentSetWords, data.repetitions);
const session = $state({
  words: sessionState.words,
  currentIndex: sessionState.currentIndex,
  wordsPerRepetition: sessionState.wordsPerRepetition,
  totalRepetitions: sessionState.totalRepetitions
});

// חישוב מספר הסטים הכולל
const totalSets = $derived.by(() => 
  WordSetCalculator.calculateTotalSets(words, data.wordsPerSet)
);

function handleNextWord() {
  const nextState = WordSession.next({
    words: session.words,
    currentIndex: session.currentIndex,
    wordsPerRepetition: session.wordsPerRepetition,
    totalRepetitions: session.totalRepetitions
  });
  session.currentIndex = nextState.currentIndex;
}

function handlePrevWord() {
  const prevState = WordSession.prev({
    words: session.words,
    currentIndex: session.currentIndex,
    wordsPerRepetition: session.wordsPerRepetition,
    totalRepetitions: session.totalRepetitions
  });
  session.currentIndex = prevState.currentIndex;
}

function handleFinishSet() {
  // שמירת התקדמות
  WordProgress.save(data.set, data.wordsPerSet, data.repetitions);
  
  // אם סיימנו את כל החזרות, עוברים לסט הבא
  if (WordSession.isComplete(session)) {
    if (data.set < totalSets) {
      goto(`/practice?set=${data.set + 1}&wordsPerSet=${data.wordsPerSet}&repetitions=${data.repetitions}`);
    } else {
      goto('/');
    }
  }
}

function handleFinishPractice() {
  goto('/');
}

// ניהול אנימציה
let direction = $state<'next' | 'prev' | null>(null);

// חישוב ערכים נגזרים לתצוגה
const currentWord = $derived.by(() => WordSession.getCurrentWord(session));
const progress = $derived.by(() => WordSession.getProgress(session));
const currentRepetition = $derived.by(() => WordSession.getCurrentRepetition(session));

async function handleNext() {
  if (!WordSession.isComplete(session)) {
    direction = 'next';
    handleNextWord();
  }
}

async function handlePrev() {
  if (session.currentIndex > 0) {
    direction = 'prev';
    handlePrevWord();
  }
}

// ניהול מקשי מקלדת
$effect(() => {
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      handleFinishPractice();
    }
  }
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
});

// איפוס כיוון האנימציה
$effect(() => {
  if (direction) {
    const timer = setTimeout(() => {
      direction = null;
    }, CONFIG.app.transitionDuration);
    return () => clearTimeout(timer);
  }
});
</script>

<PracticeScreen 
  word={currentWord}
  isFirst={session.currentIndex === 0}
  isLast={WordSession.isComplete(session)}
  currentWord={progress.current}
  totalWords={progress.total}
  currentSet={data.set}
  totalSets={totalSets}
  currentRepetition={currentRepetition}
  totalRepetitions={session.totalRepetitions}
  onNext={handleNext}
  onPrev={handlePrev}
  onFinish={handleFinishSet}
  onExit={handleFinishPractice}
  {direction}
/>
