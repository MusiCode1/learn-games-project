// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { configManager, profileManager } from './src';

const {
  resetConfig,
  getAllConfig,
  updateGameSettings,
  getGameSettings,
  subscribeGameSettings,
  initializeConfig,
} = configManager;
const { _resetProfilesStateForTesting } = profileManager;

describe('Game Settings API', () => {
  beforeEach(async () => {
    localStorage.clear();
    // איפוס מלא של ה-singleton state בין tests — בלי זה ה-profile-manager
    // משאיר state מ-test קודם (כולל gameSettings ישנות בפרופיל הפעיל).
    _resetProfilesStateForTesting();
    resetConfig();
    await initializeConfig();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getGameSettings', () => {
    it('מחזיר undefined כשאין הגדרות שמורות ל-gameId', () => {
      expect(getGameSettings('find-letter-game')).toBeUndefined();
    });

    it('מחזיר את ההגדרות הספציפיות לאחר שמירה', async () => {
      await updateGameSettings('find-letter-game', { cooldownMs: 3000, voiceEnabled: true });
      expect(getGameSettings('find-letter-game')).toEqual({
        cooldownMs: 3000,
        voiceEnabled: true,
      });
    });

    it('עם generic type — מחזיר טיפוס נכון לצרכן', async () => {
      type FindLetterSettings = { cooldownMs: number; voiceEnabled: boolean };
      await updateGameSettings<FindLetterSettings>('find-letter-game', {
        cooldownMs: 5000,
        voiceEnabled: false,
      });
      const settings = getGameSettings<FindLetterSettings>('find-letter-game');
      expect(settings?.cooldownMs).toBe(5000);
      expect(settings?.voiceEnabled).toBe(false);
    });
  });

  describe('updateGameSettings', () => {
    it('שומר הגדרות חדשות תחת gameId', async () => {
      await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      expect(getGameSettings('lotto-game')).toEqual({ contentProviderId: 'shapes' });
    });

    it('שומר הגדרות של מספר משחקים בנפרד — לא דורס אחד את השני', async () => {
      await updateGameSettings('find-letter-game', { cooldownMs: 3000 });
      await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      expect(getGameSettings('find-letter-game')).toEqual({ cooldownMs: 3000 });
      expect(getGameSettings('lotto-game')).toEqual({ contentProviderId: 'shapes' });
    });

    it('עדכון מבצע החלפה מלאה (לא merge עומק) — מפתחות ישנים נמחקים', async () => {
      // schema v1 של המשחק
      await updateGameSettings('find-letter-game', {
        cooldownMs: 3000,
        voiceEnabled: true,
        legacyField: 'old-value',
      });
      // schema v2 — מסיר את legacyField, מוסיף gridSize
      await updateGameSettings('find-letter-game', {
        cooldownMs: 3000,
        voiceEnabled: true,
        gridSize: '3x3',
      });
      const current = getGameSettings<Record<string, unknown>>('find-letter-game');
      expect(current).toEqual({ cooldownMs: 3000, voiceEnabled: true, gridSize: '3x3' });
      expect(current).not.toHaveProperty('legacyField');
    });

    it('נשמר ל-config.gameSettings וניתן לאחזור דרך getAllConfig', async () => {
      await updateGameSettings('lotto-game', { contentProviderId: 'letters' });
      const config = getAllConfig();
      expect(config.gameSettings).toEqual({ 'lotto-game': { contentProviderId: 'letters' } });
    });

    it('מתסנכרן ל-localStorage דרך הפרופיל הפעיל', async () => {
      await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      const profiles = localStorage.getItem('learn-booster-profiles:v1');
      expect(profiles).toContain('contentProviderId');
      expect(profiles).toContain('shapes');
    });

    it('מחזיר Result של ok עם ה-Config המעודכן', async () => {
      const result = await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.gameSettings?.['lotto-game']).toEqual({ contentProviderId: 'shapes' });
      }
    });

    it('Result ok מאפשר type narrowing דרך result.isOk()', async () => {
      const result = await updateGameSettings('find-letter-game', { cooldownMs: 4000 });
      if (result.isOk()) {
        // TypeScript מצמצם ל-Ok<Config, ValidationError>
        expect(result.value.rewardType).toBeDefined();
        expect(result.value.gameSettings).toBeDefined();
      } else {
        // לא אמור לקרות במצב תקין — אם קרה, נכשיל את הטסט
        throw new Error(`Expected ok but got: ${result.error.summary}`);
      }
    });

    it('Result תומך ב-match בסגנון FP', async () => {
      const result = await updateGameSettings('lotto-game', { contentProviderId: 'letters' });
      const message = result.match(
        (config) => `נשמר: ${Object.keys(config.gameSettings ?? {}).length} משחק(ים)`,
        (error) => `שגיאה: ${error.summary}`,
      );
      expect(message).toMatch(/^נשמר:/);
    });
  });

  describe('subscribeGameSettings', () => {
    it('callback נקרא מיד עם הערך הנוכחי בעת ההרשמה', async () => {
      await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      const callback = vi.fn();
      const unsub = subscribeGameSettings('lotto-game', callback);
      expect(callback).toHaveBeenCalledWith({ contentProviderId: 'shapes' });
      unsub();
    });

    it('callback נקרא עם undefined אם אין הגדרות שמורות', () => {
      const callback = vi.fn();
      const unsub = subscribeGameSettings('non-existent-game', callback);
      expect(callback).toHaveBeenCalledWith(undefined);
      unsub();
    });

    it('callback נקרא שוב כשההגדרות משתנות', async () => {
      const callback = vi.fn();
      const unsub = subscribeGameSettings('find-letter-game', callback);
      callback.mockClear();

      await updateGameSettings('find-letter-game', { cooldownMs: 3000 });
      expect(callback).toHaveBeenCalledWith({ cooldownMs: 3000 });
      unsub();
    });

    it('callback לא נקרא לשינויים של משחקים אחרים', async () => {
      const callback = vi.fn();
      const unsub = subscribeGameSettings('lotto-game', callback);
      callback.mockClear();

      await updateGameSettings('find-letter-game', { cooldownMs: 3000 });
      // לוטו לא השתנה — אסור שהcallback יקרא
      expect(callback).not.toHaveBeenCalled();
      unsub();
    });

    it('unsubscribe מפסיק לקבל עדכונים', async () => {
      const callback = vi.fn();
      const unsub = subscribeGameSettings('lotto-game', callback);
      callback.mockClear();
      unsub();

      await updateGameSettings('lotto-game', { contentProviderId: 'shapes' });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('integration — חיבור עם הפרופיל הפעיל', () => {
    it('הגדרות-משחק נשמרות בפרופיל ולא במפתח localStorage נפרד', async () => {
      await updateGameSettings('find-letter-game', { cooldownMs: 7777 });

      // אין מפתח נפרד למשחק
      expect(localStorage.getItem('find-letter-game-settings')).toBeNull();

      // יש מפתח של הפרופיל
      const profiles = localStorage.getItem('learn-booster-profiles:v1');
      expect(profiles).not.toBeNull();
      expect(profiles).toContain('7777');
    });
  });
});
