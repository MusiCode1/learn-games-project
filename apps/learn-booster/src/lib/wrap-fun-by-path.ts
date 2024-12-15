interface FunctionResult {
    func: Function;
    context: any;
    funcName: string;
}

type CallbackFunction = () => void;

export function getFunctionByPath(path: string): FunctionResult | undefined {
    
    const isNumber = (v: any): boolean => !isNaN(v);
    const splitPath = (path: string): string[] => path.split(/[\.\[\]]+/).filter(Boolean);

    if (!path) return;

    const pathParts = splitPath(path);
    const funcName = pathParts.pop()!;

    let context: any = window;
    for (let i = 0; i < pathParts.length; i++) {
        const key = isNumber(pathParts[i]) ? Number(pathParts[i]) : pathParts[i];
        context = context[key];
    }

    const func = context[funcName];

    return { func, context, funcName };
}

function wrapFunction(
    resultObject: FunctionResult,
    fnCallbackBefore: CallbackFunction | null,
    fnCallbackAfter: CallbackFunction | null
): void {
    const { func, context, funcName } = resultObject;

    context[funcName] = function (this: any, ...args: any[]): any {
        if (fnCallbackBefore) fnCallbackBefore();
        const result = func.apply(this, args);
        if (fnCallbackAfter) fnCallbackAfter();

        return result;
    };
}

export function wrapFunctionByPath(
    path: string,
    fnCallbackBefore: CallbackFunction | null = null,
    fnCallbackAfter: CallbackFunction | null = null
): void {
    const resultObject = getFunctionByPath(path);
    if (resultObject) {
        wrapFunction(resultObject, fnCallbackBefore, fnCallbackAfter);
    }
}
