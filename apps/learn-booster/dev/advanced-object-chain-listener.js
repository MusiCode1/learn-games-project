// ==UserScript==
// @name         Advanced Chain Object Creation Listener
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  מאזין מדורג מתקדם ליצירת אובייקטים בשרשרת והזרקת קוד
// @author       ThzoharHalev
// @match        https://gingim.net/wp-content/uploads/new_games/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // מערך השרשרת של האובייקטים שאנחנו רוצים לנטר
    const objectChain = ['window', 'PIXI', 'game', 'state', 'states', 'game', 'makeNewTurn'];
    
    // מעקב אחר האובייקטים שכבר נוצרו
    const createdObjects = {
        'window': window
    };
    
    // פונקציה שתוזרק כאשר makeNewTurn נוצר
    function injectCode(makeNewTurnFunction) {
        console.log('makeNewTurn נוצר!', makeNewTurnFunction);
        
        // שמירת הפונקציה המקורית
        const originalMakeNewTurn = makeNewTurnFunction;
        
        // החלפת הפונקציה
        return function() {
            console.log('makeNewTurn הופעל עם הפרמטרים:', arguments);
            
            // כאן אפשר להוסיף לוגיקה נוספת לפני הפעלת הפונקציה המקורית
            
            // הפעלת הפונקציה המקורית עם הפרמטרים המקוריים
            const result = originalMakeNewTurn.apply(this, arguments);
            
            // כאן אפשר להוסיף לוגיקה נוספת אחרי הפעלת הפונקציה המקורית
            
            return result;
        };
    }
    
    // פונקציה שבודקת אם כל השרשרת קיימת
    function checkFullChain() {
        let current = window;
        
        for (let i = 1; i < objectChain.length; i++) {
            const prop = objectChain[i];
            if (!current || !current[prop]) {
                return false;
            }
            current = current[prop];
        }
        
        return true;
    }
    
    // פונקציה שמחפשת את האובייקט האחרון בשרשרת שכבר קיים
    function findLastExistingObject() {
        let current = window;
        let lastIndex = 0;
        
        for (let i = 1; i < objectChain.length; i++) {
            const prop = objectChain[i];
            if (!current || !current[prop]) {
                break;
            }
            current = current[prop];
            lastIndex = i;
        }
        
        return {
            object: current,
            index: lastIndex
        };
    }
    
    // פונקציה רקורסיבית שיוצרת מאזינים לכל שלב בשרשרת
    function createChainListener(currentObject, chainIndex, parentPath) {
        // אם הגענו לסוף השרשרת, אין צורך ליצור מאזין נוסף
        if (chainIndex >= objectChain.length) {
            return;
        }
        
        const currentPath = objectChain[chainIndex];
        const fullPath = parentPath ? `${parentPath}.${currentPath}` : currentPath;
        
        // אם זה השלב הראשון (window), נתחיל מיד עם השלב הבא
        if (currentPath === 'window') {
            createChainListener(window, chainIndex + 1, '');
            return;
        }
        
        console.log(`מנטר יצירת: ${fullPath}`);
        
        // אם האובייקט כבר קיים, נמשיך לשלב הבא
        if (currentObject[currentPath]) {
            console.log(`${fullPath} כבר קיים, ממשיך לשלב הבא`);
            
            // שמירת האובייקט במעקב
            createdObjects[fullPath] = currentObject[currentPath];
            
            // אם זה השלב האחרון (makeNewTurn), נזריק את הקוד
            if (chainIndex === objectChain.length - 1) {
                console.log(`מזריק קוד ל-${fullPath}`);
                currentObject[currentPath] = injectCode(currentObject[currentPath]);
            } else {
                // אחרת, נמשיך לשלב הבא
                createChainListener(currentObject[currentPath], chainIndex + 1, fullPath);
            }
            return;
        }
        
        // האובייקט לא קיים עדיין, נגדיר מאזין ליצירה שלו
        let value = currentObject[currentPath];
        
        try {
            Object.defineProperty(currentObject, currentPath, {
                configurable: true,
                enumerable: true,
                get: function() {
                    // אם זה השלב האחרון (makeNewTurn), נוסיף לוג בגטר
                    if (chainIndex === objectChain.length - 1) {
                        console.log(`הגטר של ${fullPath} נקרא!`);
                    }
                    return value;
                },
                set: function(newValue) {
                    console.log(`${fullPath} נוצר!`, newValue);
                    value = newValue;
                    
                    // שמירת האובייקט במעקב
                    createdObjects[fullPath] = newValue;
                    
                    // אם זה השלב האחרון (makeNewTurn), נזריק את הקוד
                    if (chainIndex === objectChain.length - 1) {
                        console.log(`מזריק קוד ל-${fullPath}`);
                        value = injectCode(newValue);
                    } else {
                        // אחרת, נמשיך לשלב הבא
                        createChainListener(value, chainIndex + 1, fullPath);
                    }
                    
                    // החזרת האובייקט למצב רגיל כדי למנוע overhead - רק אם זה לא השלב האחרון
                    if (chainIndex !== objectChain.length - 1) {
                        try {
                            Object.defineProperty(currentObject, currentPath, {
                                configurable: true,
                                enumerable: true,
                                writable: true,
                                value: value
                            });
                        } catch (e) {
                            console.error(`שגיאה בהחזרת האובייקט ${fullPath} למצב רגיל:`, e);
                        }
                    } else {
                        console.log(`משאיר את הגטר/סטר עבור ${fullPath} כדי לנטר קריאות לפונקציה`);
                    }
                }
            });
        } catch (e) {
            console.error(`שגיאה בהגדרת מאזין ל-${fullPath}:`, e);
            
            // ניסיון חלופי - בדיקה מחזורית
            const checkInterval = setInterval(function() {
                if (currentObject[currentPath]) {
                    console.log(`${fullPath} נוצר (זוהה בבדיקה מחזורית)!`, currentObject[currentPath]);
                    clearInterval(checkInterval);
                    
                    // שמירת האובייקט במעקב
                    createdObjects[fullPath] = currentObject[currentPath];
                    
                    // אם זה השלב האחרון (makeNewTurn), נזריק את הקוד
                    if (chainIndex === objectChain.length - 1) {
                        console.log(`מזריק קוד ל-${fullPath}`);
                        currentObject[currentPath] = injectCode(currentObject[currentPath]);
                    } else {
                        // אחרת, נמשיך לשלב הבא
                        createChainListener(currentObject[currentPath], chainIndex + 1, fullPath);
                    }
                }
            }, 100);
            
            // הפסקת הבדיקה אחרי זמן סביר למניעת דליפת זיכרון
            setTimeout(function() {
                clearInterval(checkInterval);
            }, 60000);
        }
    }
    
    // בדיקה אם השרשרת כבר קיימת במלואה
    if (checkFullChain()) {
        console.log('השרשרת המלאה כבר קיימת!');
        
        // הזרקת הקוד ישירות
        console.log(`הזרקת קוד ישירות לשרשרת: ${objectChain.join('.')}`);
        let current = window;
        
        for (let i = 1; i < objectChain.length - 1; i++) {
            current = current[objectChain[i]];
        }
        
        const lastProp = objectChain[objectChain.length - 1];
        current[lastProp] = injectCode(current[lastProp]);
    } else {
        // מציאת האובייקט האחרון בשרשרת שכבר קיים
        const lastExisting = findLastExistingObject();
        
        // התחלת התהליך מהאובייקט האחרון שקיים
        createChainListener(lastExisting.object, lastExisting.index + 1, objectChain.slice(0, lastExisting.index + 1).join('.'));
    }
    
    // בדיקה מחזורית נוספת למקרה שהמאזינים לא עבדו
    const backupInterval = setInterval(function() {
        if (checkFullChain()) {
            console.log('השרשרת המלאה זוהתה בבדיקה מחזורית!');
            clearInterval(backupInterval);
            
            // בדיקה אם כבר הזרקנו את הקוד
            const lastPropPath = objectChain.slice(0, objectChain.length).join('.');
            console.log(`בדיקה אם כבר הזרקנו קוד לשרשרת: ${lastPropPath}`);
            if (!createdObjects[lastPropPath]) {
                let current = window;
                
                for (let i = 1; i < objectChain.length - 1; i++) {
                    current = current[objectChain[i]];
                }
                
                const lastProp = objectChain[objectChain.length - 1];
                current[lastProp] = injectCode(current[lastProp]);
            }
        }
    }, 500);
    
    // הפסקת הבדיקה אחרי זמן סביר למניעת דליפת זיכרון
    setTimeout(function() {
        clearInterval(backupInterval);
    }, 60000);
    
    console.log('מאזין השרשרת המתקדם הופעל');
})();