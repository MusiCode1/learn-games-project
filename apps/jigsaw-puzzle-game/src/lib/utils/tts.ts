/**
 * מודול TTS — Fully Kiosk → Web Speech API → silent
 */

interface FullyKiosk {
  textToSpeech(text: string, locale?: string, engine?: string): void;
}

declare global {
  interface Window {
    fully?: FullyKiosk;
  }
}

function getFullyKiosk(): FullyKiosk | undefined {
  if (typeof window !== "undefined" && window.fully) {
    return window.fully;
  }
  return undefined;
}

function speakTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    const fully = getFullyKiosk();

    if (fully) {
      fully.textToSpeech(text);
      setTimeout(resolve, 800);
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 0.9;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * הקראת טקסט בעברית
 */
export function speak(text: string): void {
  speakTTS(text);
}

/**
 * הקראת משוב סיום פאזל
 */
export function speakComplete(imageName?: string): void {
  let text: string;
  if (imageName) {
    text = `${imageName}! כל הכבוד!`;
  } else {
    text = "כל הכבוד!";
  }
  speakTTS(text);
}
