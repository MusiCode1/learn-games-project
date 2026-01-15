/**
 * רישום אוטומטי של כל ספקי התוכן
 */
import { contentRegistry } from '../registry';
import { lettersProvider } from './letters';
import { shapesProvider } from './shapes';

// רישום ספקי התוכן
contentRegistry.register(lettersProvider);
contentRegistry.register(shapesProvider);

// ייצוא לשימוש חיצוני
export { lettersProvider, shapesProvider };
export type { LettersProviderSettings } from './letters';
export type { ShapesProviderSettings, ShapeDefinition } from './shapes';
export { SHAPES } from './shapes';
