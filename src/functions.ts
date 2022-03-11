import { CallbackType } from ".";

export const delay = <T extends []>(callback: CallbackType<T>, delayInMs: number): CallbackType<T> => {
    return (...args: T) => {
        setInterval(() => callback(...args), delayInMs);
    }
};

export const filter = <T extends []>(callback: CallbackType<T>, filterFunction: (currentArgument: T | null, previousArgument: T) => boolean): CallbackType<T> => {
    let previous: T = null;
    return (...args: T) => {
        if (filterFunction(args, previous)) {
            previous = args;
            callback(...args);
        }
    }
};

const compareObjects = (a: unknown, b: unknown): boolean => {
    if (
           typeof a === "number"
        || typeof a === "string"
        || typeof a === "boolean"
        || typeof a === "bigint"
        || typeof a === "function"
        || typeof a === "symbol"
    ) {
        return a === b;
    }
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return false;
        }
        return a.reduce((acc, val, idx) => {
            return acc && compareObjects(val, b[idx]);
        }, true);
    }
    if (typeof a === "object") {
        if (typeof b !== "object") {
            return false;
        }
        return Object.keys(a).reduce((acc, key) => {
            return acc && compareObjects(a[key], b[key]);
        }, true);
    }
};

export const skipDuplicates = <T extends []>(callback: CallbackType<T>): CallbackType<T> => {
    return filter(callback, (a,b) => !compareObjects(a,b));
};

export const throttle = <T extends []>(callback: CallbackType<T>, timeInMs: number): CallbackType<T> => {
    let lastCallback = -1;
    return (...args: T) => {
        let time = Date.now();
        if (lastCallback + timeInMs < time) {
            lastCallback = time;
            callback(...args);
        }
    }
};

export const debounce = <T extends []>(callback: CallbackType<T>, timeInMs: number): CallbackType<T> => {
    let delayHandle = null;
    return (...args: T) => {
        if (delayHandle) {
            clearTimeout(delayHandle);
        }
        delayHandle = setTimeout(() => {
            callback(...args);
            delayHandle = null;
        }, timeInMs);
    }
}