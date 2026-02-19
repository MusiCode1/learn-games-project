import { settings } from "$lib/stores/settings.svelte";

/**
 * מודול הקראה - תמיכה בהקלטות עם fallback ל-TTS
 * ותמיכה ב-Fully Kiosk Browser
 */

// ========================================
// הגדרות
// ========================================

/**
 * כפה שימוש ב-TTS בלבד (ללא הקלטות)
 * שנה ל-true לבדיקות או אם אין קבצי סאונד
 */
// ========================================
// הגדרות
// ========================================

/**
 * כפה שימוש ב-TTS בלבד (ללא הקלטות)
 * שנה ל-true לבדיקות או אם אין קבצי סאונד
 */
const FORCE_TTS_ONLY = false;

// הגדרת ממשק חלקי ל-Fully Kiosk
interface FullyKiosk {
  textToSpeech(text: string, locale?: string, engine?: string): void;
}

// הרחבת Window
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

// נתיב לקבצי הסאונד
const SOUNDS_BASE = "/sounds/";

// טיפוס עבור נכס קולי (קובץ + טקסט)
type VoiceAsset = {
  file: string;
  text: string;
};

// מקור האמת היחיד לכל הנכסים הקוליים (קבצים וטקסטים)
const VOICE_ASSETS = {
  // מספרים
  num_0: { file: "num_0.wav", text: "אפס" },
  num_1: { file: "num_1.wav", text: "אחד" },
  num_2: { file: "num_2.wav", text: "שתיים" },
  num_3: { file: "num_3.wav", text: "שלוש" },
  num_4: { file: "num_4.wav", text: "ארבע" },
  num_5: { file: "num_5.wav", text: "חמש" },
  num_6: { file: "num_6.wav", text: "שש" },
  num_7: { file: "num_7.wav", text: "שבע" },
  num_8: { file: "num_8.wav", text: "שמונה" },
  num_9: { file: "num_9.wav", text: "תשע" },
  num_10: { file: "num_10.wav", text: "עשר" },
  num_11: { file: "num_11.wav", text: "אחת עשרה" },
  num_12: { file: "num_12.wav", text: "שתים עשרה" },
  num_13: { file: "num_13.wav", text: "שלוש עשרה" },
  num_14: { file: "num_14.wav", text: "ארבע עשרה" },
  num_15: { file: "num_15.wav", text: "חמש עשרה" },
  num_16: { file: "num_16.wav", text: "שש עשרה" },
  num_17: { file: "num_17.wav", text: "שבע עשרה" },
  num_18: { file: "num_18.wav", text: "שמונה עשרה" },
  num_19: { file: "num_19.wav", text: "תשע עשרה" },
  num_20: { file: "num_20.wav", text: "עשרים" },

  // מילות קישור ופעולות
  plus: { file: "plus.wav", text: "ועוד" },
  equals: { file: "equals.wav", text: "שווה" },

  // תחיליות וסיומות למשפטים (כרגע בשימוש להרכבת משפטים אם אין קובץ מלא)
  put_prefix: { file: "put.wav", text: "שים" },
  add_prefix: { file: "add.wav", text: "הוסף עוד" },
  cars_suffix: { file: "cars.wav", text: "קרונות" },

  // משפטים שלמים / הוראות (Legacy + Fallback)
  // הערה: חלק מהקבצים כאן קיימים במערכת, חלקם לשימוש עתידי או fallback ל-TTS
  put_1: { file: "put_1_cars.wav", text: "שים קרון אחד" },
  put_2: { file: "put_2_cars.wav", text: "שים שני קרונות" },
  put_3: { file: "put_3_cars.wav", text: "שים שלושה קרונות" },
  put_4: { file: "put_4_cars.wav", text: "שים ארבעה קרונות" },
  put_5: { file: "put_5_cars.wav", text: "שים חמישה קרונות" },

  add_1: { file: "add_1_cars.wav", text: "הוסף עוד קרון אחד" },
  add_2: { file: "add_2_cars.wav", text: "הוסף עוד שני קרונות" },
  add_3: { file: "add_3_cars.wav", text: "הוסף עוד שלושה קרונות" },
  add_4: { file: "add_4_cars.wav", text: "הוסף עוד ארבעה קרונות" },

  how_many: { file: "how_many.wav", text: "כמה קרונות יש עכשיו?" },
  correct: { file: "correct.wav", text: "נכון!" },
  well_done: { file: "well_done.wav", text: "כל הכבוד!" },
  wrong: { file: "wrong.wav", text: "לא נכון." },
  try_again: { file: "try_again.wav", text: "נסה שוב." },
} as const;

type VoiceKey = keyof typeof VOICE_ASSETS;

// ========================================
// פונקציות עזר
// ========================================

/**
 * המרת מספר לעברית (0-20) וקבלת המפתח המתאים
 */
function getNumberKey(n: number): VoiceKey {
  return `num_${n}` as VoiceKey;
}

/**
 * המרת מספר לטקסט בעברית (לשימוש בתוך משפטים מורכבים במידת הצורך)
 */
function numberToText(n: number): string {
  const key = getNumberKey(n);
  // בדיקת קיום המפתח (למקרה של מספר מעל 20 שטרם הוגדר)
  if (key in VOICE_ASSETS) {
    return VOICE_ASSETS[key].text;
  }
  return n.toString();
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
    const fully = getFullyKiosk();

    // עדיפות 1: Fully Kiosk TTS
    if (fully) {
      console.log("Using Fully Kiosk TTS:", text);
      fully.textToSpeech(text);
      // Fully לא מדווח מתי הסתיים, נחזיר מיד עם השהיה קטנה
      // במקרה של רצף, ייתכן שנצטרך התאמה
      setTimeout(resolve, 800);
      return;
    }

    // עדיפות 2: Web Speech API
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
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
 * השמעה עם fallback מתוך ה-VOICE_ASSETS
 * @param key המפתח באובייקט VOICE_ASSETS
 * @param overrideText טקסט חלופי (אופציונלי) - אם רוצים לדרוס את הטקסט מהאובייקט (למשל למשפט מורכב)
 */
async function playAsset(
  key: VoiceKey | null,
  overrideText?: string,
): Promise<void> {
  // אם אין מפתח, או שמשהו לא תקין, ננסה להשמיע רק את הטקסט אם סופק
  if (!key || !(key in VOICE_ASSETS)) {
    if (overrideText) await speakTTS(overrideText);
    return;
  }

  const asset = VOICE_ASSETS[key];
  const textToSpeak = overrideText || asset.text;

  // אם מצב TTS בלבד
  if (FORCE_TTS_ONLY) {
    await speakTTS(textToSpeak);
    return;
  }

  // נסה להשמיע קובץ
  // הערה: כרגע המערכת מניחה שהקובץ קיים אם יש מפתח.
  // בעתיד אפשר להוסיף שדה `hasRecording` אם רוצים להימנע מניסיון טעינה לקבצים שטרם הוקלטו.
  // כרגע `playAudioFile` יחזיר false אם הקובץ לא נטען, וזה יפעיל את ה-fallback.
  const success = await playAudioFile(asset.file);

  // אם נכשל - fallback ל-TTS
  if (!success) {
    await speakTTS(textToSpeak);
  }
}

/**
 * משמיע רצף של פריטים
 * כל פריט יכול להיות מפתח מתוך VOICE_ASSETS או טקסט חופשי (שאז יושמע ב-TTS)
 */
async function playSequence(
  sequence: { key?: VoiceKey; text?: string }[],
): Promise<void> {
  for (const item of sequence) {
    if (item.key) {
      await playAsset(item.key, item.text); // item.text יכול לשמש כ-override אם רוצים
    } else if (item.text) {
      await speakTTS(item.text);
    }
  }
}

// ========================================
// פונקציות ציבוריות
// ========================================

/**
 * השמעת הוראה לשלב בנייה A
 */
export function speakBuildA(count: number): void {
  // ננסה להשתמש בקובץ ספציפי אם קיים (למשל put_3)
  const exactKey = `put_${count}` as VoiceKey;

  if (exactKey in VOICE_ASSETS) {
    // השתמש בנכס הקיים (קובץ או טקסט המוגדר בו)
    playAsset(exactKey);
  } else {
    // הרכבת משפט (בעיקר ל-TTS כי אין קובץ כזה)
    const text = `${VOICE_ASSETS.put_prefix.text} ${numberToText(count)} ${VOICE_ASSETS.cars_suffix.text}`;
    // משמיעים ב-TTS (או שנרצה רצף? כרגע TTS למשפט שלם זורם יותר)
    speakTTS(text);
  }
}

/**
 * השמעת הוראה לשלב הוספה B
 */
export function speakAddB(count: number): void {
  const exactKey = `add_${count}` as VoiceKey;

  if (exactKey in VOICE_ASSETS) {
    playAsset(exactKey);
  } else {
    const text = `${VOICE_ASSETS.add_prefix.text} ${numberToText(count)} ${VOICE_ASSETS.cars_suffix.text}`;
    speakTTS(text);
  }
}

/**
 * השמעת שאלת הבחירה
 * @param a מספר קרונות בקבוצה ראשונה (אופציונלי לשימוש בשאלה מפורטת)
 * @param b מספר קרונות בקבוצה שנייה (אופציונלי לשימוש בשאלה מפורטת)
 */
export function speakChooseAnswer(a?: number, b?: number): void {
  // בדיקה אם יש הגדרה לשאלה מפורטת ואם הועברו פרמטרים
  if (
    settings.detailedQuestion &&
    typeof a === "number" &&
    typeof b === "number"
  ) {
    // שאלה מפורטת: "כמה זה X רכבות ועוד Y?"
    // נשתמש ב-TTS למשפט המלא כדי לשמור על אינטונציה
    const text = `כמה זה ${a} רכבות ועוד ${b}?`;
    speakTTS(text);
  } else {
    // מצב רגיל - "כמה קרונות יש עכשיו?"
    playAsset("how_many");
  }
}

/**
 * השמעת משוב חיובי מפורט
 * מבנה: "נכון!" -> "A" -> "ועוד" -> "B" -> "שווה" -> "SUM" -> "כל הכבוד!"
 */
export async function speakCorrect(a?: number, b?: number): Promise<void> {
  // אם אין מספרים (fallback לקוד ישן), רק "נכון! כל הכבוד!"
  if (typeof a !== "number" || typeof b !== "number") {
    await playSequence([{ key: "correct" }, { key: "well_done" }]);
    return;
  }

  const sum = a + b;

  // בניית הרצף באמצעות מפתחות (כך שאם יהיו קבצים לכל מספר, הם יושמעו)
  await playSequence([
    { key: "correct" }, // נכון!
    { key: getNumberKey(a) }, // 3
    { key: "plus" }, // ועוד
    { key: getNumberKey(b) }, // 3
    { key: "equals" }, // שווה
    { key: getNumberKey(sum) }, // 6
    { key: "well_done" }, // כל הכבוד!
  ]);
}

/**
 * השמעת משוב שגיאה
 */
export async function speakWrong(a: number, b: number): Promise<void> {
  // ניתן לפצל ל-"לא נכון" ו-"נסה שוב"
  // מנגנים אותם ברצף
  await playSequence([{ key: "wrong" }, { key: "try_again" }]);

  // אם מוגדרת שאלה מפורטת, חוזרים עליה שוב כדי להזכיר לילד את התרגיל
  if (
    settings.detailedQuestion &&
    typeof a === "number" &&
    typeof b === "number"
  ) {
    const text = `כמה זה ${a} רכבות ועוד ${b}?`;
    await speakTTS(text);
  }
}

/**
 * השמעת טקסט בעברית (TTS ישיר)
 */
export function speak(text: string): void {
  speakTTS(text);
}
