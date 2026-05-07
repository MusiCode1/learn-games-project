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

	// קבוצות אותיות
	groupsHeader: 'קבוצות אותיות',
	groupsHint: 'אילו קבוצות אותיות יישלפו ללוח',
	groupBaseLabel: 'בסיס',
	groupBaseHint: '21 אותיות עם פתח (כולל ב/כ/פ דגושות)',
	groupConfusingLabel: 'מבלבלות',
	groupConfusingHint: 'שׂ (שין שמאלית), ע',
	groupRafeLabel: 'רפות',
	groupRafeHint: 'ב רפה, כ רפה, פ רפה — עם הקראה מקורבת לצליל הרפה',

	// הגדרות TTS
	ttsProviderLabel: 'ספק הקראה',
	ttsVoiceLabel: 'קול',
	ttsModelLabel: 'מודל',
	ttsTestLabel: 'בדוק קול',
	ttsTestText: 'שָׁלוֹם, זוֹ דֻגְמָה לַקּוֹל',
	ttsLoadingVoices: 'טוען קולות…',

	// הגדרות חיזוקים — חלקן מנוהלות ע"י booster-kit
	boosterDisabledNote: 'כדי להגדיר חיזוקים, יש להפעיל אותם.'
} as const;
