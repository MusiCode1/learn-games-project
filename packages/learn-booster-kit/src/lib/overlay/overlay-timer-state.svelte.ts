/**
 * State ריאקטיבי לאוברליי הטיימר — מאזין ל-BroadcastChannel ומחשב זמן נותר.
 */

import {
  createOverlayChannel,
  listenForCommands,
  type TimerCommand,
} from './overlay-channel';

const TICK_INTERVAL_MS = 100;
const LOG_PREFIX = '[overlay-timer-state]';

export function createOverlayTimerState() {
  let durationMs = $state(0);
  let startedAtMs = $state(0);
  let active = $state(false);
  let now = $state(Date.now());
  let error = $state<string | null>(null);

  let tickIntervalId: ReturnType<typeof setInterval> | undefined;
  let cleanupListener: (() => void) | undefined;
  let channel: BroadcastChannel | undefined;

  // ─── ערכים נגזרים ────────────────────────────────────

  const remainingMs = $derived(
    active ? Math.max(0, durationMs - (now - startedAtMs)) : 0
  );

  const remainingSeconds = $derived(Math.ceil(remainingMs / 1000));

  const progress = $derived(
    active && durationMs > 0 ? (remainingMs / durationMs) * 100 : 0
  );

  const isFinished = $derived(active && remainingMs <= 0);

  const color = $derived(
    remainingSeconds > 30
      ? '#22c55e' // ירוק
      : remainingSeconds > 10
        ? '#eab308' // צהוב
        : '#ef4444' // אדום
  );

  // ─── טיפול בפקודות ───────────────────────────────────

  function handleCommand(cmd: TimerCommand) {
    if (cmd.type === 'start') {
      if (cmd.durationMs <= 0) {
        console.warn(`${LOG_PREFIX} Ignoring start with invalid duration: ${cmd.durationMs}`);
        return;
      }
      if (!cmd.startedAtMs || cmd.startedAtMs > Date.now() + 1000) {
        console.warn(`${LOG_PREFIX} Suspicious startedAtMs: ${cmd.startedAtMs} (now=${Date.now()})`);
      }
      durationMs = cmd.durationMs;
      startedAtMs = cmd.startedAtMs;
      active = true;
      now = Date.now();
      error = null;
      console.info(`${LOG_PREFIX} Timer started: ${cmd.durationMs}ms`);
    } else {
      active = false;
      console.info(`${LOG_PREFIX} Timer stopped`);
    }
  }

  // ─── lifecycle ────────────────────────────────────────

  function start() {
    try {
      channel = createOverlayChannel();
      cleanupListener = listenForCommands(channel, handleCommand);

      tickIntervalId = setInterval(() => {
        now = Date.now();
      }, TICK_INTERVAL_MS);

      console.info(`${LOG_PREFIX} Overlay timer state initialized`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      error = msg;
      console.error(`${LOG_PREFIX} Failed to initialize:`, msg);
    }
  }

  function destroy() {
    cleanupListener?.();
    if (tickIntervalId) clearInterval(tickIntervalId);
    channel?.close();
    console.info(`${LOG_PREFIX} Destroyed`);
  }

  return {
    get isActive() {
      return active;
    },
    get remainingMs() {
      return remainingMs;
    },
    get remainingSeconds() {
      return remainingSeconds;
    },
    get progress() {
      return progress;
    },
    get isFinished() {
      return isFinished;
    },
    get color() {
      return color;
    },
    get error() {
      return error;
    },
    start,
    destroy,
  };
}
