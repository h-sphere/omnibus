export type CallbackType<T extends any[]> = (...args: T) => (Promise<void> | void);
export type UnregisterCallback = () => void;
export type Parameters<T> = T extends Array<any> ? T : [T]

export type IsLengthConstant<X extends Array<any>> = X["length"] extends number ? number extends X["length"] ? false : true : false

export type PassOnlyConstantLength<X> = IsLengthConstant<Parameters<X>> extends true ? X : never

export type Definitions = Record<string, Parameters<any>>;

// export type Definitions = {[ key in string]: Parameters<any> }

// export type Definitions<T = any> = Record<keyof T, unknown[]>

export type Trigger = (data: any) => Promise<void>;
export interface Transform<D extends Definitions> {
    targetKey: keyof D;
    transformer: (t: Trigger, ...d: any) => Promise<void>;
}
export type Transformers<D extends Definitions> = Map<keyof D, undefined | Transform<D>[]>;
