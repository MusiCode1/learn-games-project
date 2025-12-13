/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * מידע סטטיסטי על החיפוש
 */
interface SearchStatistics {
  /** מספר האובייקטים שנסקרו */
  objectsScanned: number;
  /** העומק המקסימלי שהגענו אליו */
  maxDepthReached: number;
  /** זמן החיפוש במילישניות */
  searchTimeMs: number;
  /** מספר השגיאות שהתרחשו במהלך החיפוש */
  errorCount: number;
  /** מספר המפתחות שנסקרו */
  keysScanned: number;
}

/**
 * תוצאת חיפוש מלאה הכוללת את התוצאות והסטטיסטיקות
 */
interface SearchResultWithStats {
  /** תוצאות החיפוש - מערך של נתיבים */
  results: string[];
  /** מידע סטטיסטי על החיפוש */
  stats: SearchStatistics;
}

/**
 * אפשרויות לפונקציית החיפוש
 */
interface SearchOptions {
  /** המפתח לחיפוש (חובה) */
  keyForSearch: string;
  /** סוג האובייקט לחיפוש (חובה) */
  valueType: string;
  /** האם להציג הודעות דיבוג (ברירת מחדל: false) */
  debug?: boolean;
  /** עומק חיפוש מקסימלי (אופציונלי, ללא הגבלה כברירת מחדל) */
  maxDepth?: number;
  /** האם לאסוף סטטיסטיקות (ברירת מחדל: false) */
  collectStats?: boolean;
}

/**
 * אפשרויות לפונקציית החיפוש עם סטטיסטיקות
 */
interface SearchOptionsWithStats extends SearchOptions {
  /** האם לאסוף סטטיסטיקות - חייב להיות true */
  collectStats: true;
}

/**
 * אפשרויות לפונקציית החיפוש ללא סטטיסטיקות
 */
interface SearchOptionsWithoutStats extends SearchOptions {
  /** האם לאסוף סטטיסטיקות - חייב להיות false או לא מוגדר */
  collectStats?: false;
}

/**
 * מחפש אובייקטים מסוג מסוים באובייקט window
 * @param options - אפשרויות חיפוש עם סטטיסטיקות
 * @returns תוצאות החיפוש עם סטטיסטיקות
 */
export function findFunctionInWindow(options: SearchOptionsWithStats): SearchResultWithStats;

/**
 * מחפש אובייקטים מסוג מסוים באובייקט window
 * @param options - אפשרויות חיפוש ללא סטטיסטיקות
 * @returns מערך של נתיבים
 */
export function findFunctionInWindow(options: SearchOptionsWithoutStats): string[];

/**
 * מחפש אובייקטים מסוג מסוים באובייקט window
 * @param options - אפשרויות חיפוש
 * @returns תוצאות החיפוש, עם או בלי סטטיסטיקות
 */
export function findFunctionInWindow(options: SearchOptions): string[] | SearchResultWithStats {
  if (!options.keyForSearch) {
    throw new Error('חובה לציין את המפתח לחיפוש (keyForSearch)');
  }

  if (!options.valueType) {
    throw new Error('חובה לציין את סוג הערך לחיפוש (valueType)');
  }

  const {
    keyForSearch,
    valueType,
    debug = false,
    maxDepth = undefined,
    collectStats = false
  } = options;

  // שימוש בסט במקום מערך לאחסון התוצאות
  const results = new Set<string>();
  const visited = new WeakSet<object>();

  // סטטיסטיקות
  const stats: SearchStatistics = {
    objectsScanned: 0,
    maxDepthReached: 0,
    searchTimeMs: 0,
    errorCount: 0,
    keysScanned: 0
  };

  const startTime = performance.now();

  // לוגר עם אפשרות דיבוג
  const logger = {
    log: (message: string, ...args: any[]) => {
      if (debug) console.log(message, ...args);
    },
    error: (message: string, error?: any) => {
      if (collectStats) stats.errorCount++;
      if (debug) console.error(message, error);
    }
  };

  logger.log(`מחפש ${keyForSearch}...`);

  /**
   * מפרמט נתיב לפורמט JavaScript חוקי
   * @param pathArray - מערך של חלקי הנתיב
   * @returns נתיב מפורמט
   */
  function formatPath(pathArray: (string | number)[]): string {
    return pathArray.reduce<string>((formattedPath, segment, index) => {
      // הטיפול בסגמנט הראשון
      if (index === 0) {
        return String(segment);
      }

      // בדיקה אם הסגמנט הוא מספר (אינדקס מערך)
      if (!isNaN(Number(segment)) && String(parseInt(String(segment))) === String(segment)) {
        return `${formattedPath}[${segment}]`;
      }

      // בדיקה אם הסגמנט מתחיל בקו תחתון או מכיל תווים מיוחדים
      const segmentStr = String(segment);
      if (segmentStr.startsWith('_') || /[^a-zA-Z0-9_$]/.test(segmentStr)) {
        return `${formattedPath}['${segmentStr}']`;
      }

      // סגמנט רגיל
      return `${formattedPath}.${segmentStr}`;
    }, "");
  }

  /**
   * אוסף את כל המפתחות של אובייקט, כולל מאפיינים שאינם ניתנים למנייה ואינדקסים של מערכים
   * @param obj - האובייקט לבדיקה
   * @returns סט של מפתחות
   */
  function getAllKeys(obj: any): Set<string> {
    const keySet = new Set<string>();

    // הוספת מאפיינים רגילים
    try {
      Object.keys(obj).forEach(key => keySet.add(key));
    } catch (error) {
      logger.error("שגיאה באיסוף מפתחות רגילים:", error);
    }

    // הוספת מאפיינים שאינם ניתנים למנייה
    try {
      Object.getOwnPropertyNames(obj).forEach(key => keySet.add(key));
    } catch (error) {
      logger.error("שגיאה באיסוף מאפיינים שאינם ניתנים למנייה:", error);
    }

    // טיפול מיוחד במערכים - הוספת אינדקסים
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        keySet.add(String(i));
      }
    }

    return keySet;
  }

  /**
   * בודק אם אובייקט מכיל את האיבר המבוקש ומוסיף לתוצאות
   * @param obj - האובייקט לבדיקה
   * @param key - המפתח לבדיקה
   * @param path - הנתיב הנוכחי
   */
  function checkForTargetFunction(obj: any, key: string, path: (string | number)[]): void {
    try {
      // בדיקה אם המפתח הוא מהסוג המבוקש
      if (key === keyForSearch && typeof obj[key] === valueType) {
        results.add(formatPath([...path, key]));
      }

      // בדיקה אם יש מאפיין מהסוג המבוקש באובייקט הנוכחי (מקרה מיוחד)
      if (key !== keyForSearch &&
        obj[key] &&
        typeof obj[key] === "object" &&
        typeof obj[key][keyForSearch] === valueType) {
        results.add(formatPath([...path, key, keyForSearch]));
      }
    } catch (error) {
      logger.error(`שגיאה בבדיקת המפתח ${key}:`, error);
    }
  }

  /**
   * פונקציה רקורסיבית לחיפוש באובייקט
   * @param obj - האובייקט לחיפוש
   * @param path - נתיב נוכחי
   * @param depth - עומק נוכחי
   */
  function searchInObject(obj: any, path: (string | number)[] = [], depth: number = 0): void {
    // בדיקת תנאי עצירה
    if (
      obj === null ||
      obj === undefined ||
      typeof obj !== "object" ||
      visited.has(obj) ||
      (maxDepth !== undefined && depth >= maxDepth)
    ) {
      return;
    }

    // עדכון סטטיסטיקות
    if (collectStats) {
      stats.objectsScanned++;
      stats.maxDepthReached = Math.max(stats.maxDepthReached, depth);
    }

    visited.add(obj);

    // בדיקה אם יש מאפיין מהסוג המבוקש באובייקט הנוכחי
    if (typeof obj[keyForSearch] === valueType) {
      results.add(formatPath([...path, keyForSearch]));
    }

    // איסוף כל המפתחות
    const allKeys = getAllKeys(obj);

    // עדכון סטטיסטיקות
    if (collectStats) {
      stats.keysScanned += allKeys.size;
    }

    // מעבר על כל המפתחות
    for (const key of allKeys) {
      try {
        const value = obj[key];

        // דילוג על ערכים null או אובייקטים שכבר ביקרנו בהם
        if (value === null || value === undefined || visited.has(value)) {
          continue;
        }

        // בדיקה אם המפתח הוא הפונקציה המבוקשת
        checkForTargetFunction(obj, key, path);

        // המשך חיפוש רקורסיבי באובייקטים
        if (typeof value === "object") {
          // יצירת מערך חדש לנתיב כדי למנוע שינויים במערך המקורי
          const newPath = [...path, key];
          searchInObject(value, newPath, depth + 1);
        }
      } catch (error) {
        logger.error(`שגיאה בטיפול במפתח ${key}:`, error);
      }
    }
  }

  try {
    searchInObject(window, ["window"]);
    logger.log(`נמצאו ${results.size} תוצאות`);
  } catch (error) {
    console.error("שגיאה בחיפוש:", error);
  }

  // חישוב זמן החיפוש וסיום
  if (collectStats) {
    stats.searchTimeMs = Math.round(performance.now() - startTime);
    return {
      results: Array.from(results),
      stats
    };
  }

  return Array.from(results);
}


// הרץ דוגמאות רק אם הקובץ מורץ ישירות ולא מיובא כמודול
if (typeof window !== 'undefined' && import.meta.url === window.location.href) {
  // דוגמאות שימוש
  // חיפוש פונקציות
  const resFunctions = findFunctionInWindow({
    keyForSearch: 'makeNewTurn',
    valueType: 'function',
    collectStats: true,
    debug: true
  });
  console.log('פונקציות:', resFunctions);

  // חיפוש אובייקטים
  const resObjects = findFunctionInWindow({
    keyForSearch: 'state',
    valueType: 'object',
    collectStats: true,
    debug: true
  });
  console.log('אובייקטים:', resObjects);
}

const orgToString = findFunctionInWindow.toString;

findFunctionInWindow.toString = () => {
  const text = `
findFunctionInWindow({
  keyForSearch: string;
  valueType: string;
  debug?: boolean;
  maxDepth?: number;
  collectStats?: boolean;
});
`

  console.log(text);
  return orgToString;
};