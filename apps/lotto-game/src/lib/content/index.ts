/**
 * ייצוא מרכזי של מערכת התוכן המודולרית
 */

// טיפוסים בסיסיים
export type { ContentProvider, ContentItem, CardContent, CardStyleOptions } from './types';
export { isContentProvider } from './types';

// Registry
export { contentRegistry } from './registry';

// Providers - ייבוא מבצע רישום אוטומטי
import './providers';

export type { LettersProviderSettings, ShapesProviderSettings, ShapeDefinition } from './providers';
export { SHAPES } from './providers';
