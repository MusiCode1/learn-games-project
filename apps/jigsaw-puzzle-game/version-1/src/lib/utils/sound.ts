/**
 * מודול סאונד — השמעת צלילים
 */

import { SHARED_URL, asset } from "$lib/config";

export function playSnap(): void {
  try {
    const audio = new Audio(asset(`${SHARED_URL}/sounds/snap.mp3`));
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing snap sound:", e);
  }
}

export function playSuccess(): void {
  try {
    const audio = new Audio(asset(`${SHARED_URL}/sounds/success.mp3`));
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing success sound:", e);
  }
}
