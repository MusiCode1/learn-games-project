export const language = {
	pageTitle: 'משחקי הלמידה',
	heroEyebrow: 'מרכז משחקים פעיל',
	heroTitle: 'כל משחקי הלמידה במקום אחד',
	heroDescription:
		'בחר משחק והמשך ישר לתרגול. הרשימה מציגה את המשחקים שזמינים עכשיו בפרויקט ונבדקו כיעדי פתיחה חיים.',
	gamesCountLabel: 'משחקים זמינים',
	openGameLabel: 'פרודקשן',
	openDevLabel: 'גרסת פיתוח',
	appPathLabel: 'תיקיית פרויקט',
	newTabLabel: 'נפתח בלשונית חדשה',
	statusLabel: 'סטטוס',
	categoryLabel: 'תחום',
	footerNote: 'המסך הזה מבוסס על מקור אמת יחיד כדי שיהיה פשוט להוסיף משחקים חדשים בהמשך.',
	categories: {
		reading: 'קריאה ושפה',
		math: 'חשבון',
		thinking: 'חשיבה ומיון',
		memory: 'זיכרון והתאמה',
		lifeSkills: 'מיומנויות יום-יום',
		visual: 'תפיסה חזותית'
	},
	statuses: {
		available: 'זמין עכשיו'
	},
	games: {
		wordys: {
			title: "Wordy's",
			description: 'תרגול הקלדת מילים וקריאה גלובלית עם מדפים, קופסאות וכרטיסים מותאמים.'
		},
		readFaster: {
			title: 'האצת קריאה',
			description: 'תרגול זיהוי מילים וקריאה מהירה בשלבים קצרים וברורים.'
		},
		sortCards: {
			title: 'מיון כרטיסים',
			description: 'מיון פריטים לקטגוריות כמו חיות, צמחים, מספרים, צורות וצבעים.'
		},
		trainAddition: {
			title: 'רכבת החיבור',
			description: 'תרגול חיבור בעזרת קרונות, המשך רצף ומשוב מיידי.'
		},
		passcodePractice: {
			title: 'תרגול סיסמה',
			description: 'אימון הקלדת קוד וסיסמה באופן מדורג ומונגש.'
		},
		lotto: {
			title: 'לוטו וזיכרון',
			description: 'משחקי התאמה, לוטו וזיכרון עם תוכן מתחלף כמו צורות, אותיות וקריאה.'
		},
		jigsawPuzzle: {
			title: 'פאזל תמונות',
			description: 'הרכבת פאזלים מתמונות עם שליטה בקושי, זום וחיזוקים.'
		},
		findLetter: {
			title: 'איפה האות?',
			description: 'התלמיד מקשיב לאות עם ניקוד ולוחץ עליה בלוח. תרגול זיהוי אותיות עברית בקול.'
		}
	}
} as const;

export type GameTextKey = keyof typeof language.games;
export type CategoryTextKey = keyof typeof language.categories;
export type StatusTextKey = keyof typeof language.statuses;
