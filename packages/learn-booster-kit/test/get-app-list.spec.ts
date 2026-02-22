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
    const mockApps = [
      { packageName: 'com.example.app1', label: 'App1' },
      { packageName: 'com.example.app2', label: 'App2' },
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
