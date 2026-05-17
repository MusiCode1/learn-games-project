/**
 * ניהול מצב המשחק "איפה האות?"
 *
 * שני מונים שמתעדכנים בכל לחיצה נכונה:
 *
 *   1. `correctInCurrentSet` — מספר התשובות הנכונות בסבב הנוכחי. מתאפס
 *      רק אחרי פרס. ProgressWidget מציג אותו מתוך
 *      `settings.totalQuestionsPerSet` (= boardsPerSet × questionsPerBoard).
 *
 *   2. `questionsAnsweredInBoard` — כמה שאלות נענו בלוח הנוכחי. כשמגיע
 *      ל-`settings.effectiveQuestionsPerBoard` — הלוח מתחלף ללוח חדש,
 *      וגם המונה `boardsCompletedInSet` מתקדם ב-1.
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
 *     │     ├─ נשארו עוד שאלות בלוח ─→ PLAYING (אותו לוח, target חדש)
 *     │     ├─ הלוח הסתיים + נשארו לוחות בסבב ─→ PLAYING (לוח חדש)
 *     │     └─ הלוח הסתיים + הסבב הושלם ─→ REWARD (חיזוק) ─→ PLAYING (לוח חדש)
 *     │
 *     └─ click שגוי ─→ COOLDOWN (לוח נעול cooldownMs ms)
 *           │
 *           └─ סיום cooldown ─→ PLAYING (אותו לוח, אותו target)
 */

import { boosterService } from 'learn-booster-kit';
import { pickBoard, generateDeck, type LetterCard } from '../utils/letters';
import { settings } from './settings.svelte';
import { speak } from '../utils/tts';
import { playSuccess, playError, playWin } from '../utils/sound';

export type GameStatus = 'IDLE' | 'PLAYING' | 'SUCCESS' | 'COOLDOWN' | 'REWARD';

const SUCCESS_MS = 900;
const SHAKE_MS = 600;

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
	/** מונה כל הזמן (היסטורי) — מוצג ב"נכון: N" של ה-HeaderBar */
	score = $state(0);
	/** מונה רץ של מספר ה-target הנוכחי בכל המשחק (לדיבוג) */
	round = $state(0);

	/** מונה תשובות נכונות בסבב הנוכחי (מתאפס בפרס). ProgressWidget מציג אותו. */
	correctInCurrentSet = $state(0);
	/** כמה לוחות הושלמו בסבב הנוכחי (מתאפס בפרס). */
	boardsCompletedInSet = $state(0);
	/** כמה שאלות נענו על הלוח הנוכחי (מתאפס בכל לוח חדש). */
	questionsAnsweredInBoard = $state(0);

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
	 * התחלת לוח חדש: מגריל אותיות ובונה תור שאלות.
	 * אורך התור הוא לפי `settings.effectiveQuestionsPerBoard` (לא בהכרח כל
	 * הכרטיסים על הלוח — אם questionsPerBoard מוגדר נמוך יותר).
	 */
	startBoard(): void {
		const deck = generateDeck(settings.selectedLetterIds, settings.selectedVowels);
		this.board = pickBoard({
			count: settings.totalCellsInGrid,
			pairs: deck,
			avoidSimilar: settings.avoidSimilar
		});

		// מאפסים את מונה השאלות בלוח החדש
		this.questionsAnsweredInBoard = 0;

		// תור השאלות — דגימת `effectiveQuestionsPerBoard` כרטיסים אקראיים מהלוח
		const questionsCount = settings.effectiveQuestionsPerBoard;
		this.remainingTargets = shuffle(this.board).slice(0, questionsCount);
		this.advanceToNextTarget(/* isFirstOnBoard */ true);
	}

	/**
	 * מעבר ל-target הבא בתוך אותו לוח. אם התור התרוקן —
	 * הלוח הסתיים: או לוח חדש או פרס (לפי boardsPerSet).
	 */
	private advanceToNextTarget(isFirstOnBoard: boolean): void {
		const next = this.remainingTargets.shift();

		if (!next) {
			// הלוח הנוכחי הסתיים
			this.handleBoardCompleted();
			return;
		}

		this.target = next;
		this.round += 1;
		this.shakingId = null;
		this.status = 'PLAYING';

		// הדפסה לדיבוג
		console.log(
			`[find-letter] round ${this.round}: target = "${this.target.display}" ` +
				`(id=${this.target.id}, speak="${this.target.speak}", ` +
				`board=${this.boardsCompletedInSet + 1}/${settings.boardsPerSet}, ` +
				`q=${this.questionsAnsweredInBoard + 1}/${settings.effectiveQuestionsPerBoard}, ` +
				`set=${this.correctInCurrentSet}/${settings.totalQuestionsPerSet})`
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
	 * תשובה נכונה — צליל, מעלה מונים, מעבר ל-target הבא.
	 *
	 * `score` ו-`correctInCurrentSet` שניהם מתקדמים בכל תשובה נכונה,
	 * אבל יש להם תפקידים שונים:
	 *   - `score` — מונה היסטורי של כל המשחק (HeaderBar).
	 *   - `correctInCurrentSet` — מונה רץ של הסבב הנוכחי, מתאפס בפרס
	 *     (ProgressWidget).
	 */
	private handleCorrect(): void {
		this.score += 1;
		this.correctInCurrentSet += 1;
		this.questionsAnsweredInBoard += 1;
		this.status = 'SUCCESS';
		playSuccess();

		setTimeout(() => {
			this.advanceToNextTarget(false);
		}, SUCCESS_MS);
	}

	/**
	 * תשובה שגויה — צליל error, רעידה, ועונש (cooldown).
	 */
	private handleWrong(card: LetterCard): void {
		this.shakingId = card.id;
		this.status = 'COOLDOWN';
		this.cooldownUntilTs = Date.now() + settings.cooldownMs;
		playError();

		// סיום אנימציית הרעידה
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
	 * הלוח הנוכחי הסתיים (כל ה-questionsPerBoard נענו).
	 *
	 * מקדם את `boardsCompletedInSet`. אם הסבב הסתיים (=`boardsPerSet` לוחות) —
	 * מפעיל פרס ומאפס. אחרת — לוח חדש מיד.
	 */
	private handleBoardCompleted(): void {
		this.boardsCompletedInSet += 1;

		if (
			settings.boosterEnabled &&
			this.boardsCompletedInSet >= settings.boardsPerSet
		) {
			this.triggerReward();
		} else {
			this.startBoard();
		}
	}

	/**
	 * הפעלת חיזוק (סרטון/אנימציה) ואז המשך ללוח חדש (סבב חדש).
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
			// איפוס מוני הסבב
			this.correctInCurrentSet = 0;
			this.boardsCompletedInSet = 0;
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
		this.correctInCurrentSet = 0;
		this.boardsCompletedInSet = 0;
		this.questionsAnsweredInBoard = 0;
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
