import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sleep } from './src';

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('מחזיר Promise', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
    vi.runAllTimers();
  });

  it('נפתר אחרי הזמן הנכון', async () => {
    let resolved = false;
    sleep(500).then(() => { resolved = true; });

    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it('נפתר מיד עבור 0ms', async () => {
    let resolved = false;
    sleep(0).then(() => { resolved = true; });
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(true);
  });
});
