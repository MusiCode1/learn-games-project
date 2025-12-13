const CURRENT_VERSION = 1;
const STORAGE_KEY = 'wordys-settings';

export class SettingsStore {
	// מצב תצוגת המילה: 'hidden' (מוסתר), 'letters' (אותיות נפרדות), 'word' (מילה שלמה)
	wordDisplayMode = $state<'hidden' | 'letters' | 'word'>('letters');

	// האם להציג חיווי (רעידה/צבע) בעת טעות
	errorFeedback = $state(true);

	// האם להדגיש את האות הנוכחית שצריך להקליד
	highlightCurrentChar = $state(true);

	// מספר החזרות לכל כרטיס (0 = ללא הגבלה)
	cardRepetitions = $state(2);

	// מצב המקלדת הוירטואלית: 'none' (ללא), 'full' (מלאה), 'focused' (רק אותיות רלוונטיות)
	virtualKeyboardMode = $state<'none' | 'full' | 'focused'>('full');

	// === הגדרות חיזוקים (Booster) ===

	// האם מנגנון החיזוקים פעיל
	boosterEnabled = $state(true);

	// מספר מילים שיש להשלים כדי לקבל חיזוק
	wordsPerBooster = $state(3);

	// האם לחזור אוטומטית למשחק לאחר סיום החיזוק (לולאה)
	autoBoosterLoop = $state(false);

	constructor() {
		// טעינה ראשונית
		if (typeof globalThis?.localStorage !== 'undefined') {
			this.load();
		}

		// האזנה לשינויים ושמירה
		$effect.root(() => {
			$effect(() => {
				this.save();
			});
		});
	}

	// פונקציה פרטית לטעינת ההגדרות
	private load() {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				this.migrate(parsed);
			} catch (e) {
				console.error('Failed to parse settings', e);
			}
		}
	}

	// פונקציה פרטית לשמירת ההגדרות
	private save() {
		if (typeof window?.localStorage === 'undefined') return;

		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				...this,
				version: CURRENT_VERSION
			})
		);
	}

	// פונקציה לטיפול במיגרציה של הגדרות ישנות
	private migrate(parsed: any) {
		// מיגרציה מגרסה 0/ללא גרסה (showWord -> wordDisplayMode)
		if (parsed.wordDisplayMode) {
			this.wordDisplayMode = parsed.wordDisplayMode;
		} else if (parsed.showWord !== undefined) {
			// תאימות לאחור: המרה מבוליאני למצב תצוגה
			this.wordDisplayMode = parsed.showWord ? 'letters' : 'hidden';
		} else {
			this.wordDisplayMode = 'letters';
		}

		// טעינת שאר ההגדרות (עם ערכי ברירת מחדל אם חסר)
		this.errorFeedback = parsed.errorFeedback ?? true;
		this.highlightCurrentChar = parsed.highlightCurrentChar ?? true;
		this.cardRepetitions = parsed.cardRepetitions ?? 2;
		this.virtualKeyboardMode = parsed.virtualKeyboardMode ?? 'full';
		this.boosterEnabled = parsed.boosterEnabled ?? true;
		this.wordsPerBooster = parsed.wordsPerBooster ?? 3;
		this.autoBoosterLoop = parsed.autoBoosterLoop ?? false;
	}
}

export const settings = new SettingsStore();
