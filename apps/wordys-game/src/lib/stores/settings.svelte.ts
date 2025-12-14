/**
 * ⚠️ חשוב: יש לעדכן את CURRENT_VERSION לאחר כל שינוי במבנה ההגדרות (SettingsStore),
 * ולוודא שפונקציית ה-migrate מטפלת בגרסה הישנה ובערכי ברירת מחדל.
 */
const CURRENT_VERSION = 3;
const STORAGE_KEY = 'wordys-settings';

const DEFAULT_SETTINGS = {
	wordDisplayMode: 'letters' as 'hidden' | 'letters' | 'word',
	errorFeedback: true,
	highlightCurrentChar: true,
	cardRepetitions: 2,
	virtualKeyboardMode: 'full' as 'none' | 'full' | 'focused',
	boosterEnabled: true,
	wordsPerBooster: 3,
	autoBoosterLoop: false,
	hintEnabled: true,
	hintDuration: 1500,
	hintCooldown: 0
} as const;

export type Settings = typeof DEFAULT_SETTINGS;

type SettingsKey = keyof Settings;

type Ty = Settings;
export class SettingsStore {
	// גרסה של המבנה של ההגדרות
	private schemaVersion = CURRENT_VERSION;

	// מצב תצוגת המילה: 'hidden' (מוסתר), 'letters' (אותיות נפרדות), 'word' (מילה שלמה)
	wordDisplayMode = $state<Ty['wordDisplayMode']>(DEFAULT_SETTINGS.wordDisplayMode);

	// האם להציג חיווי (רעידה/צבע) בעת טעות
	errorFeedback = $state<boolean>(DEFAULT_SETTINGS.errorFeedback);

	// האם להדגיש את האות הנוכחית שצריך להקליד
	highlightCurrentChar = $state<boolean>(DEFAULT_SETTINGS.highlightCurrentChar);

	// מספר החזרות לכל כרטיס (0 = ללא הגבלה)
	cardRepetitions = $state<number>(DEFAULT_SETTINGS.cardRepetitions);

	// מצב המקלדת הוירטואלית: 'none' (ללא), 'full' (מלאה), 'focused' (רק אותיות רלוונטיות)
	virtualKeyboardMode = $state<Ty['virtualKeyboardMode']>(DEFAULT_SETTINGS.virtualKeyboardMode);

	// === הגדרות חיזוקים (Booster) ===

	// האם מנגנון החיזוקים פעיל
	boosterEnabled = $state<boolean>(DEFAULT_SETTINGS.boosterEnabled);

	// מספר מילים שיש להשלים כדי לקבל חיזוק
	wordsPerBooster = $state<number>(DEFAULT_SETTINGS.wordsPerBooster);

	// האם לחזור אוטומטית למשחק לאחר סיום החיזוק (לולאה)
	autoBoosterLoop = $state<boolean>(DEFAULT_SETTINGS.autoBoosterLoop);

	// === הגדרות רמז (Hint) ===

	// האם מנגנון הרמז פעיל (רלוונטי רק כשהמילה מוסתרת)
	hintEnabled = $state<boolean>(DEFAULT_SETTINGS.hintEnabled);

	// משך זמן הצגת הרמז במילי-שניות
	hintDuration = $state<number>(DEFAULT_SETTINGS.hintDuration);

	// זמן צינון (Cooldown) בין רמזים בשניות (0 = ללא הגבלה)
	hintCooldown = $state<number>(DEFAULT_SETTINGS.hintCooldown);

	constructor() {
		// טעינה ראשונית
		if (typeof globalThis?.localStorage !== 'undefined') {
			this.load();
		}

		// האזנה לשינויים ושמירה
		$effect.root(() => {
			$effect(() => {
				this.toJSON(); // Track all dependencies
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

	// החזרת אובייקט פשוט עם כל ההגדרות (מתוך הדיפולט)
	public toJSON() {
		const data: Record<string, any> = { schemaVersion: CURRENT_VERSION };
		for (const key of Object.keys(DEFAULT_SETTINGS) as Array<SettingsKey>) {
			data[key] = this[key];
		}
		return data;
	}

	// פונקציה פרטית לשמירת ההגדרות
	private save() {
		if (typeof window?.localStorage === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
	}

	// פונקציה לטיפול במיגרציה של הגדרות ישנות
	private migrate(parsed: any) {
		// מיגרציה מגרסה 0/ללא גרסה (showWord -> wordDisplayMode)
		if (!parsed.wordDisplayMode && parsed.showWord !== undefined) {
			parsed.wordDisplayMode = parsed.showWord ? 'letters' : 'hidden';
		}

		// עדכון דינמי של כל השדות מתוך ברירת המחדל
		for (const key of Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>) {
			// @ts-ignore - access by key
			this[key] = parsed[key] ?? DEFAULT_SETTINGS[key];
		}
	}
}

export const settings = new SettingsStore();
