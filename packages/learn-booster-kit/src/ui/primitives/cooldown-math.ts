/**
 * מחשב את אחוז ההתקדמות של cooldown בין 0 (התחלה) ל-1 (סיום).
 *
 * @param now - זמן נוכחי במילישניות
 * @param untilTs - timestamp סיום ה-cooldown
 * @param durationMs - משך ה-cooldown הכולל
 * @returns מספר בין 0 ל-1
 */
export function cooldownProgress(now: number, untilTs: number, durationMs: number): number {
	if (durationMs <= 0) return 1;
	const remaining = Math.max(0, untilTs - now);
	const elapsed = durationMs - remaining;
	return Math.min(1, Math.max(0, elapsed / durationMs));
}
