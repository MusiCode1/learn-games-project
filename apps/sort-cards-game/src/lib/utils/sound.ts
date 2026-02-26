/**
 * מודול סאונד — השמעת צלילים
 */

export function playSuccess(): void {
  try {
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing success sound:", e);
  }
}

export function playError(): void {
  try {
    const audio = new Audio("/sounds/error.mp3");
    audio.volume = 0.4;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing error sound:", e);
  }
}
