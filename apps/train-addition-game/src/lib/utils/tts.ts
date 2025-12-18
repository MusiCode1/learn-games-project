/**
 * מודול הקראה - תמיכה בהקלטות עם fallback ל-TTS
 *
 * אם קיים קובץ הקלטה - משמיע אותו
 * אם לא - משתמש ב-Web Speech API
 */

// ========================================
// הגדרות
// ========================================

/**
 * כפה שימוש ב-TTS בלבד (ללא הקלטות)
 * שנה ל-true לבדיקות או אם אין קבצי סאונד
 */
const FORCE_TTS_ONLY = false;

// נתיב לקבצי הסאונד
const SOUNDS_BASE = "/sounds/";

// מיפוי קבצים
const SOUND_FILES = {
  put_1: "put_1_cars.wav",
  put_2: "put_2_cars.wav",
  put_3: "put_3_cars.wav",
  put_4: "put_4_cars.wav",
  put_5: "put_5_cars.wav",
  add_1: "add_1_cars.wav",
  add_2: "add_2_cars.wav",
  add_3: "add_3_cars.wav",
  add_4: "add_4_cars.wav",
  how_many: "how_many.wav",
  correct: "correct.wav",
  wrong: "wrong.wav",
} as const;

// טקסטים עבור TTS (fallback)
const TTS_TEXTS = {
  put: (n: number) => `שים ${numberToHebrew(n)} קרונות`,
  add: (n: number) => `הוסף עוד ${numberToHebrew(n)} קרונות`,
  how_many: "כמה קרונות יש עכשיו?",
  correct: "נכון! כל הכבוד!",
  wrong: "לא נכון. נסה שוב.",
};

// ========================================
// פונקציות עזר
// ========================================

/**
 * המרת מספר לעברית
 */
function numberToHebrew(n: number): string {
  const words = [
    "",
    "אחד",
    "שניים",
    "שלושה",
    "ארבעה",
    "חמישה",
    "שישה",
    "שבעה",
    "שמונה",
    "תשעה",
    "עשרה",
  ];
  return words[n] || n.toString();
}

/**
 * השמעת קובץ אודיו
 * @returns Promise שמסתיים כשהאודיו נגמר או נכשל
 */
function playAudioFile(filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(SOUNDS_BASE + filename);

    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);

    audio.play().catch(() => resolve(false));
  });
}

/**
 * השמעת טקסט ב-TTS
 * @returns Promise שמסתיים כשהדיבור נגמר
 */
function speakTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      console.warn("TTS לא נתמך בדפדפן זה");
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 0.9;

    // סיום הדיבור
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * השמעה עם fallback
 * מנסה להשמיע קובץ, ואם נכשל - משתמש ב-TTS
 */
async function playWithFallback(
  soundKey: keyof typeof SOUND_FILES | null,
  ttsText: string
): Promise<void> {
  // אם מצב TTS בלבד
  if (FORCE_TTS_ONLY || !soundKey) {
    await speakTTS(ttsText);
    return;
  }

  // נסה להשמיע קובץ
  const filename = SOUND_FILES[soundKey];
  const success = await playAudioFile(filename);

  // אם נכשל - fallback ל-TTS
  if (!success) {
    console.log(`Fallback to TTS for: ${soundKey}`);
    await speakTTS(ttsText);
  }
}

// ========================================
// פונקציות ציבוריות
// ========================================

/**
 * השמעת הוראה לשלב בנייה A
 */
export function speakBuildA(count: number): void {
  const soundKey = `put_${count}` as keyof typeof SOUND_FILES;
  const hasFile = soundKey in SOUND_FILES;
  playWithFallback(hasFile ? soundKey : null, TTS_TEXTS.put(count));
}

/**
 * השמעת הוראה לשלב הוספה B
 */
export function speakAddB(count: number): void {
  const soundKey = `add_${count}` as keyof typeof SOUND_FILES;
  const hasFile = soundKey in SOUND_FILES;
  playWithFallback(hasFile ? soundKey : null, TTS_TEXTS.add(count));
}

/**
 * השמעת שאלת הבחירה
 */
export function speakChooseAnswer(): void {
  playWithFallback("how_many", TTS_TEXTS.how_many);
}

/**
 * השמעת משוב חיובי עם המתנה לסיום
 */
export async function speakCorrect(): Promise<void> {
  await playWithFallback("correct", TTS_TEXTS.correct);
}

/**
 * השמעת משוב שגיאה
 */
export function speakWrong(_a: number, _b: number): void {
  playWithFallback("wrong", TTS_TEXTS.wrong);
}

/**
 * השמעת טקסט בעברית (TTS ישיר)
 */
export function speak(text: string): void {
  speakTTS(text);
}
