import type { PageLoad } from './$types';
import { CONFIG } from '$lib/constants/config';

export const load = (async ({ url }) => {
  const wordsPerSet = parseInt(url.searchParams.get('wordsPerSet') || CONFIG.app.defaultWordsPerSet.toString(), 10);
  const set = parseInt(url.searchParams.get('set') || '1', 10);
  const repetitions = parseInt(url.searchParams.get('repetitions') || CONFIG.app.defaultRepetitions.toString(), 10);
  const hideAfterSeconds = parseInt(url.searchParams.get('hideAfterSeconds') || CONFIG.app.defaultHideSeconds.toString(), 10);

  return {
    wordsPerSet,
    set,
    repetitions,
    hideAfterSeconds
  };
}) satisfies PageLoad;
