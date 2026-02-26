/**
 * BroadcastChannel wrapper עם מנגנון ACK + retry לתקשורת בין הדף הראשי לאוברליי.
 */

const CHANNEL_NAME = 'overlay-timer';
const ACK_TIMEOUT_MS = 200;
const MAX_RETRIES = 10;
const LOG_PREFIX = '[overlay-channel]';

// ─── טיפוסים ───────────────────────────────────────────

export interface TimerCommand {
  type: 'start' | 'stop';
  durationMs: number;
  startedAtMs: number;
}

export interface TimerAck {
  type: 'ack';
}

export type OverlayMessage = TimerCommand | TimerAck;

// ─── ערוץ ───────────────────────────────────────────────

export function createOverlayChannel(): BroadcastChannel {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    console.info(`${LOG_PREFIX} Channel created: "${CHANNEL_NAME}"`);
    return channel;
  } catch (e) {
    console.error(`${LOG_PREFIX} Failed to create BroadcastChannel:`, e);
    throw e;
  }
}

// ─── צד שולח (boosterService) ───────────────────────────

/**
 * שולח פקודה דרך BroadcastChannel וממתין ל-ACK.
 * אם לא מתקבל ACK תוך ACK_TIMEOUT_MS — שולח שוב, עד MAX_RETRIES.
 */
export function sendCommand(
  channel: BroadcastChannel,
  command: TimerCommand
): Promise<boolean> {
  return new Promise((resolve) => {
    let attempt = 0;
    let settled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    console.info(`${LOG_PREFIX} Sending command:`, command.type,
      command.type === 'start' ? `(${command.durationMs}ms)` : '');

    const onMessage = (event: MessageEvent<OverlayMessage>) => {
      if (event.data?.type === 'ack') {
        settled = true;
        console.info(`${LOG_PREFIX} ACK received after ${attempt} attempt(s)`);
        cleanup();
        resolve(true);
      }
    };

    const cleanup = () => {
      channel.removeEventListener('message', onMessage);
      if (retryTimer) clearTimeout(retryTimer);
    };

    const trySend = () => {
      if (settled) return;
      if (attempt >= MAX_RETRIES) {
        console.warn(`${LOG_PREFIX} No ACK after ${MAX_RETRIES} retries for "${command.type}" — overlay may not be loaded`);
        cleanup();
        resolve(false);
        return;
      }
      attempt++;
      try {
        channel.postMessage(command);
      } catch (e) {
        console.error(`${LOG_PREFIX} postMessage failed:`, e);
        cleanup();
        resolve(false);
        return;
      }
      retryTimer = setTimeout(trySend, ACK_TIMEOUT_MS);
    };

    channel.addEventListener('message', onMessage);
    trySend();
  });
}

// ─── צד מאזין (overlay) ─────────────────────────────────

/**
 * מאזין לפקודות טיימר ושולח ACK אוטומטית.
 * @returns פונקציית cleanup להסרת ה-listener
 */
export function listenForCommands(
  channel: BroadcastChannel,
  onCommand: (cmd: TimerCommand) => void
): () => void {
  console.info(`${LOG_PREFIX} Listening for commands...`);

  const onMessage = (event: MessageEvent<OverlayMessage>) => {
    const data = event.data;
    if (!data || typeof data.type !== 'string') {
      console.warn(`${LOG_PREFIX} Received invalid message:`, data);
      return;
    }
    if (data.type === 'start' || data.type === 'stop') {
      console.info(`${LOG_PREFIX} Received command: "${data.type}"`,
        data.type === 'start' ? `duration=${data.durationMs}ms` : '');
      try {
        channel.postMessage({ type: 'ack' } satisfies TimerAck);
      } catch (e) {
        console.error(`${LOG_PREFIX} Failed to send ACK:`, e);
      }
      onCommand(data);
    }
  };

  channel.addEventListener('message', onMessage);

  channel.addEventListener('messageerror', (e) => {
    console.error(`${LOG_PREFIX} Message deserialization error:`, e);
  });

  return () => {
    console.info(`${LOG_PREFIX} Stopped listening`);
    channel.removeEventListener('message', onMessage);
  };
}
