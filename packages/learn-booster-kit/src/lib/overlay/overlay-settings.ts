/**
 * אחסון הגדרות אוברליי הטיימר ב-localStorage.
 * כולל הפעלה/כיבוי + מיקום (אחוזים).
 * סנכרון בין browsing contexts דרך אירוע storage.
 */

const STORAGE_KEY = 'overlay-timer-settings';
const LOG_PREFIX = '[overlay-settings]';

export interface OverlayTimerSettings {
  enabled: boolean;
  xPercent: number; // 0-100
  yPercent: number; // 0-100
  sizePx: number;   // גודל הטיימר בפיקסלים (ברירת מחדל: 140)
}

export const DEFAULT_SETTINGS: OverlayTimerSettings = {
  enabled: true,
  xPercent: 6,
  yPercent: 50,
  sizePx: 140,
};

export const MIN_SIZE_PX = 80;
export const MAX_SIZE_PX = 220;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function validate(raw: unknown): OverlayTimerSettings | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.enabled !== 'boolean' ||
    typeof obj.xPercent !== 'number' ||
    typeof obj.yPercent !== 'number'
  ) {
    return null;
  }
  return {
    enabled: obj.enabled,
    xPercent: clamp(obj.xPercent, 0, 100),
    yPercent: clamp(obj.yPercent, 0, 100),
    sizePx: clamp(
      typeof obj.sizePx === 'number' ? obj.sizePx : DEFAULT_SETTINGS.sizePx,
      MIN_SIZE_PX,
      MAX_SIZE_PX,
    ),
  };
}

export function loadOverlaySettings(): OverlayTimerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    const validated = validate(parsed);
    if (validated) return validated;
    console.warn(`${LOG_PREFIX} Invalid stored settings, using defaults`);
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
        const parsed = JSON.parse(e.newValue);
        const validated = validate(parsed);
        if (validated) {
          console.info(`${LOG_PREFIX} Settings changed from another context:`, validated);
          callback(validated);
        }
      } catch {
        /* ignore */
      }
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
