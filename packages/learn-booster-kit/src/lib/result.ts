/**
 * Result<T, E> — חשיפת neverthrow כסטנדרט הפלטפורמה לטיפול בשגיאות.
 *
 * הקיט מייצא את neverthrow מחדש, כך שצרכניו (משחקים, packages פנימיים)
 * מקבלים את ה-API דרך `learn-booster-kit` בלבד, בלי להוסיף את התלות בעצמם.
 *
 * **שני סגנונות שימוש:**
 *
 * 1. בדיקה ידנית (TypeScript narrowing דרך method):
 *    ```ts
 *    const result = await updateGameSettings('find-letter-game', settings);
 *    if (result.isErr()) {
 *      showToast(result.error.summary);
 *      return;
 *    }
 *    const config = result.value;
 *    ```
 *
 * 2. Pattern matching בסגנון FP:
 *    ```ts
 *    const message = result.match(
 *      (config) => `נשמר: ${gameId}`,
 *      (err) => `שגיאה: ${err.summary}`,
 *    );
 *    ```
 *
 * 3. Chaining (כש-flow מסובך, לא חובה ב-simple cases):
 *    ```ts
 *    loadSettings(gameId)
 *      .andThen(validate)
 *      .andThen(applyMigration)
 *      .mapErr(toUserMessage);
 *    ```
 *
 * **API שמיוצא:**
 * - `ok(value)`, `err(error)` — constructors
 * - `okAsync(value)`, `errAsync(error)` — async constructors
 * - `Result<T, E>`, `ResultAsync<T, E>` — types/classes
 * - `Ok`, `Err` — sub-classes (לרוב לא צריך ישירות)
 * - `fromThrowable`, `fromPromise`, `fromSafePromise`, `fromAsyncThrowable` — converters
 * - `safeTry` — generator-based syntax
 *
 * תיעוד מלא: https://github.com/supermacro/neverthrow
 * עקרון השימוש: ראה `docs/functional-programming.md` בשורש הפרויקט.
 */
export {
    ok,
    err,
    okAsync,
    errAsync,
    Result,
    ResultAsync,
    Ok,
    Err,
    fromThrowable,
    fromPromise,
    fromSafePromise,
    fromAsyncThrowable,
    safeTry,
} from "neverthrow";

/**
 * שגיאת validation סטנדרטית — משמשת כשפונקציה לא יכולה להחזיר את הערך
 * המבוקש כי הקלט לא עבר schema validation.
 *
 * משמש לדוגמה ב-`updateGameSettings` כשה-Config הסופי לא עובר את
 * `ConfigSchema` של ArkType.
 */
export interface ValidationError {
    kind: "validation";
    summary: string;
}
