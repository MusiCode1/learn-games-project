/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface FunctionResult {
    func: Function;
    context: any;
    funcName: string;
}

type CallbackFunction = () => Promise<void>;

// הוספת טיפוס עבור חלון הדפדפן
declare const window: Window & typeof globalThis;

interface Context {
    [key: string]: any;
    [key: number]: any;
}

export function getFunctionByPath(path: string): FunctionResult | undefined {
    const isNumber = (v: unknown): boolean => !isNaN(Number(v));
    const splitPath = (path: string): string[] => path.split(/[.[\]]+/).filter(Boolean);

    if (!path) return;

    const pathParts = splitPath(path);
    const funcName = pathParts.pop()!;

    let context: Context = window;

    for (let i = 0; i < pathParts.length; i++) {
        if (!context) {
            return;
        }

        const key = isNumber(pathParts[i]) ? Number(pathParts[i]) : pathParts[i];
        const nextContext = context[key];

        // בדיקה שהערך הבא תקין לפני שממשיכים
        if (!nextContext) {
            return;
        }

        context = nextContext as Context;
    }

    // בדיקה אחרונה לפני גישה ל-funcName
    if (context === null || context === undefined) {
        return;
    }

    const func = context[funcName];

    if (!func) return;

    return { func, context, funcName };
}

function wrapFunction(
    resultObject: FunctionResult,
    fnCallbackBefore: CallbackFunction | null,
    fnCallbackAfter: CallbackFunction | null
): void {
    const { func, context, funcName } = resultObject;

    context[funcName] = async function (this: unknown, ...args: unknown[]): Promise<unknown> {
        if (fnCallbackBefore) await fnCallbackBefore();
        const result = func.apply(this, args);
        if (fnCallbackAfter) await fnCallbackAfter();

        return result;
    };
}

export function injectCodeIntoFunction(
    path: string,
    fnCallbackBefore: CallbackFunction | null = null,
    fnCallbackAfter: CallbackFunction | null = null
): void {
    const resultObject = getFunctionByPath(path);
    if (resultObject) {
        wrapFunction(resultObject, fnCallbackBefore, fnCallbackAfter);
    }
}



// eslint-disable-next-line @typescript-eslint/no-unused-vars
function example() {
    // הזרקת קוד לפונקציית היצירה של המשחק
    const createGamePath = 'PIXI.game.state.states.game.create';

    injectCodeIntoFunction(createGamePath, null, async () => { })
    // בדיקת תמיכה במשחק לאחר אתחול המשחק
}