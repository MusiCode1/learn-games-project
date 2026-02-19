/**
 * רישום אוטומטי של כל ספקי התוכן
 */
import { contentRegistry } from '../registry';
import { lettersProvider } from './letters/index';
import { shapesProvider } from './shapes/index';
import { readingProvider } from './reading';

// רישום ספקי התוכן
contentRegistry.register(lettersProvider);
contentRegistry.register(shapesProvider);
contentRegistry.register(readingProvider);

// ייצוא לשימוש חיצוני
export { lettersProvider, shapesProvider, readingProvider };
export type { LettersProviderSettings } from './letters/index';
export type { ShapesProviderSettings, ShapeDefinition } from './shapes/index';
export type { ReadingProviderSettings, ReadingItem } from './reading';
export { SHAPES } from './shapes/index';
export { READING_ITEMS } from './reading';
