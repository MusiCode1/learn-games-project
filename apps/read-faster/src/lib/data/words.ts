import type { WordList } from '../types';
import { WordUtils } from '../utils/wordUtils';
import wordList from './words.json';

const IMAGE_EXTENSIONS = ['jpg', 'png'] as const;

function getImagePath(word: string): string|false {
  const cleanWord = WordUtils.removeNiqqud(word);
  
  for (const ext of IMAGE_EXTENSIONS) {
    const fileName = `${cleanWord}.${ext}`;
    const files = ['באה.jpg', 'בכה.jpg', 'בלע.jpg', 'במה.png', 'בנה.png'];
    
    if (files.includes(fileName)) {
      return `/images/${fileName}`;
    }
  }
  
  return false
}

const w = wordList.leavel_1.map((word) => ({
  text: word,
  image: getImagePath(word),
  level: 1
}));


export const words: WordList = [
  ...w
];
