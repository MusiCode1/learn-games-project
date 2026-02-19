// @vitest-environment jsdom
/**
 * Snapshot של ה-API הציבורי מ-src/index.ts
 * קריטי לפאזה 2: מוודא שאחרי העברת קבצים ה-API הציבורי לא השתנה.
 */
import { describe, it, expect, vi } from 'vitest';

// mock קומפוננטות Svelte (לא נבדקות כאן)
vi.mock('../src/ui/components/VideoDialog.svelte', () => ({ default: {} }));
vi.mock('../src/ui/components/LoadingSpinner.svelte', () => ({ default: {} }));
vi.mock('../src/ui/components/Modal.svelte', () => ({ default: {} }));
vi.mock('../src/ui/VideoMain.svelte', () => ({ default: {} }));
vi.mock('../src/ui/SiteBoosterMain.svelte', () => ({ default: {} }));
vi.mock('../src/ui/components/Settings.svelte', () => ({ default: {} }));
vi.mock('../src/ui/components/SettingsForm.svelte', () => ({ default: {} }));
vi.mock('../src/ui/BoosterContainer.svelte', () => ({ default: {} }));
vi.mock('../src/ui/ProgressWidget.svelte', () => ({ default: {} }));
vi.mock('../src/ui/AdminGate.svelte', () => ({ default: {} }));

const publicApi = await import('../src/index');

describe('barrel exports — API ציבורי', () => {
  describe('קומפוננטות Svelte', () => {
    it('VideoDialog מיוצא', () => { expect(publicApi.VideoDialog).toBeDefined(); });
    it('LoadingSpinner מיוצא', () => { expect(publicApi.LoadingSpinner).toBeDefined(); });
    it('Modal מיוצא', () => { expect(publicApi.Modal).toBeDefined(); });
    it('VideoMain מיוצא', () => { expect(publicApi.VideoMain).toBeDefined(); });
    it('SiteBoosterMain מיוצא', () => { expect(publicApi.SiteBoosterMain).toBeDefined(); });
    it('Settings מיוצא', () => { expect(publicApi.Settings).toBeDefined(); });
    it('SettingsForm מיוצא', () => { expect(publicApi.SettingsForm).toBeDefined(); });
    it('BoosterContainer מיוצא', () => { expect(publicApi.BoosterContainer).toBeDefined(); });
    it('ProgressWidget מיוצא', () => { expect(publicApi.ProgressWidget).toBeDefined(); });
    it('AdminGate מיוצא', () => { expect(publicApi.AdminGate).toBeDefined(); });
  });

  describe('פונקציות ושירותים', () => {
    it('boosterService מיוצא', () => { expect(publicApi.boosterService).toBeDefined(); });
    it('getAppsList מיוצא', () => { expect(typeof publicApi.getAppsList).toBe('function'); });
    it('isFullyKiosk מיוצא', () => { expect(typeof publicApi.isFullyKiosk).toBe('function'); });
    it('deepMerge מיוצא (מ-config-manager)', () => { expect(typeof publicApi.deepMerge).toBe('function'); });
    it('initializeConfig מיוצא', () => { expect(typeof publicApi.initializeConfig).toBe('function'); });
    it('updateConfig מיוצא', () => { expect(typeof publicApi.updateConfig).toBe('function'); });
    it('resetConfig מיוצא', () => { expect(typeof publicApi.resetConfig).toBe('function'); });
    it('addConfigListener מיוצא', () => { expect(typeof publicApi.addConfigListener).toBe('function'); });
    it('configStore מיוצא', () => { expect(publicApi.configStore).toBeDefined(); });
  });
});
