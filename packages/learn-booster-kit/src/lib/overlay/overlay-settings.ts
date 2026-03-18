/**
 * אחסון הגדרות אוברליי הטיימר ב-localStorage.
 * כולל הפעלה/כיבוי + מיקום (אחוזים).
 * סנכרון בין browsing contexts דרך אירוע storage.
 */

import { type } from "arktype";

const STORAGE_KEY = 'overlay-timer-settings';
const LOG_PREFIX = '[overlay-settings]';

export const MIN_SIZE_PX = 80;
export const MAX_SIZE_PX = 220;

export const OverlayTimerSettingsSchema = type({
  enabled: "boolean",
  xPercent: "number >= 0 & number <= 100",
  yPercent: "number >= 0 & number <= 100",
  sizePx: `number >= ${MIN_SIZE_PX} & number <= ${MAX_SIZE_PX}`,
});
export type OverlayTimerSettings = typeof OverlayTimerSettingsSchema.infer;

export const DEFAULT_SETTINGS: OverlayTimerSettings = {
  enabled: true,
  xPercent: 6,
  yPercent: 50,
  sizePx: 140,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function loadOverlaySettings(): OverlayTimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed: unknown = JSON.parse(raw);
    const result = OverlayTimerSettingsSchema(parsed);
    if (result instanceof type.errors) {
      console.warn(`${LOG_PREFIX} Invalid stored settings, using defaults:`, result.summary);
      return { ...DEFAULT_SETTINGS };
    }
    return result;
  } catch (e) {
    console.warn(`${LOG_PREFIX} Failed to load settings:`, e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveOverlaySettings(settings: OverlayTimerSettings): void {
  const clamped: OverlayTimerSettings = {
    enabled: settings.enabled,
    xPercent: clamp(settings.xPercent, 0, 100),
    yPercent: clamp(settings.yPercent, 0, 100),
    sizePx: clamp(settings.sizePx, MIN_SIZE_PX, MAX_SIZE_PX),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
    console.info(`${LOG_PREFIX} Settings saved:`, clamped);
  } catch (e) {
    console.error(`${LOG_PREFIX} Failed to save settings:`, e);
  }
}

/**
 * מאזין לשינויים ב-overlay settings מ-browsing contexts אחרים (storage event).
 * מחזיר פונקציית cleanup.
 */
export function onOverlaySettingsChange(
  callback: (settings: OverlayTimerSettings) => void,
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        const result = OverlayTimerSettingsSchema(parsed);
        if (!(result instanceof type.errors)) {
          console.info(`${LOG_PREFIX} Settings changed from another context:`, result);
          callback(result);
        }
      } catch {
        /* ignore */
      }
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
