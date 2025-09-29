import { writable, readable, type Readable } from 'svelte/store';
import type { TimerController } from '../../types';

/**
 * יוצר אובייקט טיימר עם בקרת הפעלה, השהיה ועצירה.
 * @returns אובייקט בקר טיימר.
 */
export function createTimer(): TimerController {
  const internalStore = writable(0);
  const time: Readable<number> = readable(0, (set) => {
    const unsubscribe = internalStore.subscribe(set);
    return unsubscribe;
  });

  let intervalId: NodeJS.Timeout | undefined;
  let expectedEndTime: number;
  let remainingTimeAtPause = 0;
  let onDone: (() => void) | null = null;
  let duration = 0;

  function tick() {
    const remaining = Math.max(0, expectedEndTime - Date.now());
    internalStore.set(remaining);

    if (remaining === 0) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
      onDone?.();
    }
  }

  function start() {
    if (intervalId) return; // כבר רץ

    expectedEndTime = Date.now() + remainingTimeAtPause;
    intervalId = setInterval(tick, 100);
  }

  function pause() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
      remainingTimeAtPause = Math.max(0, expectedEndTime - Date.now());
    }
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
    remainingTimeAtPause = duration;
    internalStore.set(duration);
    onDone?.(); // פותר את ההבטחה גם בעצירה יזומה
  }

  function configure(durationMs: number): Promise<void> {
    duration = durationMs;
    remainingTimeAtPause = durationMs;
    internalStore.set(durationMs);
    return new Promise((resolve) => {
      onDone = resolve;
    });
  }

  return {
    start,
    pause,
    stop,
    configure,
    time,
  };
}