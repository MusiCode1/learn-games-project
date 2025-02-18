import type { PageLoad } from './$types';
import { CONFIG } from '$lib/constants/config';
import { WordSetCalculator } from '$lib/utils/wordUtils';
import { words } from '$lib/data/words';

export const load = (async ({ url }) => {
  // קריאת פרמטרים מה-URL עם ערכי ברירת מחדל
  let wordsPerSet = parseInt(url.searchParams.get('wordsPerSet') || CONFIG.app.defaultWordsPerSet.toString(), 10);
  let set = parseInt(url.searchParams.get('set') || '1', 10);
  let repetitions = parseInt(url.searchParams.get('repetitions') || CONFIG.app.defaultRepetitions.toString(), 10);
  let hideAfterSeconds = parseInt(url.searchParams.get('hideAfterSeconds') || CONFIG.app.defaultHideSeconds.toString(), 10);
  let wordIndex = Math.max(0, parseInt(url.searchParams.get('wordIndex') || '1', 10) - 1);

  // בדיקת תקינות מספר המילים בסט
  if (!WordSetCalculator.validateWordsPerSet(wordsPerSet)) {
    wordsPerSet = CONFIG.app.defaultWordsPerSet;
  }

  // חישוב מספר הסטים הכולל
  const totalSets = WordSetCalculator.calculateTotalSets(words, wordsPerSet);

  // בדיקת תקינות מספר הסט
  if (!WordSetCalculator.validateSetNumber(set, totalSets)) {
    set = 1;
  }

  // בדיקת תקינות מספר החזרות
  if (!WordSetCalculator.validateRepetitions(repetitions)) {
    repetitions = CONFIG.app.defaultRepetitions;
  }

  // בדיקת תקינות זמן הסתרה
  if (hideAfterSeconds < 0) {
    hideAfterSeconds = CONFIG.app.defaultHideSeconds;
  }

  // בדיקת תקינות אינדקס המילה
  const currentSetWords = WordSetCalculator.getWordsForSet(words, set, wordsPerSet);
  const maxWordIndex = currentSetWords.length * repetitions - 1;
  if (wordIndex < 0 || wordIndex > maxWordIndex) {
    wordIndex = 0;
  }

  return {
    wordsPerSet,
    set,
    repetitions,
    hideAfterSeconds,
    wordIndex
  };
}) satisfies PageLoad;
