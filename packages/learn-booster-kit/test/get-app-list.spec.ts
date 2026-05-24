// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// get-app-list יש לו side-effects ברמת המודול (IIFE + addConfigListener).
// כל test מקבל instance טרי.
beforeEach(() => {
  vi.resetModules();
});

describe('getAppsList — not in Fully Kiosk', () => {
  it('זורק שגיאה כשלא ב-Fully Kiosk ולא demo mode', async () => {
    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({
      isFullyKiosk: vi.fn().mockReturnValue(false),
      getFileList: vi.fn(),
    }));
    vi.doMock('../src/lib/config/config-manager', () => ({
      getAllConfig: vi.fn().mockReturnValue({ environmentMode: 'production' }),
      addConfigListener: vi.fn().mockReturnValue(() => {}),
    }));
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));

    const { getAppsList } = await import('../src/lib/fully-kiosk/get-app-list');
    await expect(getAppsList()).rejects.toThrow('Not in Fully Kiosk environment.');
  });
});

describe('getAppsList — Fully Kiosk', () => {
  it('מחזיר רשימת אפליקציות מ-Fully Kiosk', async () => {
    // ה-mock objects חייבים לכלול את כל השדות של AppListItemSchema:
    // { icon, label, package, version, versionCode } — לא packageName!
    const mockApps = [
      { icon: 'data:image/png;base64,AAAA', label: 'App1', package: 'com.example.app1', version: '1.0.0', versionCode: 1 },
      { icon: 'data:image/png;base64,BBBB', label: 'App2', package: 'com.example.app2', version: '2.0.0', versionCode: 2 },
    ];

    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({
      isFullyKiosk: vi.fn().mockReturnValue(true),
      getFileList: vi.fn(),
    }));
    vi.doMock('../src/lib/config/config-manager', () => ({
      getAllConfig: vi.fn().mockReturnValue({ environmentMode: 'production' }),
      addConfigListener: vi.fn().mockReturnValue(() => {}),
    }));
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));

    vi.stubGlobal('window', {
      ...window,
      fully: {
        getBooleanSetting: vi.fn().mockReturnValue('true'),
        getStringRawSetting: vi.fn().mockReturnValue('admin-password'),
      },
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockApps),
    }));

    const { getAppsList } = await import('../src/lib/fully-kiosk/get-app-list');
    const result = await getAppsList();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(mockApps);
  });

  it('זורק שגיאה אם remote admin מושבת', async () => {
    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({
      isFullyKiosk: vi.fn().mockReturnValue(true),
      getFileList: vi.fn(),
    }));
    vi.doMock('../src/lib/config/config-manager', () => ({
      getAllConfig: vi.fn().mockReturnValue({ environmentMode: 'production' }),
      addConfigListener: vi.fn().mockReturnValue(() => {}),
    }));
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));

    vi.stubGlobal('window', {
      ...window,
      fully: {
        getBooleanSetting: vi.fn().mockReturnValue('false'),
        getStringRawSetting: vi.fn(),
      },
    });

    const { getAppsList } = await import('../src/lib/fully-kiosk/get-app-list');
    await expect(getAppsList()).rejects.toThrow('remote admin is not enabled');
  });
});
