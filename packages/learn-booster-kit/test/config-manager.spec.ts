// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deepMerge } from '../src/lib/config-manager';

describe('deepMerge', () => {
  it('מיזוג אובייקטים שטוחים', () => {
    const target = { a: 1, b: 2 };
    const result = deepMerge(target, { b: 99, c: 3 } as never);
    expect(result).toMatchObject({ a: 1, b: 99, c: 3 });
  });

  it('מיזוג אובייקטים מקוננים (nested)', () => {
    const target = { outer: { x: 1, y: 2 } };
    const result = deepMerge(target, { outer: { y: 99 } } as never);
    expect(result.outer).toMatchObject({ x: 1, y: 99 });
  });

  it('source לא דורס שדות שלא מוגדרים ב-source', () => {
    const target = { a: 1, b: 2, c: 3 };
    const result = deepMerge(target, { a: 10 } as never);
    expect(result.b).toBe(2);
    expect(result.c).toBe(3);
  });

  it('מערכים ב-source מבצעים מיזוג element-wise (לא החלפה מלאה)', () => {
    // deepMerge מתייחס למערכים כאובייקטים - מחליף אינדקסים ספציפיים
    // source=[99] על target=[1,2,3] → [99,2,3]
    const target = { items: [1, 2, 3] };
    const result = deepMerge(target, { items: [99] } as never);
    expect(result.items).toEqual([99, 2, 3]);
  });

  it('null ב-source דורס ערך ב-target', () => {
    const target = { a: 'hello' };
    const result = deepMerge(target, { a: null } as never);
    expect(result.a).toBeNull();
  });
});

describe('saveConfigToStorage / loadConfigFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('saveConfigToStorage שומר ב-localStorage', async () => {
    const { saveConfigToStorage } = await import('../src/lib/config-manager');
    const result = saveConfigToStorage();
    expect(result).toBe(true);
    expect(localStorage.getItem('gingim-booster-config')).not.toBeNull();
  });

  it('loadConfigFromStorage טוען ממה שנשמר', async () => {
    const { saveConfigToStorage, loadConfigFromStorage } = await import('../src/lib/config-manager');
    saveConfigToStorage();
    const loaded = loadConfigFromStorage();
    expect(loaded).toBe(true);
  });

  it('loadConfigFromStorage מחזיר false אם אין כלום ב-localStorage', async () => {
    const { loadConfigFromStorage } = await import('../src/lib/config-manager');
    localStorage.clear();
    const result = loadConfigFromStorage();
    expect(result).toBe(false);
  });
});
