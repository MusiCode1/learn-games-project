
export function searchFunInGlobal(funcName) {
    const results = new Set();

    function getPropertyAccessor(key) {
        return /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
    }

    function searchObject(obj, path = '', visited = new Set()) {
        if (visited.has(obj)) return;
        visited.add(obj);

        for (let key in obj) {
            try {
                const newPath = Array.isArray(obj) ? `${path}[${key}]` : `${path}${getPropertyAccessor(key)}`;

                if (typeof obj[key] === 'function' && key === funcName) {
                    results.add(newPath.replace(/^\./, ''));
                    if (window[key] === obj[key]) {
                        results.add(key);
                    }
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    searchObject(obj[key], newPath, visited);
                }
            } catch (e) {
                continue;
            }
        }
    }

    function searchDOM(element, path = '') {
        if (typeof element[funcName] === 'function') {
            results.add(`${path}${getPropertyAccessor(funcName)}`);
        }

        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];
            const childPath = `${path}${getPropertyAccessor('children')}[${i}]`;
            searchDOM(child, childPath);
        }

        // חיפוש ב-shadowRoot אם קיים
        if (element.shadowRoot) {
            searchDOM(element.shadowRoot, `${path}${getPropertyAccessor('shadowRoot')}`);
        }
    }

    // חיפוש בסקופ הגלובלי
    searchObject(window);

    // חיפוש ב-DOM
    searchDOM(document.documentElement, 'document.documentElement');

    // בדיקת הפניות ישירות בסקופ הגלובלי
    if (typeof window[funcName] === 'function') {
        results.add(funcName);
    }

    return Array.from(results).sort((a, b) => a.length - b.length);
}