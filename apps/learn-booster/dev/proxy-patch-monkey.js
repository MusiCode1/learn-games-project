/**
 * פונקציה גנרית המחליפה פונקציה מקורית בפרוקסי
 * הפרוקסי מאפשר לנו להוסיף התנהגות לפני ואחרי הפעלת הפונקציה המקורית
 *
 * @param {Object} context - האובייקט שמכיל את הפונקציה
 * @param {string} funcName - שם הפונקציה שרוצים להחליף
 * @param {Object} options - אפשרויות נוספות
 * @param {Function} options.beforeCall - פונקציה שתרוץ לפני הקריאה לפונקציה המקורית (מקבלת את הארגומנטים)
 * @param {Function} options.afterCall - פונקציה שתרוץ אחרי הקריאה לפונקציה המקורית (מקבלת את התוצאה והארגומנטים)
 * @param {Function} options.onError - פונקציה שתרוץ במקרה של שגיאה (מקבלת את השגיאה והארגומנטים)
 * @returns {boolean} - האם ההחלפה הצליחה
 */
function setFunctionProxy(context, funcName, options = {}) {
  // שמירת הפונקציה המקורית
  const originalFunction = context[funcName];

  // וידוא שהפונקציה קיימת
  if (typeof originalFunction !== "function") {
    console.error(`Function ${funcName} not found in context`);
    return false;
  }

  // הגדרת פונקציות ברירת מחדל אם לא סופקו
  const beforeCall =
    options.beforeCall ||
    ((args) => console.log(`${funcName} called with arguments:`, args));
  const afterCall =
    options.afterCall ||
    ((result) =>
      console.log(`${funcName} executed successfully, result:`, result));
  const onError =
    options.onError ||
    ((error) => console.error(`Error in ${funcName}:`, error));

  // החלפת הפונקציה המקורית בפרוקסי
  context[funcName] = function (...args) {
    // קוד שירוץ לפני הפעלת הפונקציה המקורית
    beforeCall(args);

    try {
      // הפעלת הפונקציה המקורית עם אותם ארגומנטים ואותו קונטקסט
      const result = originalFunction.apply(this, args);

      // קוד שירוץ אחרי הפעלת הפונקציה המקורית
      afterCall(result, args);

      // החזרת התוצאה המקורית
      return result;
    } catch (error) {
      // טיפול בשגיאות
      onError(error, args);
      throw error; // זריקת השגיאה מחדש כדי לשמור על התנהגות מקורית
    }
  };

  console.log(`Successfully proxied ${funcName}`);
  return true;
}

/**
 * פונקציה גנרית להחלפת פונקציה כלשהי בפרוקסי
 *
 * @param {Object} contextPath - נתיב לקונטקסט (למשל: window.PIXI.game)
 * @param {string} funcName - שם הפונקציה שרוצים להחליף
 * @param {Object} options - אפשרויות נוספות לפרוקסי
 * @returns {boolean} - האם ההחלפה הצליחה
 */
function proxyAnyFunction(contextPath, funcName, options = {}) {
  // מציאת הקונטקסט לפי הנתיב
  let context;
  try {
    context = eval(contextPath);
  } catch (error) {
    console.error(`Error finding context at path: ${contextPath}`, error);
    return false;
  }

  if (!context) {
    console.error(`Context not found at path: ${contextPath}`);
    return false;
  }

  return setFunctionProxy(context, funcName, options);
}

/**
 * פונקציה ספציפית להחלפת הפונקציה makeNewTurn בפרוקסי
 * משתמשת בפונקציה הגנרית setFunctionProxy
 *
 * @returns {boolean} - האם ההחלפה הצליחה
 */
function setProxy() {
  const context1 =
    window.PIXI.game.state.states.boot.add.world.parent.children[2].children[0]
      .events["_onInputDown"]["_bindings"][0].context.input.interactiveItems
      .list[1].sprite.events["_onInputDown"]["_bindings"][0].context;
  const context2 = window.PIXI.game.state.states.game.makeNewTurn;
  const funcName = "makeNewTurn";

  const beforeCall = () => console.log("message");

  return [
    setFunctionProxy(context1, funcName, { beforeCall }),
    setFunctionProxy(context2, funcName, { beforeCall }),
  ];
}

// ייצוא הפונקציות אם נמצאים בסביבת מודולים
if (typeof module !== "undefined" && module.exports) {
  module.exports = { setProxy, setFunctionProxy, proxyAnyFunction };
}
