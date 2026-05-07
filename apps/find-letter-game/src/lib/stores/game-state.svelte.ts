/**
 * ניהול מצב המשחק "איפה האות?"
 *
 * זרימה (state machine):
 *
 *   IDLE
 *     │
 *     ├─ startBoard() ─→ PLAYING (לוח חדש, target ראשון)
 *     │
 *   PLAYING
 *     ├─ click נכון ─→ SUCCESS (צליל הצלחה)
 *     │     │
 *     │     ├─ נשארו עוד כרטיסים בתור ─→ PLAYING (אותו לוח, target חדש)
 *     │     ├─ הלוח התרוקן + הגיע פרס ─→ REWARD (חיזוק) ─→ PLAYING (לוח חדש)
 *     │     └─ הלוח התרוקן + לא הגיע פרס ─→ PLAYING (לוח חדש)
 *     │
 *     └─ click שגוי ─→ COOLDOWN (לוח נעול cooldownMs ms)
 *           │
 *           └─ סיום cooldown ─→ PLAYING (אותו לוח, אותו target)
 *
 * עיקרון: לוח חדש מוגרל רק כשכל הכרטיסים שעליו נתפסו נכון.
 */

import { get } from 'svelte/store';
import { boosterService } from 'learn-booster-kit';
import { pickBoard, type LetterCard } from '../utils/letters';
import { settings, gridCellCount } from './settings.svelte';
import { speak } from '../utils/tts';
import { playSuccess, playError, playWin } from '../utils/sound';

export type GameStatus = 'IDLE' | 'PLAYING' | 'SUCCESS' | 'COOLDOWN' | 'REWARD';

const SUCCESS_MS = 900;
const SHAKE_MS = 600;

/** ברירת מחדל אם ה-config של ה-booster עוד לא נטען */
const DEFAULT_TURNS_PER_REWARD = 3;

/** Fisher-Yates shuffle על מערך — לבחירת סדר השאלות בלוח */
function shuffle<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

class GameState {
	status = $state<GameStatus>('IDLE');
	board = $state<LetterCard[]>([]);
	target = $state<LetterCard | null>(null);
	score = $state(0);
	round = $state(0);
	/** מונה הצלחות מאז החיזוק האחרון — נכלל ב-ProgressWidget */
	winsSinceLastReward = $state(0);
	/** מזהה הכרטיס השגוי שנלחץ לאחרונה — להפעלת אנימציית רעידה */
	shakingId = $state<string | null>(null);
	/** האם בקשת חיזוק כרגע בעיבוד (למניעת לחיצות כפולות) */
	isRewardPending = $state(false);
	/** Timestamp לסיום cooldown (לעונש על טעות) */
	cooldownUntilTs = $state(0);

	/** תור הכרטיסים שעוד לא נשאלו בלוח הנוכחי (Fisher-Yates) */
	private remainingTargets: LetterCard[] = [];

	// =================== DERIVED ===================

	/** האם הלוח כרגע בעונש (cooldown אחרי טעות) */
	get isOnCooldown(): boolean {
		return Date.now() < this.cooldownUntilTs;
	}

	// =================== ACTIONS ===================

	/**
	 * התחלת לוח חדש: מגריל אותיות ובונה תור שאלות לכל כרטיסי הלוח.
	 */
	startBoard(): void {
		const cellCount = gridCellCount(settings.gridSize);
		this.board = pickBoard({
			count: cellCount,
			groups: settings.activeGroups,
			avoidSimilar: settings.avoidSimilar
		});

		// תור השאלות — כל הכרטיסים שעל הלוח, בסדר אקראי
		this.remainingTargets = shuffle(this.board);
		this.advanceToNextTarget(/* isFirstOnBoard */ true);
	}

	/**
	 * מעבר ל-target הבא בתוך אותו לוח. אם התור התרוקן — מתחיל לוח חדש
	 * (אחרי טיפול אופציונלי בחיזוק).
	 */
	private advanceToNextTarget(isFirstOnBoard: boolean): void {
		const next = this.remainingTargets.shift();

		if (!next) {
			// הלוח התרוקן — בודקים אם הגיע פרס לפני שמתחילים לוח חדש
			this.handleBoardCompleted();
			return;
		}

		this.target = next;
		this.round += 1;
		this.shakingId = null;
		this.status = 'PLAYING';

		// הדפסה לדיבוג
		console.log(
			`[find-letter] round ${this.round}: target = "${this.target.display}" (id=${this.target.id}, speak="${this.target.speak}", remaining=${this.remainingTargets.length}/${this.board.length})`
		);

		// הקראה אוטומטית — בלוח חדש משהים מעט יותר כדי שהגרפיקה תספיק להתעדכן
		if (settings.autoSpeakOnNewRound && settings.voiceEnabled) {
			const delay = isFirstOnBoard ? 250 : 150;
			setTimeout(() => this.repeatTarget(), delay);
		}
	}

	/**
	 * השמעה חוזרת של היעד הנוכחי
	 */
	repeatTarget(): void {
		if (!this.target || !settings.voiceEnabled) return;
		speak(this.target.speak);
	}

	/**
	 * טיפול בלחיצה על כרטיס.
	 */
	handleClick(card: LetterCard): void {
		if (this.status !== 'PLAYING' || !this.target) return;
		if (this.isOnCooldown) return;

		if (card.id === this.target.id) {
			this.handleCorrect();
		} else {
			this.handleWrong(card);
		}
	}

	/**
	 * תשובה נכונה — צליל הצלחה, מונים, מעבר ל-target הבא בלוח.
	 */
	private handleCorrect(): void {
		this.score += 1;
		this.winsSinceLastReward += 1;
		this.status = 'SUCCESS';
		playSuccess();

		setTimeout(() => {
			this.advanceToNextTarget(false);
		}, SUCCESS_MS);
	}

	/**
	 * תשובה שגויה — צליל error, רעידה, ועונש (cooldown) שבמהלכו לחיצות נחסמות.
	 */
	private handleWrong(card: LetterCard): void {
		this.shakingId = card.id;
		this.status = 'COOLDOWN';
		this.cooldownUntilTs = Date.now() + settings.cooldownMs;
		playError();

		// סיום אנימציית הרעידה (מפסיקים את ה-class על הכרטיס) — מתרחש לפני סיום העונש
		setTimeout(() => {
			this.shakingId = null;
		}, SHAKE_MS);

		// סיום העונש: חזרה ל-PLAYING על אותו target
		setTimeout(() => {
			if (this.status === 'COOLDOWN') {
				this.status = 'PLAYING';
			}
		}, settings.cooldownMs);
	}

	/**
	 * הלוח התרוקן (כל הכרטיסים נשאלו ונענו נכון).
	 * בודק אם הגיע פרס; אם כן — מפעיל reward; אחרת — מתחיל לוח חדש מיד.
	 */
	private handleBoardCompleted(): void {
		// בדיקת פרס לפי ה-config של booster
		let turnsForReward = DEFAULT_TURNS_PER_REWARD;
		try {
			const config = get(boosterService.config);
			if (config?.turnsPerReward) turnsForReward = config.turnsPerReward;
		} catch {
			// booster עוד לא אותחל — מתעלמים
		}

		if (settings.boosterEnabled && this.winsSinceLastReward >= turnsForReward) {
			this.triggerReward();
		} else {
			this.startBoard();
		}
	}

	/**
	 * הפעלת חיזוק (סרטון/אנימציה) ואז המשך ללוח חדש.
	 */
	private async triggerReward(): Promise<void> {
		if (this.isRewardPending) return;
		this.isRewardPending = true;
		this.status = 'REWARD';
		playWin();

		try {
			await boosterService.triggerReward();
		} catch (e) {
			console.error('[booster] triggerReward failed:', e);
		} finally {
			this.winsSinceLastReward = 0;
			this.isRewardPending = false;
			this.startBoard();
		}
	}

	/**
	 * איפוס מלא של המשחק (כפתור "משחק חדש")
	 */
	resetGame(): void {
		this.score = 0;
		this.round = 0;
		this.winsSinceLastReward = 0;
		this.cooldownUntilTs = 0;
		this.status = 'IDLE';
		this.board = [];
		this.target = null;
		this.shakingId = null;
		this.isRewardPending = false;
		this.remainingTargets = [];
		this.startBoard();
	}
}

export const gameState = new GameState();
