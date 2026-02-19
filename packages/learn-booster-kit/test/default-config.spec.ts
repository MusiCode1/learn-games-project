import { describe, it, expect } from 'vitest';
import { defaultConfig } from './src';

const { getDefaultConfig } = defaultConfig;

describe('getDefaultConfig', () => {
  it('מחזיר אובייקט עם כל השדות הנדרשים', () => {
    const config = getDefaultConfig();
    expect(config).toMatchObject({
      appVersion: expect.any(String),
      rewardType: expect.any(String),
      rewardDisplayDurationMs: expect.any(Number),
      turnsPerReward: expect.any(Number),
      envVals: expect.any(Object),
      notifications: expect.any(Object),
      video: expect.any(Object),
      app: expect.any(Object),
      booster: expect.any(Object),
      system: expect.any(Object),
    });
  });

  it('rewardDisplayDurationMs גדול מ-0', () => {
    expect(getDefaultConfig().rewardDisplayDurationMs).toBeGreaterThan(0);
  });

  it('turnsPerReward גדול מ-0', () => {
    expect(getDefaultConfig().turnsPerReward).toBeGreaterThan(0);
  });

  it('video.videos הוא מערך ריק בברירת מחדל', () => {
    expect(getDefaultConfig().video.videos).toEqual([]);
  });

  it('booster.siteUrl מכיל gingim.net (לפני רפקטורינג)', () => {
    const url = getDefaultConfig().booster.siteUrl;
    expect(typeof url).toBe('string');
    // לפני הרפקטורינג: URL מ-gingim.net. אחרי: ריק
    expect(url).toMatch(/gingim\.net|^$/);
  });

  it('מחזיר עותק חדש בכל קריאה (לא reference)', () => {
    const a = getDefaultConfig();
    const b = getDefaultConfig();
    expect(a).not.toBe(b);
    a.rewardType = 'app';
    expect(b.rewardType).not.toBe('app');
  });

  it('envVals.hostname ברירת מחדל היא "localhost"', () => {
    expect(getDefaultConfig().envVals.hostname).toBe('localhost');
  });

  it('system.enableHideModalButton הוא true בברירת מחדל', () => {
    expect(getDefaultConfig().system.enableHideModalButton).toBe(true);
  });
});
