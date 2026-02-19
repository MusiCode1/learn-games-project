// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { utils } from '../src';

const { createTimer } = utils;

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('createTimer — configure + start + onDone', () => {
  it('onDone מסתיים אחרי הזמן שהוגדר', async () => {
    const timer = createTimer();
    timer.configure(1000);
    timer.start();

    const done = timer.onDone();
    await vi.advanceTimersByTimeAsync(1100);
    await expect(done).resolves.toBeUndefined();
  });

  it('getTime מחזיר MM:SS לפני תחילה', () => {
    const timer = createTimer();
    timer.configure(65_000);
    expect(timer.getTime()).toBe('01:05');
  });

  it('getTime מחזיר 00:00 אחרי סיום', async () => {
    const timer = createTimer();
    timer.configure(500);
    timer.start();
    await vi.advanceTimersByTimeAsync(600);
    expect(timer.getTime()).toBe('00:00');
  });
});

describe('createTimer — pause / resume', () => {
  it('pause עוצר ו-start ממשיך', async () => {
    const timer = createTimer();
    timer.configure(1000);
    timer.start();

    await vi.advanceTimersByTimeAsync(400);
    timer.pause();
    const timeAfterPause = timer.getTime();

    await vi.advanceTimersByTimeAsync(500);
    const timeAfterWait = timer.getTime();
    expect(timeAfterWait).toBe(timeAfterPause);

    timer.start();
    const done = timer.onDone();
    await vi.advanceTimersByTimeAsync(700);
    await expect(done).resolves.toBeUndefined();
  });
});

describe('createTimer — stop', () => {
  it('stop לפני סיום — onDone מסתיים', async () => {
    const timer = createTimer();
    timer.configure(5000);
    timer.start();

    const done = timer.onDone();
    await vi.advanceTimersByTimeAsync(500);
    timer.stop();

    // stop פותר את ה-promise מיידית
    await expect(done).resolves.toBeUndefined();
  });

  it('getTime מחזיר 00:00 אחרי stop', async () => {
    const timer = createTimer();
    timer.configure(5000);
    timer.start();
    await vi.advanceTimersByTimeAsync(200);
    timer.stop();
    expect(timer.getTime()).toBe('00:00');
  });
});
