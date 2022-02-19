export type CallbackType<T extends any[]> = (...args: T) => (Promise<void> | void);
export type UnregisterCallback = () => void;