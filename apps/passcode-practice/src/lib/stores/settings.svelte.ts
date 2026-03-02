/**
 * הגדרות מורה עם שמירה ב-localStorage
 */

const STORAGE_KEY = "passcode-practice-settings";
const CURRENT_VERSION = 1;

export interface PasscodeSettings {
  passcode: string;
  showHint: boolean;
  cooldownMs: number;
  voiceEnabled: boolean;
  speakDigits: boolean;
  boosterEnabled: boolean;
}

export const DEFAULT_SETTINGS: PasscodeSettings = {
  passcode: "1234",
  showHint: true,
  cooldownMs: 2000,
  voiceEnabled: true,
  speakDigits: false,
  boosterEnabled: true,
};

/**
 * מחלקת ניהול הגדרות
 */
class SettingsStore {
  passcode = $state(DEFAULT_SETTINGS.passcode);
  showHint = $state(DEFAULT_SETTINGS.showHint);
  cooldownMs = $state(DEFAULT_SETTINGS.cooldownMs);
  voiceEnabled = $state(DEFAULT_SETTINGS.voiceEnabled);
  speakDigits = $state(DEFAULT_SETTINGS.speakDigits);
  boosterEnabled = $state(DEFAULT_SETTINGS.boosterEnabled);

  constructor() {
    if (typeof globalThis?.localStorage !== "undefined") {
      this.load();
    }

    // שמירה אוטומטית בכל שינוי
    $effect.root(() => {
      $effect(() => {
        this.toJSON();
        this.save();
      });
    });
  }

  private load(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.passcode = parsed.passcode ?? DEFAULT_SETTINGS.passcode;
        this.showHint = parsed.showHint ?? DEFAULT_SETTINGS.showHint;
        this.cooldownMs = parsed.cooldownMs ?? DEFAULT_SETTINGS.cooldownMs;
        this.voiceEnabled = parsed.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled;
        this.speakDigits = parsed.speakDigits ?? DEFAULT_SETTINGS.speakDigits;
        this.boosterEnabled = parsed.boosterEnabled ?? DEFAULT_SETTINGS.boosterEnabled;
      } catch (e) {
        console.error("Failed to parse passcode-practice settings", e);
      }
    }
  }

  toJSON(): PasscodeSettings & { schemaVersion: number } {
    return {
      schemaVersion: CURRENT_VERSION,
      passcode: this.passcode,
      showHint: this.showHint,
      cooldownMs: this.cooldownMs,
      voiceEnabled: this.voiceEnabled,
      speakDigits: this.speakDigits,
      boosterEnabled: this.boosterEnabled,
    };
  }

  private save(): void {
    if (typeof window?.localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
  }

  reset(): void {
    this.passcode = DEFAULT_SETTINGS.passcode;
    this.showHint = DEFAULT_SETTINGS.showHint;
    this.cooldownMs = DEFAULT_SETTINGS.cooldownMs;
    this.voiceEnabled = DEFAULT_SETTINGS.voiceEnabled;
    this.speakDigits = DEFAULT_SETTINGS.speakDigits;
    this.boosterEnabled = DEFAULT_SETTINGS.boosterEnabled;
  }

  /** ולידציה — רק ספרות, לפחות ספרה אחת */
  get isPasscodeValid(): boolean {
    return /^\d+$/.test(this.passcode) && this.passcode.length >= 1;
  }
}

// ייצוא singleton
export const settings = new SettingsStore();
