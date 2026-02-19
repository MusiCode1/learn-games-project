import { get, type Writable } from 'svelte/store';
import type { Config, TimerController } from '../../types';

const DEFAULT_TIMER_STALL_MS = 2000;

export type RewardWatchdogStartArgs = {
    rewardType: Config['rewardType'];
    durationMs: number;
    graceMs: number;
    timer: TimerController;
    sessionId: number;
    modalHasHidden?: Writable<boolean>;
    getExtraStatus?: () => Record<string, unknown>;
};

export type RewardWatchdogTimeoutPayload = {
    rewardType: Config['rewardType'];
    durationMs: number;
    graceMs: number;
    elapsedMs: number;
    timerRemainingMs: number;
    lastTimerTickAgeMs: number | null;
    modalHasHidden?: boolean;
    lastModalChangeAgeMs: number | null;
    suspectedCause: string[];
    extraStatus: Record<string, unknown>;
};

export type RewardWatchdog = {
    start: (args: RewardWatchdogStartArgs) => () => void;
    stop: () => void;
    getRemainingSeconds: () => number | null;
    logRemainingSeconds: () => number | null;
};

type CreateRewardWatchdogArgs = {
    isSessionActive: (sessionId: number) => boolean;
    onTimeout: (payload: RewardWatchdogTimeoutPayload) => void;
    onLog: (message: string, payload?: Record<string, unknown>) => void;
    now?: () => number;
    timerStallMs?: number;
};

type ActiveWatchdogState = {
    sessionId: number;
    rewardType: Config['rewardType'];
    timer: TimerController;
    startedAt: number;
    timerUnsub?: () => void;
    modalUnsub?: () => void;
    timeoutId?: ReturnType<typeof setTimeout>;
};

export function createRewardWatchdog(args: CreateRewardWatchdogArgs): RewardWatchdog {
    const now = args.now ?? Date.now;
    const timerStallMs = args.timerStallMs ?? DEFAULT_TIMER_STALL_MS;

    let activeState: ActiveWatchdogState | null = null;

    const stop = () => {
        if (!activeState) return;
        if (activeState.timeoutId) clearTimeout(activeState.timeoutId);
        activeState.timerUnsub?.();
        activeState.modalUnsub?.();
        activeState = null;
    };

    const start = (startArgs: RewardWatchdogStartArgs) => {
        stop();

        const startedAt = now();
        const deadlineAt = startedAt + startArgs.durationMs + startArgs.graceMs;
        let lastTimerMs = get(startArgs.timer.time);
        let lastTimerTickAt: number | null = null;
        const initialTimerMs = lastTimerMs;

        let lastModalHidden = startArgs.modalHasHidden ? get(startArgs.modalHasHidden) : undefined;
        let lastModalChangeAt = startArgs.modalHasHidden ? startedAt : undefined;

        const state: ActiveWatchdogState = {
            sessionId: startArgs.sessionId,
            rewardType: startArgs.rewardType,
            timer: startArgs.timer,
            startedAt
        };

        state.timerUnsub = startArgs.timer.time.subscribe((ms) => {
            if (ms !== lastTimerMs) {
                lastTimerMs = ms;
                lastTimerTickAt = now();
            }
        });

        state.modalUnsub = startArgs.modalHasHidden
            ? startArgs.modalHasHidden.subscribe((hidden) => {
                if (hidden !== lastModalHidden) {
                    lastModalHidden = hidden;
                    lastModalChangeAt = now();
                }
            })
            : undefined;

        state.timeoutId = setTimeout(() => {
            if (!args.isSessionActive(startArgs.sessionId)) return;

            const currentActive = activeState;
            if (!currentActive || currentActive.sessionId !== startArgs.sessionId) return;

            const currentTime = now();
            const elapsedMs = currentTime - startedAt;
            const timerRemainingMs = get(startArgs.timer.time);
            const lastTimerTickAgeMs = lastTimerTickAt ? currentTime - lastTimerTickAt : null;
            const lastModalChangeAgeMs = lastModalChangeAt ? currentTime - lastModalChangeAt : null;

            const suspectedCause: string[] = [];

            if (timerRemainingMs === initialTimerMs && !lastTimerTickAt) {
                suspectedCause.push('timer did not start');
            } else if (timerRemainingMs > 0 && lastTimerTickAgeMs !== null && lastTimerTickAgeMs > timerStallMs) {
                suspectedCause.push('timer stalled/paused');
            }

            if (startArgs.modalHasHidden && lastModalHidden === false && timerRemainingMs <= 0) {
                suspectedCause.push('modal not closed after timer done');
            }

            const extraStatus = startArgs.getExtraStatus?.() ?? {};
            if (startArgs.rewardType === 'app') {
                const isInForeground =
                    typeof extraStatus['isInForeground'] === 'boolean'
                        ? (extraStatus['isInForeground'] as boolean)
                        : undefined;
                if (isInForeground === false || typeof isInForeground === 'undefined') {
                    suspectedCause.push('app not returned to Fully');
                }
            }

            args.onTimeout({
                rewardType: startArgs.rewardType,
                durationMs: startArgs.durationMs,
                graceMs: startArgs.graceMs,
                elapsedMs,
                timerRemainingMs,
                lastTimerTickAgeMs,
                modalHasHidden: lastModalHidden,
                lastModalChangeAgeMs,
                suspectedCause,
                extraStatus
            });
        }, Math.max(0, deadlineAt - startedAt));

        activeState = state;
        return stop;
    };

    const getRemainingSeconds = () => {
        if (!activeState) return null;
        return Math.max(0, Math.ceil(get(activeState.timer.time) / 1000));
    };

    const logRemainingSeconds = () => {
        const remainingSeconds = getRemainingSeconds();
        if (remainingSeconds === null) {
            args.onLog('Watchdog remaining time requested but no active session');
            return null;
        }

        args.onLog('Watchdog remaining seconds', {
            remainingSeconds,
            rewardType: activeState?.rewardType,
            sessionId: activeState?.sessionId,
            elapsedMs: activeState ? now() - activeState.startedAt : undefined
        });

        return remainingSeconds;
    };

    return {
        start,
        stop,
        getRemainingSeconds,
        logRemainingSeconds
    };
}
