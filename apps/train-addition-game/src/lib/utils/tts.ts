import { settings } from "$lib/stores/settings.svelte";

/**
 * מודול הקראה - תמיכה בהקלטות MP3 עם fallback ל-TTS
 * ותמיכה ב-Fully Kiosk Browser
 *
 * אודיו נטען ומפוענח פעם אחת בלבד לזיכרון (Web Audio API AudioBuffer),
 * כך שהשמעה חוזרת היא מיידית ללא השהיה.
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
  num_0: { file: "0", text: "אפס" },
  num_1: { file: "1", text: "אחד" },
  num_2: { file: "2", text: "שתיים" },
  num_3: { file: "3", text: "שלוש" },
  num_4: { file: "4", text: "ארבע" },
  num_5: { file: "5", text: "חמש" },
  num_6: { file: "6", text: "שש" },
  num_7: { file: "7", text: "שבע" },
  num_8: { file: "8", text: "שמונה" },
  num_9: { file: "9", text: "תשע" },
  num_10: { file: "10", text: "עשר" },
  num_11: { file: "11", text: "אחת עשרה" },
  num_12: { file: "12", text: "שתים עשרה" },
  num_13: { file: "13", text: "שלוש עשרה" },
  num_14: { file: "14", text: "ארבע עשרה" },
  num_15: { file: "15", text: "חמש עשרה" },
  num_16: { file: "16", text: "שש עשרה" },
  num_17: { file: "17", text: "שבע עשרה" },
  num_18: { file: "18", text: "שמונה עשרה" },
  num_19: { file: "19", text: "תשע עשרה" },
  num_20: { file: "20", text: "עשרים" },

  // מילות קישור ופעולות
  plus: { file: "plus", text: "ועוד" },
  equals: { file: "equals", text: "שווה" },

  // תחיליות וסיומות למשפטים
  put_prefix: { file: "put", text: "שים" },
  add_prefix: { file: "add", text: "הוסף עוד" },
  cars_suffix: { file: "cars", text: "קרונות" },

  // משפטים שלמים / הוראות
  put_1: { file: "put_1_cars", text: "שים קרון אחד" },
  put_2: { file: "put_2_cars", text: "שים שני קרונות" },
  put_3: { file: "put_3_cars", text: "שים שלושה קרונות" },
  put_4: { file: "put_4_cars", text: "שים ארבעה קרונות" },
  put_5: { file: "put_5_cars", text: "שים חמישה קרונות" },

  add_1: { file: "add_1_cars", text: "הוסף עוד קרון אחד" },
  add_2: { file: "add_2_cars", text: "הוסף עוד שני קרונות" },
  add_3: { file: "add_3_cars", text: "הוסף עוד שלושה קרונות" },
  add_4: { file: "add_4_cars", text: "הוסף עוד ארבעה קרונות" },

  how_many: { file: "how_many", text: "כמה קרונות יש עכשיו?" },
  correct: { file: "correct", text: "נכון!" },
  well_done: { file: "well_done", text: "כל הכבוד!" },
  wrong: { file: "wrong", text: "לא נכון." },
  try_again: { file: "try_again", text: "נסה שוב." },

  // שאלה מפורטת - "כמה זה X רכבות ועוד Y?"
  how_many_is: { file: "how_many_is", text: "כמה זה" },
  trains_plus: { file: "trains_plus", text: "רכבות, ועוד" },
} as const;

type VoiceKey = keyof typeof VOICE_ASSETS;

// ========================================
// Web Audio API - Cache בזיכרון
// ========================================

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
let preloadDone: Promise<void> | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playBuffer(buffer: AudioBuffer): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start(0);
  });
}

// ========================================
// פונקציות עזר
// ========================================

function getNumberKey(n: number): VoiceKey {
  return `num_${n}` as VoiceKey;
}

function numberToText(n: number): string {
  const key = getNumberKey(n);
  if (key in VOICE_ASSETS) {
    return VOICE_ASSETS[key].text;
  }
  return n.toString();
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

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * השמעה מה-cache, עם fallback ל-TTS
 * @param key המפתח באובייקט VOICE_ASSETS
 */
async function playAsset(key: VoiceKey | null): Promise<void> {
  if (!key || !(key in VOICE_ASSETS)) return;

  const asset = VOICE_ASSETS[key];

  if (FORCE_TTS_ONLY) {
    await speakTTS(asset.text);
    return;
  }

  const cached = bufferCache.get(key);
  if (cached) {
    await playBuffer(cached);
    return;
  }

  // fallback ל-TTS אם הקובץ לא נמצא ב-cache (לפני סיום preload או שגיאת טעינה)
  await speakTTS(asset.text);
}

/**
 * משמיע רצף של מפתחות מ-VOICE_ASSETS
 */
async function playSequence(keys: VoiceKey[]): Promise<void> {
  for (const key of keys) {
    await playAsset(key);
  }
}

// ========================================
// פונקציות ציבוריות
// ========================================

/**
 * השמעת הוראה לשלב בנייה A
 */
export function speakBuildA(count: number): void {
  const exactKey = `put_${count}` as VoiceKey;

  if (exactKey in VOICE_ASSETS) {
    playAsset(exactKey);
  } else {
    const text = `${VOICE_ASSETS.put_prefix.text} ${numberToText(count)} ${VOICE_ASSETS.cars_suffix.text}`;
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
 * @param a מספר קרונות בקבוצה ראשונה
 * @param b מספר קרונות בקבוצה שנייה
 */
export function speakChooseAnswer(a?: number, b?: number): void {
  if (
    settings.detailedQuestion &&
    typeof a === "number" &&
    typeof b === "number"
  ) {
    // "כמה זה" -> num_a -> "רכבות, ועוד" -> num_b
    playSequence(["how_many_is", getNumberKey(a), "trains_plus", getNumberKey(b)]);
  } else {
    playAsset("how_many");
  }
}

/**
 * השמעת משוב חיובי מפורט
 * מבנה: "נכון!" -> A -> "ועוד" -> B -> "שווה" -> SUM -> "כל הכבוד!"
 */
export async function speakCorrect(a?: number, b?: number): Promise<void> {
  if (typeof a !== "number" || typeof b !== "number") {
    await playSequence(["correct", "well_done"]);
    return;
  }

  const sum = a + b;
  await playSequence([
    "correct",
    getNumberKey(a),
    "plus",
    getNumberKey(b),
    "equals",
    getNumberKey(sum),
    "well_done",
  ]);
}

/**
 * השמעת משוב שגיאה
 */
export async function speakWrong(a: number, b: number): Promise<void> {
  await playSequence(["wrong", "try_again"]);

  if (
    settings.detailedQuestion &&
    typeof a === "number" &&
    typeof b === "number"
  ) {
    // "כמה זה" -> num_a -> "רכבות, ועוד" -> num_b
    await playSequence(["how_many_is", getNumberKey(a), "trains_plus", getNumberKey(b)]);
  }
}

/**
 * השמעת טקסט בעברית (TTS ישיר)
 */
export function speak(text: string): void {
  speakTTS(text);
}

/**
 * טעינה מראש של כל קבצי האודיו לזיכרון (Web Audio API).
 * מטען כל קובץ MP3 פעם אחת ומאחסן AudioBuffer מפוענח ב-cache.
 * ניתן לקרוא פעמיים בבטחה - הטעינה תתבצע רק פעם אחת.
 */
export function preloadAllAssets(): void {
  if (typeof window === "undefined") return;
  if (preloadDone) return;

  const doLoad = async () => {
    const ctx = getAudioContext();

    const entries = Object.entries(VOICE_ASSETS) as [VoiceKey, VoiceAsset][];

    await Promise.allSettled(
      entries.map(async ([key, asset]) => {
        try {
          const response = await fetch(SOUNDS_BASE + asset.file + ".mp3");
          if (!response.ok) return;
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          bufferCache.set(key, audioBuffer);
        } catch {
          // קובץ לא נמצא או שגיאת פענוח - יישתמש ב-TTS fallback בעת השמעה
        }
      }),
    );
  };

  preloadDone = new Promise<void>((resolve) => {
    const run = () => doLoad().finally(resolve);

    if ("requestIdleCallback" in window) {
      requestIdleCallback(run);
    } else {
      setTimeout(run, 2000);
    }
  });
}
