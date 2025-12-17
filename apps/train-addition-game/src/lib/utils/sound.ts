/**
 * מודול סאונד - השמעת צלילים
 */

/**
 * השמעת צליל הצלחה
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

/**
 * השמעת צליל טעות
 */
export function playError(): void {
  try {
    const audio = new Audio("/sounds/error.mp3");
    audio.volume = 0.4;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  } catch (e) {
    console.error("Error playing error sound:", e);
  }
}

/**
 * השמעת קובץ אודיו כללי
 */
export function playAudio(url: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(url);
      audio.volume = 1.0;

      audio.onended = () => resolve();
      audio.onerror = (e) => {
        console.warn("Audio playback failed:", e);
        resolve();
      };

      audio.play().catch((e) => {
        console.warn("Audio play failed:", e);
        resolve();
      });
    } catch (e) {
      console.error("Error in playAudio:", e);
      resolve();
    }
  });
}
