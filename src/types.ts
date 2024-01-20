export type CallbackType<T extends any[]> = (...args: T) => (Promise<void> | void);
export type UnregisterCallback = () => void;
export type Parameters<T> = T extends Array<infer K> ? K[] : T[];

export type Definitions = Record<string, Parameters<any>>;

// export type Definitions = {[ key in string]: Parameters<any> }

// export type Definitions<T = any> = Record<keyof T, unknown[]>

export type Trigger = (data: any) => Promise<void>;
export interface Transform<D extends Definitions> {
    targetKey: keyof D;
    transformer: (t: Trigger, ...d: any) => Promise<void>;
}
export type Transformers<D extends Definitions> = Map<keyof D, undefined | Transform<D>[]>;

