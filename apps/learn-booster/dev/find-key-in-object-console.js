/**
 * מחפש מפתח באופן איטרטיבי בתוך אובייקט ומחזיר את הנתיב אליו
 * @param {Object|Array} obj האובייקט שבו יש לחפש
 * @param {string} keyToFind המפתח שיש לחפש
 * @param {boolean} [findAll=false] האם לחפש את כל המופעים
 * @param {number} [maxDepth=100] עומק מקסימלי לחיפוש
 * @returns {string|string[]|null} נתיב למפתח או מערך של נתיבים, בהתאם לפרמטר findAll
 */
function findKeyInObject(obj, keyToFind, findAll = false, maxDepth = 100) {
  // פונקציית עזר - בודקת אם מחרוזת היא מזהה JS חוקי
  function isValidIdentifier(str) {
    // מזהה חוקי מתחיל באות, $ או _, ומכיל רק אותיות, ספרות, $ ו-_
    return /^[a-zA-Z$_][a-zA-Z0-9$_]*$/.test(str);
  }

  // פונקציית עזר - בונה נתיב JS חוקי
  function buildPath(currentPath, key) {
    // אם הנתיב ריק, מחזירים רק את המפתח
    if (!currentPath) {
      return isValidIdentifier(key) ? key : `["${key}"]`;
    }

    // אם המפתח הוא מזהה חוקי, משתמשים בנקודה
    if (isValidIdentifier(key)) {
      return `${currentPath}.${key}`;
    }

    // אחרת, משתמשים בסוגריים מרובעים
    return `${currentPath}["${key}"]`;
  }

  // בדיקות תקינות
  if (obj === null || obj === undefined) {
    return findAll ? [] : null;
  }

  // מערך לשמירת התוצאות
  const paths = [];

  // מחסנית לניהול החיפוש האיטרטיבי
  // כל איבר במחסנית מכיל את האובייקט הנוכחי והנתיב אליו
  const stack = [{ currentObj: obj, path: "", depth: 0 }];

  // סט לשמירת נתיבים שכבר נבדקו (למניעת לולאות אינסופיות)
  const visitedPaths = new Set();

  // לולאה ראשית - כל עוד יש איברים במחסנית
  while (stack.length > 0) {
    // הוצאת האיבר האחרון מהמחסנית
    const { currentObj, path, depth } = stack.pop();

    // בדיקה אם האובייקט הוא null או undefined
    if (currentObj === null || currentObj === undefined) {
      continue;
    }

    // בדיקה אם הנתיב כבר נבדק (למניעת לולאות אינסופיות)
    const objPath = JSON.stringify({ path, obj: typeof currentObj === 'object' ? Object.keys(currentObj) : currentObj });
    if (visitedPaths.has(objPath)) {
      continue;
    }
    
    // סימון הנתיב כנבדק
    visitedPaths.add(objPath);

    // בדיקה אם הגענו לעומק המקסימלי
    if (depth >= maxDepth) {
      continue;
    }

    // הערה: הסימון של הנתיב כנבדק כבר נעשה למעלה

    try {
      // מעבר על כל המפתחות באובייקט הנוכחי
      if (typeof currentObj === "object" && !Array.isArray(currentObj)) {
        for (const key in currentObj) {
          try {
            // בדיקה אם המפתח הנוכחי זהה למפתח המבוקש
            if (key === keyToFind) {
              // בניית הנתיב המלא למפתח
              const fullPath = buildPath(path, key);
              paths.push(fullPath);
              console.log(fullPath);

              // אם לא מחפשים את כל המופעים, מחזירים את המופע הראשון ומפסיקים את החיפוש
              if (!findAll) {
                
                return fullPath;
              }
              // אם מחפשים את כל המופעים, ממשיכים בחיפוש
            }

            // בדיקה אם הערך הוא אובייקט או מערך
            let value;
            try {
              value = currentObj[key];
            } catch {
              // התעלם משגיאות גישה לערכים
              continue;
            }

            if (value !== null && typeof value === "object") {
              // בניית הנתיב החדש
              const newPath = buildPath(path, key);

              // הוספת האובייקט למחסנית עם הנתיב המעודכן
              stack.push({
                currentObj: value,
                path: newPath,
                depth: depth + 1,
              });
            }
          } catch {
            // התעלם משגיאות בעת עיבוד מפתח ספציפי
            continue;
          }
        }
      }

      // אם האובייקט הוא מערך, נבדוק גם את האינדקסים שלו
      if (Array.isArray(currentObj)) {
        for (let i = 0; i < currentObj.length; i++) {
          try {
            // בדיקה אם האינדקס עצמו הוא המפתח המבוקש
            if (String(i) === keyToFind) {
              // בניית הנתיב המלא לאינדקס
              const fullPath = path ? `${path}[${i}]` : `[${i}]`;
              paths.push(fullPath);

              // אם לא מחפשים את כל המופעים, מחזירים את המופע הראשון
              if (!findAll) {
                return fullPath;
              }
            }

            const value = currentObj[i];
            
            // בניית הנתיב החדש עם אינדקס המערך
            const newPath = path ? `${path}[${i}]` : `[${i}]`;
            
            // אם הערך הוא אובייקט, נוסיף אותו למחסנית
            if (value !== null && typeof value === "object") {
              // הוספת האובייקט למחסנית
              stack.push({
                currentObj: value,
                path: newPath,
                depth: depth + 1,
              });
            }
          } catch {
            // התעלם משגיאות בעת עיבוד איבר במערך
            continue;
          }
        }
      }
    } catch {
      // התעלם משגיאות כלליות בעת עיבוד האובייקט
      continue;
    }
  }

  // החזרת התוצאה
  if (findAll) {
    return paths;
  }

  return paths.length > 0 ? paths[0] : null;
}

// דוגמאות שימוש - אפשר להעתיק ולהדביק בקונסול הדפדפן
// דוגמה 1: חיפוש מפתח בודד
const obj1 = { a: { b: { c: 1 } }, d: { c: 2 } };
console.log("דוגמה 1:", findKeyInObject(obj1, "c")); // 'a.b.c'

// דוגמה 2: חיפוש כל המופעים
console.log("דוגמה 2:", findKeyInObject(obj1, "c", true)); // ['a.b.c', 'd.c']

// דוגמה 3: מפתח עם תווים מיוחדים
const obj2 = { a: { "b.c": { d: 1 } } };
console.log("דוגמה 3:", findKeyInObject(obj2, "b.c")); // 'a["b.c"]'

// דוגמה 4: חיפוש במערכים
const obj3 = { a: [{ b: 1 }, { c: 2 }] };
console.log("דוגמה 4:", findKeyInObject(obj3, "c")); // 'a[1].c'

// דוגמה 5: אובייקט מחזורי
const obj4 = { a: { b: {} } };
obj4.a.b.c = obj4; // יוצר מחזוריות
console.log("דוגמה 5:", findKeyInObject(obj4, "c")); // 'a.b.c'

// דוגמה 6: הגבלת עומק החיפוש
console.log("דוגמה 6:", findKeyInObject(obj1, "c", false, 1)); // null (כי 'c' נמצא בעומק 2)

// דוגמה 7: חיפוש אינדקס במערך
const obj5 = [{ a: 1 }, { b: 2 }, { c: 3 }];
console.log("דוגמה 7:", findKeyInObject(obj5, "1")); // '[1]'

// דוגמה 8: חיפוש כל המופעים של אינדקס במערך
const obj6 = { arr1: [1, 2], arr2: [3, 4] };
console.log("דוגמה 8:", findKeyInObject(obj6, "0", true)); // ['arr1[0]', 'arr2[0]']
