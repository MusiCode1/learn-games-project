import type { Result } from '$lib/types';

/**
 * יצירת תוצאה מוצלחת
 * @param value ערך התוצאה
 * @returns תוצאה מוצלחת
 */
export function success<T, E>(value: T): Result<T, E> {
    return { success: true, value };
}

/**
 * יצירת תוצאה כושלת
 * @param error שגיאה
 * @returns תוצאה כושלת
 */
export function failure<T, E>(error: E): Result<T, E> {
    return { success: false, error };
}

/**
 * טיפול בתוצאה (Pattern Matching)
 * @param result תוצאה
 * @param onSuccess פונקציה לטיפול בתוצאה מוצלחת
 * @param onFailure פונקציה לטיפול בתוצאה כושלת
 * @returns תוצאת הטיפול
 */
export function match<T, E, R>(
    result: Result<T, E>,
    onSuccess: (value: T) => R,
    onFailure: (error: E) => R
): R {
    return result.success ? onSuccess(result.value) : onFailure(result.error);
}