/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-rest-params */

/**
 * מודול לניטור קריאות לפונקציות באמצעות שינוי של Function.prototype.call
 * משתמש בגישה משופרת עם WeakMap לשיפור ביצועים
 *
 * הערה: קובץ זה מכיל קוד שמבצע monkey patching על פונקציות מובנות של JavaScript.
 * זה נעשה במכוון לצורך ניטור ביצועים, אך יש להשתמש בזהירות.
 */

import { log } from "./logger.svelte";

/**
 * הגדרת זמן הקריאה לקולבק
 */
export type CallbackTiming = 'before' | 'after' | 'both';

type Callback = (functionName: string, args: IArguments) => void;
type AsyncCallback = (functionName: string, args: IArguments) => Promise<void>;


// שמירת הפונקציה המקורית
const originalFunctionCall = Function.prototype.call;

const AsyncFunction = (async () => { }).constructor;

const isAsyncFunction =
  (func: AsyncCallback | Callback): func is AsyncCallback =>
    (func instanceof AsyncFunction);

let isAlreadyDefined = false;

/**
 * מנטר קריאות לפונקציה ספציפית באמצעות שינוי של Function.prototype.call
 * משתמש ב-WeakMap לשיפור ביצועים ומניעת בדיקות חוזרות
 *
 * @param targetFunctionName שם הפונקציה לניטור
 * @param callback פונקציית callback שתיקרא בכל פעם שהפונקציה המנוטרת נקראת
 * @param callbackTiming מתי לקרוא לקולבק - לפני הפונקציה המקורית, אחריה, או שניהם
 * @returns פונקציה לביטול הניטור
 */
export function monitorFunctionCalls(
  targetFunctionName: string,
  callback: (AsyncCallback | Callback) = (name) => log(`Function call monitored:`, name),
  callbackTiming: CallbackTiming = 'before'
): () => void {

  // מפה לזיהוי מהיר של פונקציות שכבר נבדקו
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const checkedFunctions = new WeakMap<Function, boolean>();

  const isAsyncCallback = isAsyncFunction(callback);

  if (!isAlreadyDefined) isAlreadyDefined = true;
  else log('The previous monitoring function,' +
    ' has been overwritten by a new monitoring function');

  // החלפת הפונקציה המקורית
  Function.prototype.call = function () {
    // בדיקה עם מטמון
    let isTarget = checkedFunctions.get(this);

    if (isTarget === undefined) {
      isTarget = this.name === targetFunctionName;
      checkedFunctions.set(this, isTarget);
    }

    if (isTarget === false) {
      // @ts-ignore
      return originalFunctionCall.apply(this, arguments);
    }


    log(targetFunctionName + ' is calles');

    if (isAsyncCallback && (callbackTiming === 'before' || callbackTiming === 'both')) {
      let result;

      callback(this.name, arguments).then(() => {
        // @ts-ignore
        result = originalFunctionCall.apply(this, arguments);
      });

      if (callbackTiming === 'both') {
        callback(this.name, arguments);
      }
      return result;
    } else {
      // קריאה לקולבק לפני הפונקציה המקורית
      if (callbackTiming === 'before' || callbackTiming === 'both') {
        if (isAsyncCallback) {
          callback(this.name, arguments);
        }
      }

      // @ts-ignore שימוש ב-arguments במקום יצירת מערך חדש
      const result = originalFunctionCall.apply(this, arguments);

      // קריאה לקולבק אחרי הפונקציה המקורית
      if (callbackTiming === 'after' || callbackTiming === 'both') {
        callback(this.name, arguments);
      }

      return result;
    }
  };

  // פונקציה לניקוי וביטול הניטור
  const cleanup = () => {
    // שחזור הפונקציה המקורית רק אם היא עדיין הפונקציה שלנו
    if (Function.prototype.call !== originalFunctionCall) {
      Function.prototype.call = originalFunctionCall;
      log(`Function monitoring stopped manually`);
    }
  };

  log(`Started monitoring calls to function: ${targetFunctionName}`);
  return cleanup;
}

/**
 * מנטר קריאות לפונקציה ספציפית ומחזיר נתונים סטטיסטיים
 * גרסה מורחבת של monitorFunctionCalls שאוספת נתונים סטטיסטיים
 *
 * @param targetFunctionName שם הפונקציה לניטור
 * @returns אובייקט עם פונקציית ביטול ופונקציה לקבלת סטטיסטיקות
 */
export function monitorFunctionPerformance(
  targetFunctionName: string
) {
  // נתונים סטטיסטיים
  const stats = {
    callCount: 0,
    totalExecutionTime: 0,
    minExecutionTime: Number.MAX_SAFE_INTEGER,
    maxExecutionTime: 0,
    lastCallTime: 0,
    averageTimeBetweenCalls: 0,
    totalTimeBetweenCalls: 0
  };

  // פונקציית callback שאוספת נתונים סטטיסטיים
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const performanceCallback = (functionName: string, args: IArguments) => {
    const now = performance.now();

    // חישוב זמן בין קריאות
    if (stats.lastCallTime > 0) {
      const timeBetweenCalls = now - stats.lastCallTime;
      stats.totalTimeBetweenCalls += timeBetweenCalls;
      stats.averageTimeBetweenCalls = stats.totalTimeBetweenCalls / stats.callCount;
    }

    stats.lastCallTime = now;
    stats.callCount++;

    // מדידת זמן ביצוע
    const startTime = performance.now();

    // הוק שרץ אחרי שהפונקציה המקורית מסתיימת
    const originalApply = Function.prototype.apply;
    const originalApplyTemp = originalApply;

    Function.prototype.apply = function () {
      // @ts-ignore - שימוש ב-arguments
      const result = originalApplyTemp.apply(this, arguments);

      // רץ רק בפעם הראשונה (כשחוזרים מהפונקציה המקורית)
      if (Function.prototype.apply === originalApplyTemp) {
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        stats.totalExecutionTime += executionTime;
        stats.minExecutionTime = Math.min(stats.minExecutionTime, executionTime);
        stats.maxExecutionTime = Math.max(stats.maxExecutionTime, executionTime);

        // שחזור הפונקציה המקורית
        Function.prototype.apply = originalApply;
      }

      return result;
    };

    log(`Performance monitoring: ${functionName} called(${stats.callCount} calls so far)`);
  };

  // הפעלת הניטור - קריאה לקולבק אחרי הפונקציה המקורית כדי למדוד זמן ביצוע
  const stopMonitoring = monitorFunctionCalls(
    targetFunctionName,
    performanceCallback,
    'after'
  );

  // פונקציה לקבלת הסטטיסטיקות
  const getStats = () => {
    return {
      ...stats,
      averageExecutionTime: stats.callCount > 0 ? stats.totalExecutionTime / stats.callCount : 0
    };
  };

  return {
    stopMonitoring,
    getStats
  };
}

/**
 * דוגמת שימוש בפונקציות הניטור
 */
export function exampleUsage() {
  // דוגמה 1: ניטור פשוט (ברירת מחדל - קולבק לפני הפונקציה המקורית)
  const stopBasicMonitoring = monitorFunctionCalls('makeNewTurn');

  // דוגמה 2: ניטור עם callback מותאם אישית לפני הפונקציה המקורית
  const stopBeforeMonitoring = monitorFunctionCalls(
    'makeNewTurn',
    (name: string, args: IArguments) => {
      log(`Before monitoring: ${name} called with ${args.length} arguments`);
    },
    'before'
  );

  // דוגמה 3: ניטור עם callback מותאם אישית אחרי הפונקציה המקורית
  const stopAfterMonitoring = monitorFunctionCalls(
    'makeNewTurn',
    (name: string, args: IArguments) => {
      log(`After monitoring: ${name} called with ${args.length} arguments`);
    },
    'after'
  );

  // דוגמה 4: ניטור עם callback מותאם אישית לפני ואחרי הפונקציה המקורית
  const stopBothMonitoring = monitorFunctionCalls(
    'makeNewTurn',
    (name: string, args: IArguments) => {
      log(`Both monitoring: ${name} called with ${args.length} arguments`);
    },
    'both'
  );

  // דוגמה 5: ניטור ביצועים (משתמש בקולבק אחרי הפונקציה המקורית)
  const { stopMonitoring, getStats } = monitorFunctionPerformance('makeNewTurn');

  // הצגת סטטיסטיקות אחרי 30 שניות
  setTimeout(() => {
    const stats = getStats();
    log('Performance statistics:', stats);

    // עצירת כל הניטורים
    stopBasicMonitoring();
    stopBeforeMonitoring();
    stopAfterMonitoring();
    stopBothMonitoring();
    stopMonitoring();
  }, 30000);
}

// חשיפת הפונקציות לחלון הגלובלי לצורך דיבאג
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__monitorFunctionCalls = monitorFunctionCalls;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__monitorFunctionPerformance = monitorFunctionPerformance;
}