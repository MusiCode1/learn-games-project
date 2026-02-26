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

/**
 * השמעת טקסט ב-TTS
 */
function speakTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    const fully = getFullyKiosk();

    // עדיפות 1: Fully Kiosk TTS
    if (fully) {
      fully.textToSpeech(text);
      setTimeout(resolve, 800);
      return;
    }

    // עדיפות 2: Web Speech API
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
 * השמעת טקסט בעברית
 */
export function speak(text: string): void {
  speakTTS(text);
}

/**
 * הקראת משוב חיובי עם הקשר
 * @param categoryName שם הקטגוריה שאליה מויין הכרטיס
 * @param cardText טקסט הכרטיס (ttsText / content)
 */
export function speakCorrect(categoryName?: string, cardText?: string): void {
  let text: string;
  if (cardText && categoryName) {
    text = `${cardText}, ${categoryName}! כל הכבוד!`;
  } else if (categoryName) {
    text = `${categoryName}! כל הכבוד!`;
  } else {
    text = "כל הכבוד!";
  }
  speakTTS(text);
}

/**
 * הקראת משוב שגוי
 */
export function speakWrong(): void {
  speakTTS("לא נכון, נסה שוב");
}
