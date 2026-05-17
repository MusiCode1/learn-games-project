/**
 * שירות טקסטים — ריכוז כל המחרוזות שמוצגות למשתמש
 */

export const language = {
	pageTitle: 'איפה האות?',
	gameTitle: 'איפה האות?',
	headerSubtitle: 'הקשיבו וגעו באות הנכונה',
	listenAgainLabel: 'השמע שוב',
	newGameLabel: 'משחק חדש',
	settingsLabel: 'הגדרות',
	scoreLabel: 'נכון',
	roundLabel: 'סיבוב',
	promptPrefix: 'איפה',
	promptSuffix: '?',
	congratsTitle: 'כל הכבוד!',
	congratsBody: 'מצאת את האות',
	startPrompt: 'לחצו על כפתור ההשמעה כדי להתחיל',
	tryAgain: 'נסו שוב',
	speakNotSupported: 'הדפדפן אינו תומך בהקראה',

	// === מסך הגדרות ===
	settingsPageTitle: 'הגדרות מורה',
	backToGame: 'חזרה למשחק',
	gameSettingsHeader: 'הגדרות משחק',
	ttsSettingsHeader: 'הגדרות הקראה (TTS)',
	boosterSettingsHeader: 'הגדרות חיזוקים',

	// הגדרות משחק
	settingGridSize: 'גודל לוח ברירת מחדל',
	settingVoiceEnabled: 'הקראה קולית',
	settingVoiceEnabledHint: 'מקריא את האות הנדרשת בקול',
	settingAutoSpeak: 'הקראה אוטומטית בכל סיבוב',
	settingAutoSpeakHint: 'משמיע את האות אוטומטית כשמתחיל סיבוב חדש',
	settingBoosterEnabled: 'חיזוקים מופעלים',
	settingBoosterEnabledHint: 'אחרי N הצלחות, מציג סרטון/אנימציית פרס',
	settingAvoidSimilar: 'הימנע מאותיות דומות באותו לוח',
	settingAvoidSimilarHint: 'לא יוצגו יחד אותיות שנשמעות או נראות דומות (למשל ס/שׂ, ב רפה/ו)',
	settingCooldown: 'משך עונש בטעות (שניות)',
	settingCooldownHint: 'אחרי לחיצה שגויה, הלוח ננעל למשך הזמן הזה כדי למנוע ניחוש',
	settingQuestionsPerBoard: 'שאלות בכל לוח',
	settingQuestionsPerBoardHint: '0 = לשאול על כל הכרטיסים בלוח. אחרת — מספר השאלות לפני שהלוח מתחלף.',
	settingBoardsPerSet: 'לוחות בסבב',
	settingBoardsPerSetHint: 'כמה לוחות התלמיד מסיים לפני שהוא מקבל פרס.',
	settingsSummary: 'סך השאלות לפרס',

	// בחירת אותיות
	letterSelectionHeader: 'אותיות להצגה',
	letterSelectionHint: 'אילו אותיות יופיעו בלוח',
	selectAllLabel: 'סמן הכל',
	clearAllLabel: 'נקה הכל',
	resetToDefaultLabel: 'ברירת מחדל',
	minimumLettersHint: 'יש לסמן לפחות שתי אותיות',

	// === בחירת ניקוד ===
	vowelSelectionHeader: 'ניקוד להצגה',
	vowelSelectionHint: 'אילו סוגי ניקוד יופיעו בלוח',
	minimumVowelsHint: 'יש לסמן לפחות סוג ניקוד אחד',

	// שמות הניקודים
	vowelNamePatah: 'פתח',
	vowelNameNone: 'עיצור',

	// הגדרות TTS
	ttsProviderLabel: 'ספק הקראה',
	ttsVoiceLabel: 'קול',
	ttsModelLabel: 'מודל',
	ttsTestLabel: 'בדוק קול',
	ttsTestText: 'שָׁלוֹם, זוֹ דֻגְמָה לַקּוֹל',
	ttsLoadingVoices: 'טוען קולות…',

	// הגדרות חיזוקים — חלקן מנוהלות ע"י booster-kit
	boosterDisabledNote: 'כדי להגדיר חיזוקים, יש להפעיל אותם.',

	// === Cooldown Overlay — מציג ספירה לאחור בזמן עונש על טעות ===
	cooldownTitle: 'טעות',
	cooldownHint: 'המתן רגע ונסה שוב',

	// === מסך פתיחה ===
	startScreenSubtitle: 'משחק זיהוי אותיות בעברית',
	startButtonLabel: 'להתחלת המשחק',
	startScreenTip: 'הקשיבו ולחצו על האות הנכונה'
} as const;
