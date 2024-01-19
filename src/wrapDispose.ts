(Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export const wrapDispose = (fn: CallableFunction) => {
    const wrapped = () => fn()
    wrapped[(Symbol as any).dispose] = () => wrapped()
    return wrapped
}