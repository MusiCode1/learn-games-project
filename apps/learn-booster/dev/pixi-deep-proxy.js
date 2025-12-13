// ==UserScript==
// @name         PIXI Deep Proxy for makeNewTurn
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  פרוקסי עמוק לניטור יצירת makeNewTurn בכל מקום בהיררכיה של PIXI
// @author       ThzoharHalev
// @match        https://gingim.net/wp-content/uploads/new_games/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // מיפוי של אובייקטים מקוריים לפרוקסי שלהם למניעת לולאות אינסופיות
    const proxyMap = new WeakMap();
    
    // פונקציה שתוזרק כאשר makeNewTurn נוצר
    function injectMakeNewTurn(originalFunction, path) {
        console.log('makeNewTurn נוצר בנתיב:', path);
        console.log('פונקציה מקורית:', originalFunction);
        
        // החלפת הפונקציה המקורית
        return function() {
            console.log(`makeNewTurn הופעל בנתיב: ${path}`);
            console.log('פרמטרים:', Array.from(arguments));
            console.log('קונטקסט (this):', this);
            
            // כאן אפשר להוסיף לוגיקה נוספת לפני הפעלת הפונקציה המקורית
            
            // הפעלת הפונקציה המקורית עם הפרמטרים המקוריים
            const result = originalFunction.apply(this, arguments);
            
            // כאן אפשר להוסיף לוגיקה נוספת אחרי הפעלת הפונקציה המקורית
            console.log(`makeNewTurn החזיר:`, result);
            
            return result;
        };
    }
    
    // מעקב אחר אובייקטים שכבר ביקרנו בהם למניעת לולאות אינסופיות
    const visitedObjects = new WeakSet();
    
    // פונקציה שבודקת אם אובייקט מכיל את הפונקציה makeNewTurn
    function scanForMakeNewTurn(obj, path) {
        if (obj === null || obj === undefined || typeof obj !== 'object' || visitedObjects.has(obj)) {
            return false;
        }
        
        // סימון האובייקט כמבוקר
        visitedObjects.add(obj);
        
        // בדיקה אם יש פונקציה בשם makeNewTurn
        if (typeof obj.makeNewTurn === 'function') {
            console.log(`מצאתי makeNewTurn בסריקה עמוקה בנתיב: ${path}.makeNewTurn`);
            
            // אם עוד לא החלפנו את הפונקציה, נחליף אותה
            if (!obj.__makeNewTurnReplaced) {
                console.log(`מחליף את makeNewTurn בנתיב: ${path}.makeNewTurn`);
                obj.makeNewTurn = injectMakeNewTurn(obj.makeNewTurn, `${path}.makeNewTurn`);
                obj.__makeNewTurnReplaced = true;
            }
            
            return true;
        }
        
        // איסוף כל המאפיינים של האובייקט
        let allKeys = [];
        
        try {
            // הוספת מאפיינים רגילים
            allKeys = allKeys.concat(Object.keys(obj));
            
            // הוספת מאפיינים שאינם ניתנים למנייה
            try {
                allKeys = allKeys.concat(Object.getOwnPropertyNames(obj).filter(key => !allKeys.includes(key)));
            } catch {
                // התעלם משגיאות
            }
            
            // טיפול מיוחד במערכים - הוספת אינדקסים
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                    if (!allKeys.includes(String(i))) {
                        allKeys.push(String(i));
                    }
                }
            }
            
            // מעבר על כל המאפיינים
            for (const key of allKeys) {
                try {
                    const value = obj[key];
                    if (value === null || typeof value !== 'object' || visitedObjects.has(value)) {
                        continue;
                    }
                    
                    // המשך חיפוש רקורסיבי באובייקט
                    const newPath = Array.isArray(obj) ? `${path}[${key}]` :
                                   (key.startsWith('_') || /[^a-zA-Z0-9_$]/.test(key)) ?
                                   `${path}['${key}']` : `${path}.${key}`;
                    
                    scanForMakeNewTurn(value, newPath);
                } catch {
                    // התעלם משגיאות גישה לתכונות
                }
            }
        } catch {
            // התעלם משגיאות לולאה
        }
        
        return false;
    }
    
    // פונקציה שיוצרת פרוקסי עמוק לאובייקט
    function createDeepProxy(target, path = '') {
        // אם הערך הוא null או undefined, אין צורך בפרוקסי
        if (target === null || target === undefined) {
            return target;
        }
        
        // אם הערך אינו אובייקט או פונקציה, אין צורך בפרוקסי
        if (typeof target !== 'object' && typeof target !== 'function') {
            return target;
        }
        
        // אם כבר יצרנו פרוקסי לאובייקט זה, נחזיר אותו
        if (proxyMap.has(target)) {
            return proxyMap.get(target);
        }
        
        // סריקה מיידית לחיפוש makeNewTurn
        scanForMakeNewTurn(target, path);
        
        // רשימת אובייקטים מובנים שלא כדאי לעטוף בפרוקסי
        const nativeObjects = [
            HTMLElement.prototype,
            Node.prototype,
            NodeList.prototype,
            HTMLCollection.prototype,
            Event.prototype
        ];
        
        // בדיקה אם האובייקט הוא אובייקט מובנה
        for (const nativeObj of nativeObjects) {
            if (target instanceof Object && Object.prototype.isPrototypeOf.call(nativeObj, target)) {
                return target; // לא עוטפים אובייקטים מובנים בפרוקסי
            }
        }
        
        // הגדרת ה-handler לפרוקסי
        const handler = {
            // יירוט גישה לתכונות
            get: function(obj, prop) {
                // בדיקה אם זו הפונקציה שאנחנו מחפשים
                if (prop === 'makeNewTurn') {
                    // קבלת הערך המקורי
                    const value = obj[prop];
                    
                    // בניית הנתיב המלא לתכונה
                    const currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    
                    // אם הערך הוא פונקציה, נחליף אותה
                    if (typeof value === 'function') {
                        console.log(`מצאתי את makeNewTurn בנתיב: ${currentPath}`);
                        
                        // אם עוד לא החלפנו את הפונקציה, נחליף אותה
                        if (!obj.__makeNewTurnReplaced) {
                            console.log(`מחליף את makeNewTurn בנתיב: ${currentPath}`);
                            obj[prop] = injectMakeNewTurn(value, currentPath);
                            obj.__makeNewTurnReplaced = true;
                        }
                    }
                    
                    return obj[prop];
                }
                
                // קבלת הערך המקורי
                const value = obj[prop];
                
                // אם הערך הוא אובייקט, נחזיר פרוקסי עמוק
                if (typeof value === 'object' && value !== null) {
                    // בניית הנתיב המלא לתכונה
                    let currentPath;
                    
                    // טיפול בנתיבים מיוחדים
                    if (Array.isArray(obj)) {
                        currentPath = `${path}[${prop}]`;
                    } else if (prop.startsWith('_') || /[^a-zA-Z0-9_$]/.test(prop)) {
                        currentPath = `${path}['${prop}']`;
                    } else {
                        currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    }
                    
                    // החזרת פרוקסי לאובייקט
                    return createDeepProxy(value, currentPath);
                }
                
                // אחרת, נחזיר את הערך כמו שהוא
                return value;
            },
            
            // יירוט הגדרת תכונות
            set: function(obj, prop, value) {
                // בדיקה אם זו פונקציה בשם makeNewTurn
                if (prop === 'makeNewTurn' && typeof value === 'function') {
                    // בניית הנתיב המלא לתכונה
                    const currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    console.log(`מגדיר makeNewTurn בנתיב: ${currentPath}`);
                    
                    // החלפת הפונקציה
                    obj[prop] = injectMakeNewTurn(value, currentPath);
                    obj.__makeNewTurnReplaced = true;
                    return true;
                }
                
                // הגדרת הערך כרגיל
                obj[prop] = value;
                
                // אם הערך החדש הוא אובייקט, נעטוף גם אותו בפרוקסי
                if (typeof value === 'object' && value !== null) {
                    const currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    obj[prop] = createDeepProxy(value, currentPath);
                }
                
                return true;
            },
            
            // יירוט הגדרת תכונות חדשות
            defineProperty: function(obj, prop, descriptor) {
                // בדיקה אם זו פונקציה בשם makeNewTurn
                if (prop === 'makeNewTurn' && descriptor.value && typeof descriptor.value === 'function') {
                    // בניית הנתיב המלא לתכונה
                    const currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    console.log(`מגדיר makeNewTurn באמצעות defineProperty בנתיב: ${currentPath}`);
                    
                    // שינוי הערך בדסקריפטור
                    descriptor.value = injectMakeNewTurn(descriptor.value, currentPath);
                    obj.__makeNewTurnReplaced = true;
                }
                
                // הגדרת התכונה באמצעות הדסקריפטור
                const result = Object.defineProperty(obj, prop, descriptor);
                
                // אם הערך החדש הוא אובייקט, נעטוף גם אותו בפרוקסי
                if (descriptor.value && typeof descriptor.value === 'object' && descriptor.value !== null) {
                    const currentPath = path ? `${path}.${String(prop)}` : String(prop);
                    obj[prop] = createDeepProxy(obj[prop], currentPath);
                }
                
                return result;
            }
        };
        
        // יצירת הפרוקסי
        const proxy = new Proxy(target, handler);
        
        // שמירת הפרוקסי במיפוי
        proxyMap.set(target, proxy);
        
        return proxy;
    }
    
    // פונקציה שמתחילה את הניטור
    function startMonitoring() {
        // בדיקה אם PIXI כבר קיים
        if (window.PIXI) {
            console.log('PIXI כבר קיים, מתחיל ניטור');
            window.PIXI = createDeepProxy(window.PIXI, 'PIXI');
        } else {
            console.log('PIXI עדיין לא קיים, מגדיר getter/setter');
            
            // שמירת הערך הנוכחי (אם יש)
            let pixiValue = window.PIXI;
            
            // הגדרת getter/setter לזיהוי יצירת PIXI
            Object.defineProperty(window, 'PIXI', {
                configurable: true,
                enumerable: true,
                get: function() {
                    return pixiValue;
                },
                set: function(newValue) {
                    console.log('PIXI נוצר!', newValue);
                    
                    // עטיפת האובייקט החדש בפרוקסי
                    pixiValue = createDeepProxy(newValue, 'PIXI');
                    
                    // החזרת האובייקט למצב רגיל
                    Object.defineProperty(window, 'PIXI', {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: pixiValue
                    });
                }
            });
        }
    }
    
    // פונקציה שסורקת נתיב ספציפי
    function scanSpecificPath() {
        // הנתיב המורכב שצוין
        const complexPath = 'window.PIXI.game.state.states.boot.add.world.parent.children[2].children[0]' +
            '.events["_onInputDown"]["_bindings"][0].context.input.interactiveItems' +
            '.list[1].sprite.events["_onInputDown"]["_bindings"][0].context';
        
        console.log(`מנסה לסרוק נתיב ספציפי: ${complexPath}`);
        
        try {
            // פירוק הנתיב לחלקים
            const parts = complexPath.split('.');
            let current = window;
            let currentPath = 'window';
            
            // מעבר על כל חלק בנתיב
            for (let i = 1; i < parts.length; i++) {
                let part = parts[i];
                
                // טיפול במערכים ובמפתחות עם תווים מיוחדים
                if (part.includes('[')) {
                    // מפריד את שם המאפיין מהאינדקס
                    const match = part.match(/([^[]+)(\[.+\])/);
                    if (match) {
                        const propName = match[1];
                        const indexPart = match[2];
                        
                        // עדכון הנתיב הנוכחי
                        currentPath += `.${propName}`;
                        
                        // גישה למאפיין
                        current = current[propName];
                        
                        // בדיקה אם האובייקט קיים
                        if (!current) {
                            console.log(`לא נמצא אובייקט בנתיב: ${currentPath}`);
                            return;
                        }
                        
                        // טיפול באינדקס או במפתח
                        const indexOrKey = indexPart.replace(/\[["']?([^"'\]]+)["']?\]/g, '$1');
                        
                        // עדכון הנתיב הנוכחי
                        currentPath += `[${indexOrKey}]`;
                        
                        // גישה לאיבר במערך או למפתח באובייקט
                        current = current[indexOrKey];
                    }
                } else {
                    // עדכון הנתיב הנוכחי
                    currentPath += `.${part}`;
                    
                    // גישה למאפיין
                    current = current[part];
                }
                
                // בדיקה אם האובייקט קיים
                if (!current) {
                    console.log(`לא נמצא אובייקט בנתיב: ${currentPath}`);
                    return;
                }
                
                // בדיקה אם האובייקט הנוכחי הוא אובייקט
                if (typeof current === 'object' && current !== null) {
                    // סריקה עמוקה של האובייקט
                    scanForMakeNewTurn(current, currentPath);
                    
                    // עטיפת האובייקט בפרוקסי
                    current = createDeepProxy(current, currentPath);
                    
                    // עדכון האובייקט בנתיב
                    let tempObj = window;
                    let tempParts = currentPath.split('.');
                    
                    for (let j = 1; j < tempParts.length - 1; j++) {
                        let tempPart = tempParts[j];
                        
                        // טיפול במערכים ובמפתחות עם תווים מיוחדים
                        if (tempPart.includes('[')) {
                            const tempMatch = tempPart.match(/([^[]+)(\[.+\])/);
                            if (tempMatch) {
                                const tempPropName = tempMatch[1];
                                const tempIndexPart = tempMatch[2];
                                
                                tempObj = tempObj[tempPropName];
                                
                                const tempIndexOrKey = tempIndexPart.replace(/\[["']?([^"'\]]+)["']?\]/g, '$1');
                                tempObj = tempObj[tempIndexOrKey];
                            }
                        } else {
                            tempObj = tempObj[tempPart];
                        }
                    }
                    
                    // עדכון האובייקט האחרון בנתיב
                    let lastPart = tempParts[tempParts.length - 1];
                    
                    // טיפול במערכים ובמפתחות עם תווים מיוחדים
                    if (lastPart.includes('[')) {
                        const lastMatch = lastPart.match(/([^[]+)(\[.+\])/);
                        if (lastMatch) {
                            const lastPropName = lastMatch[1];
                            const lastIndexPart = lastMatch[2];
                            
                            const lastIndexOrKey = lastIndexPart.replace(/\[["']?([^"'\]]+)["']?\]/g, '$1');
                            tempObj[lastPropName][lastIndexOrKey] = current;
                        }
                    } else {
                        tempObj[lastPart] = current;
                    }
                }
            }
            
            console.log(`סריקת הנתיב הספציפי הושלמה`);
        } catch (error) {
            console.error(`שגיאה בסריקת הנתיב הספציפי:`, error);
        }
    }
    
    // התחלת הניטור
    startMonitoring();
    
    // סריקת הנתיב הספציפי אחרי 5 שניות
    setTimeout(scanSpecificPath, 5000);
    
    // בדיקה מחזורית למקרה שהמאזין לא עבד
    const checkInterval = setInterval(function() {
        if (window.PIXI && !proxyMap.has(window.PIXI)) {
            console.log('PIXI זוהה בבדיקה מחזורית, מתחיל ניטור');
            window.PIXI = createDeepProxy(window.PIXI, 'PIXI');
            clearInterval(checkInterval);
        }
    }, 500);
    
    // הפסקת הבדיקה אחרי זמן סביר למניעת דליפת זיכרון
    setTimeout(function() {
        clearInterval(checkInterval);
    }, 60000);
    
    console.log('פרוקסי עמוק ל-PIXI הופעל');
})();