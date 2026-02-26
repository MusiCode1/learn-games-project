/**
 * מודול סאונד — השמעת צלילים
 */

export function playSnap(): void {
  try {
    const audio = new Audio("/sounds/snap.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing snap sound:", e);
  }
}

export function playSuccess(): void {
  try {
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing success sound:", e);
  }
}
