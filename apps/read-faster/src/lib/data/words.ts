import type { WordList } from '../types';
import { WordUtils } from '../utils/wordUtils';
import wordList from './words.json';

const IMAGE_EXTENSIONS = ['jpg', 'png', 'jpeg'] as const;

function getImagePath(word: string): string | false {
	const cleanWord = WordUtils.removeNiqqud(word);

	for (const ext of IMAGE_EXTENSIONS) {
		const fileName = `${cleanWord}.${ext}`;
		const files = [
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

		if (files.includes(fileName)) {
			return `/images/${fileName}`;
		}
	}

	return false;
}

const w = wordList.level_1.map((word) => ({
	text: word,
	image: getImagePath(word),
	level: 1
}));

export const words: WordList = [...w];
