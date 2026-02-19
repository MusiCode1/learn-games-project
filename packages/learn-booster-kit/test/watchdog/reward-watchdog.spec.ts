// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { watchdog, utils } from '../src';

const { createRewardWatchdog } = watchdog;
const { createTimer } = utils;

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

function makeWatchdog(overrides?: Partial<Parameters<typeof createRewardWatchdog>[0]>) {
  const onTimeout = vi.fn();
  const onLog = vi.fn();
  const wd = createRewardWatchdog({
    isSessionActive: () => true,
    onTimeout,
    onLog,
    now: Date.now,
    ...overrides,
  });
  return { wd, onTimeout, onLog };
}

describe('createRewardWatchdog — יצירה', () => {
  it('מחזיר אובייקט עם start, stop, getRemainingSeconds', () => {
    const { wd } = makeWatchdog();
    expect(typeof wd.start).toBe('function');
    expect(typeof wd.stop).toBe('function');
    expect(typeof wd.getRemainingSeconds).toBe('function');
  });
});

describe('start / stop', () => {
  it('start מחזיר פונקציית stop', () => {
    const { wd } = makeWatchdog();
    const timer = createTimer();
    timer.configure(5000);

    const stopFn = wd.start({ rewardType: 'video', durationMs: 5000, graceMs: 500, timer, sessionId: 1 });
    expect(typeof stopFn).toBe('function');
    wd.stop();
  });

  it('getRemainingSeconds מחזיר null לפני start', () => {
    const { wd } = makeWatchdog();
    expect(wd.getRemainingSeconds()).toBeNull();
  });

  it('stop מפסיק ניטור — onTimeout לא נקרא', async () => {
    const { wd, onTimeout } = makeWatchdog();
    const timer = createTimer();
    timer.configure(500);

    wd.start({ rewardType: 'video', durationMs: 500, graceMs: 100, timer, sessionId: 1 });
    wd.stop();

    await vi.advanceTimersByTimeAsync(700);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});

describe('timeout detection', () => {
  it('onTimeout נקרא אחרי durationMs + graceMs', async () => {
    const { wd, onTimeout } = makeWatchdog();
    const timer = createTimer();
    timer.configure(300);
    timer.start();

    wd.start({ rewardType: 'video', durationMs: 300, graceMs: 100, timer, sessionId: 1 });

    expect(onTimeout).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(450);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    const payload = onTimeout.mock.calls[0][0];
    expect(payload.rewardType).toBe('video');
    expect(payload.durationMs).toBe(300);
    wd.stop();
  });

  it('onTimeout לא נקרא אם isSessionActive מחזיר false', async () => {
    const { wd, onTimeout } = makeWatchdog({ isSessionActive: () => false });
    const timer = createTimer();
    timer.configure(200);
    timer.start();

    wd.start({ rewardType: 'video', durationMs: 200, graceMs: 50, timer, sessionId: 99 });
    await vi.advanceTimersByTimeAsync(300);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
