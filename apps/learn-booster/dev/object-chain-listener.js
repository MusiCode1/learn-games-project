// ==UserScript==
// @name         Chain Object Creation Listener
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  מאזין מדורג ליצירת אובייקטים בשרשרת והזרקת קוד
// @author       ThzoharHalev
// @match        https://www.gingim.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // מערך השרשרת של האובייקטים שאנחנו רוצים לנטר
    const objectChain = ['window', 'PIXI', 'game', 'state', 'states', 'game', 'makeNewTurn'];
    
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
        
        Object.defineProperty(currentObject, currentPath, {
            configurable: true,
            enumerable: true,
            get: function() {
                return value;
            },
            set: function(newValue) {
                console.log(`${fullPath} נוצר!`, newValue);
                value = newValue;
                
                // אם זה השלב האחרון (makeNewTurn), נזריק את הקוד
                if (chainIndex === objectChain.length - 1) {
                    console.log(`מזריק קוד ל-${fullPath}`);
                    value = injectCode(newValue);
                } else {
                    // אחרת, נמשיך לשלב הבא
                    createChainListener(value, chainIndex + 1, fullPath);
                }
                
                // החזרת האובייקט למצב רגיל כדי למנוע overhead
                Object.defineProperty(currentObject, currentPath, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: value
                });
            }
        });
    }
    
    // התחלת התהליך
    createChainListener(null, 0, '');
    
    console.log('מאזין השרשרת הופעל');
})();