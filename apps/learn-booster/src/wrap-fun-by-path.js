

export function getFunctionByPath(path) {

    const isNumber = (v) => !isNaN(v);

    const splitPath = (path) => path.split(/[\.\[\]]+/).filter(Boolean);

    if (!path) return;

    const pathParts = splitPath(path);

    const funcName = pathParts.pop();

    let context = window;
    for (let i = 0; i < pathParts.length; i++) {

        const key = isNumber(pathParts[i]) ? Number(pathParts[i]) : pathParts[i];

        context = context[key];
    }

    const func = context[funcName];

    return { func, context, funcName };
}

function wrapFunction(resultObject, fnCallbackBefore, fnCallbackAfter) {

    const { func, context, funcName } = resultObject;

    context[funcName] = function (...args) {
        if (fnCallbackBefore) fnCallbackBefore();
        const result = func.apply(this, args);
        if (fnCallbackAfter) fnCallbackAfter();

        return result;
    };
}

export function wrapFunctionByPath(path, fnCallbackBefore = null, fnCallbackAfter = null) {

    const resultObject = getFunctionByPath(path);
    wrapFunction(resultObject, fnCallbackBefore, fnCallbackAfter);
}
