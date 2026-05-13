/**
 * לוגיקה טהורה לחישוב מצב Cooldown — ניתנת לבדיקה ללא DOM.
 */

export interface CooldownView {
	/** זמן שנותר במילישניות (לא שלילי) */
	remainingMs: number;
	/** שניות שנותרות — ceil (לדוגמה 400ms → 1) */
	remainingSec: number;
	/** התקדמות מ-1 (התחלה) ל-0 (סוף) */
	progress: number;
	/** האם ה-cooldown פעיל כרגע */
	isActive: boolean;
}

/**
 * מחשב את מצב ה-cooldown ברגע נתון.
 * פונקציה טהורה — ניתנת לבדיקה בלי DOM.
 * @param untilTs    - timestamp סיום ה-cooldown (מילישניות)
 * @param nowTs      - timestamp רגע זה
 * @param durationMs - משך ה-cooldown הכולל (מילישניות)
 */
export function computeCooldownView(
	untilTs: number,
	nowTs: number,
	durationMs: number
): CooldownView {
	const remainingMs = Math.max(0, untilTs - nowTs);
	const isActive = remainingMs > 0;
	// ceil: 400ms → 1, 1000ms → 1, 1001ms → 2, 0ms → 0
	const remainingSec = Math.ceil(remainingMs / 1000);
	// התקדמות: 1 בתחילת ה-cooldown, 0 בסופו. מגן מפני חלוקה באפס.
	const progress = durationMs > 0 ? remainingMs / durationMs : 0;

	return {
		remainingMs,
		remainingSec,
		progress,
		isActive
	};
}
