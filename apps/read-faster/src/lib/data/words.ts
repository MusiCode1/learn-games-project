import type { WordList } from '../types';
import { WordUtils } from '../utils/wordUtils';
import wordList from './words.json';

const IMAGE_EXTENSIONS = ['jpg', 'png', 'jpeg'] as const;

// רשימת קבצים לשלב 1
const level1Files = [
	'באה.jpg',
	'בכה.jpg',
	'בכה.png',
	'בלע.jpg',
	'במה.png',
	'בנה.png',
	'גרה.png',
	'דגה.jpeg',
	'זזה.png',
	'חדה.png',
	'חוה.png',
	'חיה.png',
	'חכה.jpeg',
	'חלה.jpeg',
	'חמה.jpeg',
	'טסה.jpeg',
	'כלה.png',
	'מרה.png',
	'נאה.png',
	'נגע.png',
	'נמה.png',
	'ספה.jpeg',
	'עלה.png',
	'ענה.png',
	'עפה.png',
	'פנה.jpg',
	'פרה.jpeg',
	'צמה.png',
	'קמה.png',
	'קנה.png',
	'קרא.png',
	'קרע.png',
	'ראה.png',
	'רבה.png',
	'רזה.png',
	'רכה.png',
	'שטה.png',
	'שעה.png',
	'שרה.png',
	'שתה.png'
];

// מיפוי מילים לקבצי תמונה בשלב 2
const level2FilesMap: Record<string, string> = {
	'אבק': 'אבק.png',
	'אגס': 'אגס.jpeg',
	'אחז': 'אחז.png',
	'אכל': 'אכל.png',
	'בדק': 'בדק.jpg',
	'בחש': 'בחש.png',
	'גדל': 'גדל.jpeg',
	'גזר': 'גזר.png',
	'גלש': 'גלש.png',
	'גמד': 'גמד.jpeg',
	'דאג': 'דאג.jpeg',
	'הלך': 'הלך.png',
	'זהב': 'זהב.jpg',
	'זלל': 'זלל.png',
	'זנב': 'זנב.png',
	'זקן': 'זקן.jpeg',
	'זרק': 'זרק.jpeg',
	'חדש': 'חדש.jpeg',
	'חזק': 'חזק.png',
	'חזר': 'חזר.jpg',
	'חצב': 'חצב.png',
	'חצץ': 'חצץ.jpeg',
	'חתך': 'חתך.png',
	'יער': 'יער.jpeg',
	'יקר': 'יקר.jpg',
	'ירד': 'ירד.png',
	'ישב': 'ישב.png',
	'כאב': 'כאב.png',
	'לבן': 'לבן.png',
	'לעס': 'לעס.jpeg',
	'לקח': 'לקח.png',
	'מגף': 'מגף.png',
	'מגש': 'מגש.png',
	'מדד': 'מדד.jpeg',
	'מחט': 'מחט.png',
	'מחק': 'מחק.jpeg',
	'מסר': 'מסר.png',
	'נבח': 'נבח.png',
	'נהר': 'נהר.png',
	'נחל': 'נחל.jpeg',
	'נעל': 'נעל.jpeg',
	'נער': 'נער.jpeg',
	'נפל': 'נפל.jpeg',
	'סבא': 'סבא.jpeg',
	'סהר': 'סהר.png',
	'ענן': 'ענן.jpeg',
	'עקץ': 'עקץ.png',
	'עשן': 'עשן.jpeg',
	'פנס': 'פנס.png',
	'פתח': 'פתח.png',
	'רעם': 'רעם.jpg',
	'שאג': 'שאג.jpeg',
	'שמח': 'שמח.jpeg',
	'שמר': 'שמר.jpeg',
	'שער': 'שער.png',
	'שפם': 'שפם.png',
	'תפר': 'תפר.png'
};

function getImagePath(word: string, level: number): string | false {
	const cleanWord = WordUtils.removeNiqqud(word);

	// בדיקה לפי השלב
	if (level === 1) {
		for (const ext of IMAGE_EXTENSIONS) {
			const fileName = `${cleanWord}.${ext}`;
			if (level1Files.includes(fileName)) {
				return `/images/${fileName}`;
			}
		}
	} else if (level === 2) {
		const fileName = level2FilesMap[cleanWord];
		if (fileName) {
			return `/images/Level-2/${fileName}`;
		}
	} else if (level === 3) {
		// בדיקה אם קיים קובץ בתיקיית Level-3
		// כרגע אין תמונות לשלב 3, אז מחזירים false
		return false;
	} else if (level === 4) {
		// בדיקה אם קיים קובץ בתיקיית Level-4
		// כרגע אין תמונות לשלב 4, אז מחזירים false
		return false;
	}

	return false;
}

// טעינת מילים מכל השלבים כרשימות נפרדות
export const level1Words: WordList = wordList.level_1.map((word) => ({
	text: word,
	image: getImagePath(word, 1),
	level: 1
}));

export const level2Words: WordList = wordList.level_2.map((word) => ({
	text: word,
	image: getImagePath(word, 2),
	level: 2
}));

export const level3Words: WordList = wordList.level_3.map((word) => ({
	text: word,
	image: getImagePath(word, 3),
	level: 3
}));

export const level4Words: WordList = wordList.level_4.map((word) => ({
	text: word,
	image: getImagePath(word, 4),
	level: 4
}));

// ייצוא כל המילים כמערך אחד לצורך תאימות עם הקוד הקיים
export const words: WordList = [...level1Words];

// פונקציה לקבלת מילים לפי שלב
export function getWordsByLevel(level: number): WordList {
	switch (level) {
		case 1:
			return level1Words;
		case 2:
			return level2Words;
		case 3:
			return level3Words;
		case 4:
			return level4Words;
		default:
			return level1Words;
	}
}

// פונקציה לארגון כל המילים לפי רמה, כפי שנדרש ל-AppState
export function initializeWordsByLevel(): Record<number, WordList> {
	// בהנחה שיש לנו עד 4 רמות כרגע
	// אפשר להפוך את זה לדינמי יותר אם יש יותר רמות או שהן לא רציפות
	return {
		1: level1Words,
		2: level2Words,
		3: level3Words,
		4: level4Words
		// ניתן להוסיף כאן רמות נוספות אם יש
	};
}
