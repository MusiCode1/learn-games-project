// @vitest-environment jsdom
/**
 * בדיקות מיגרציית localStorage — profile-manager
 *
 * לפני רפקטורינג: המפתח הוא "gingim-booster-profiles:v1"
 * אחרי שלב 7 ברפקטורינג: המפתח יהיה "learn-booster-profiles:v1"
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDefaultConfig } from '../src/lib/default-config';

const OLD_KEY = 'gingim-booster-profiles:v1';
const NEW_KEY = 'learn-booster-profiles:v1';
const baseConfig = getDefaultConfig();

type PM = typeof import('../src/lib/profile-manager');
let pm: PM;

beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  pm = await import('../src/lib/profile-manager');
});

describe('profile-manager — מפתח localStorage נוכחי (לפני רפקטורינג)', () => {
  it('שומר תחת המפתח הישן', async () => {
    await pm.initializeProfiles(baseConfig);
    expect(localStorage.getItem(OLD_KEY)).not.toBeNull();
  });

  it('טוען פרופילים מהמפתח הישן', async () => {
    const s1 = await pm.initializeProfiles(baseConfig);
    pm.createProfile({ name: 'Saved', config: baseConfig });

    vi.resetModules();
    pm = await import('../src/lib/profile-manager');
    const s2 = await pm.initializeProfiles(baseConfig);
    expect(s2.order.length).toBeGreaterThanOrEqual(s1.order.length);
  });

  it('אין שמירה תחת המפתח החדש לפני הרפקטורינג', async () => {
    await pm.initializeProfiles(baseConfig);
    expect(localStorage.getItem(NEW_KEY)).toBeNull();
  });
});

describe('profile-manager — מיגרציה (אחרי שלב 7 ברפקטורינג)', () => {
  it.todo('מפתח ישן קיים → פרופילים מועתקים למפתח חדש, הישן נמחק');
  it.todo('מפתח חדש כבר קיים → לא דורסים');
  it.todo('שני המפתחות קיימים → החדש גובר');
  it.todo('לאחר מיגרציה: שמירה הולכת למפתח החדש');
});
