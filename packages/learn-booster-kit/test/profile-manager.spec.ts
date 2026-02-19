// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDefaultConfig } from '../src/lib/default-config';

// profile-manager שומר state ברמת המודול (isInitialized).
// כל test מקבל instance טרי על-ידי resetModules + dynamic import.
type PM = typeof import('../src/lib/profile-manager');

let pm: PM;
const baseConfig = getDefaultConfig();

beforeEach(async () => {
  localStorage.clear();
  vi.resetModules();
  pm = await import('../src/lib/profile-manager');
});

describe('initializeProfiles', () => {
  it('יוצר פרופיל ברירת מחדל כשאין שום דבר ב-localStorage', async () => {
    const state = await pm.initializeProfiles(baseConfig);
    expect(state.order).toHaveLength(1);
    expect(state.activeProfileId).toBeTruthy();
  });

  it('קריאה חוזרת מחזירה אותו state (idempotent)', async () => {
    const s1 = await pm.initializeProfiles(baseConfig);
    const s2 = await pm.initializeProfiles(baseConfig);
    expect(s2.activeProfileId).toBe(s1.activeProfileId);
  });

  it('שומר ב-localStorage עם המפתח הנכון', async () => {
    await pm.initializeProfiles(baseConfig);
    expect(localStorage.getItem('gingim-booster-profiles:v1')).not.toBeNull();
  });
});

describe('createProfile', () => {
  beforeEach(async () => { await pm.initializeProfiles(baseConfig); });

  it('יוצר פרופיל עם ID ייחודי', () => {
    const p = pm.createProfile({ name: 'Test', config: baseConfig });
    expect(p.id).toBeTruthy();
    expect(p.name).toBe('Test');
  });

  it('שני פרופילים מקבלים ID שונה', () => {
    const a = pm.createProfile({ name: 'A', config: baseConfig });
    const b = pm.createProfile({ name: 'B', config: baseConfig });
    expect(a.id).not.toBe(b.id);
  });

  it('הפרופיל מופיע ב-state', () => {
    const p = pm.createProfile({ name: 'X', config: baseConfig });
    const state = pm.getProfilesState();
    expect(state.order).toContain(p.id);
  });
});

describe('getActiveProfile / setActiveProfile', () => {
  beforeEach(async () => { await pm.initializeProfiles(baseConfig); });

  it('getActiveProfile מחזיר את הפרופיל הפעיל', () => {
    const active = pm.getActiveProfile();
    expect(active).toBeDefined();
    expect(active!.id).toBe(pm.getProfilesState().activeProfileId);
  });

  it('setActiveProfile מחליף את הפרופיל הפעיל', () => {
    const p = pm.createProfile({ name: 'New', config: baseConfig });
    pm.setActiveProfile(p.id);
    expect(pm.getActiveProfile()!.id).toBe(p.id);
  });

  it('setActiveProfile על ID לא קיים זורק שגיאה', () => {
    expect(() => pm.setActiveProfile('nonexistent')).toThrow();
  });
});

describe('updateProfile', () => {
  beforeEach(async () => { await pm.initializeProfiles(baseConfig); });

  it('מעדכן שם פרופיל', () => {
    const p = pm.createProfile({ name: 'Old Name', config: baseConfig });
    const updated = pm.updateProfile(p.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
  });

  it('מעדכן config של פרופיל', () => {
    const p = pm.createProfile({ name: 'P', config: baseConfig });
    const newConfig = { ...baseConfig, turnsPerReward: 99 };
    const updated = pm.updateProfile(p.id, { config: newConfig });
    expect(updated.config.turnsPerReward).toBe(99);
  });
});

describe('deleteProfile', () => {
  beforeEach(async () => { await pm.initializeProfiles(baseConfig); });

  it('מוחק פרופיל לא-פעיל', () => {
    const p = pm.createProfile({ name: 'ToDelete', config: baseConfig });
    pm.deleteProfile(p.id);
    expect(pm.getProfilesState().order).not.toContain(p.id);
  });

  it('לא ניתן למחוק את הפרופיל הפעיל', () => {
    const activeId = pm.getActiveProfile()!.id;
    expect(() => pm.deleteProfile(activeId)).toThrow();
  });
});

describe('exportProfiles / importProfiles', () => {
  beforeEach(async () => { await pm.initializeProfiles(baseConfig); });

  it('roundtrip: export -> import משחזר את הפרופילים', () => {
    pm.createProfile({ name: 'Extra', config: baseConfig });
    const exported = pm.exportProfiles();
    expect(exported.profiles).toHaveLength(2);

    const imported = pm.importProfiles(exported, { replace: true });
    expect(imported.order).toHaveLength(2);
  });

  it('importProfiles עם replace:true מחליף את כל הפרופילים', () => {
    const exported = pm.exportProfiles();
    pm.createProfile({ name: 'ExtraAfterExport', config: baseConfig });

    const result = pm.importProfiles(exported, { replace: true });
    expect(result.order).toHaveLength(exported.profiles.length);
  });

  it('importProfiles עם schemaVersion שגוי זורק שגיאה', () => {
    const exported = pm.exportProfiles();
    expect(() => pm.importProfiles({ ...exported, schemaVersion: 999 })).toThrow();
  });
});
