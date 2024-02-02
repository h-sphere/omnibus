import { BuildableBuilder, Builder } from "./Builder";
import { Omnibus } from "./Omnibus";
import { Definitions, Transformers, Parameters } from "./types";

type FlatType<T> = T extends object ? { [K in keyof T]: FlatType<T[K]> } : T


type CallbackRegistrator<T extends string, P extends Array<any>> = (key: T, cb: (...x: P) => any) => any

type OldschoolOnRegistrator<T extends string, P extends Array<any>> = Record<`on${T}`, (...val: P) => void>

type AddEventListenerRegistrator<T extends string, P extends Array<any>> = { 
    addEventListener: (k: T, cb: (...v: P) => any) => any
}


type OnRegistrator<T, P extends Array<any>> = {
    on: (k: T, cb: (...v: P) => any) => any
}

type FromType<T extends string, P extends Array<any>> = CallbackRegistrator<T, P> | OldschoolOnRegistrator<T, P> | AddEventListenerRegistrator<T, P> | Omnibus<any> | OnRegistrator<T, P>

export type TypeKeys<T> = T extends OldschoolOnRegistrator<any, any>
    ? RemoveOn<keyof T & `on${string}`>
    : T extends Omnibus<infer B>
        ? keyof B
        : T extends FromType<infer K, any>
            ? K
            : never

export type CallbackType<T extends FromType<K, any>, K extends string> = T extends Omnibus<infer X>
    ? K extends keyof X
        ? X[K]
        : never
    : T extends OldschoolOnRegistrator<K, infer P>
        ? P 
        : T extends FromType<K, infer P>
            ? P
            : never

type RemoveOn<T> = T extends `on${infer P}` ? P : never

type SecondIfUndefned<T, J> = Exclude<T, undefined> extends never ? J : T

const isOldschoolOnRegistrator = <T extends string, P extends Array<any>>(b: FromType<T, P>, e: string): b is OldschoolOnRegistrator<T, P> => {
    return !!b[`on${e}`] && typeof b[`on${e}`] === 'function'
}

const isEventListenerRegistrator = <T extends string, P extends Array<any>>(b: FromType<T, P>): b is AddEventListenerRegistrator<T, P> => {
    return !!b['addEventListener'] && typeof b['addEventListener'] === 'function'
}

const isCallbackRegistrator = <T extends string, P extends Array<any>>(b: FromType<T, P>): b is CallbackRegistrator<T, P> => {
    return typeof b === 'function'
}

const isOmnibusRegistrator = <T extends string, P extends Array<any>>(b: FromType<T, P>): b is Omnibus<any, any> => {
    return !!b['on'] && typeof b['on'] === 'function'
}


export class BusBuilder<D extends Definitions = {}, OmitKeys extends string = ''> {
    #transformers: Transformers<D> = new Map()
    register<N extends string, T>(name: N, _: Builder<Parameters<T>>) {
        return this as unknown as BusBuilder<FlatType<D & Record<N, Parameters<T>>>, OmitKeys>
    }

    derive<T extends string, Der extends keyof D, Inp, Res extends Parameters<any>>(targetKey: T, sourceKey: Der, fn: (b: Builder<D[Der], D[Der]>) => Builder<D[Der], Res>) {
        if (!this.#transformers.has(sourceKey)) {
            this.#transformers.set(sourceKey, [])
        }
        const transformer = (fn(new BuildableBuilder()) as unknown as BuildableBuilder<Parameters<Inp>, Parameters<Res>>).build()
        this.#transformers.set(sourceKey, [
            ...this.#transformers.get(sourceKey),
            {
                targetKey,
                transformer,
            }
        ])
        return this as unknown as BusBuilder<FlatType<D & Record<T, Parameters<Res>>>, OmitKeys>
    }


    #registers: ((b: Omnibus) => void)[] = []
    from<const T extends string, Ret extends FromType<T, any>, const K extends string>(bus: Ret, event: TypeKeys<Ret>, newEvent?: K) {

        const register = (omnibus: Omnibus) => {
            if (isEventListenerRegistrator(bus)) {
                // FIXME: add unregister somewhere.
                const cb = (...v) => {
                    omnibus.trigger(newEvent || event, ...v)
                }
                bus.addEventListener(event as any, cb)
            }

            if (isOmnibusRegistrator(bus)) {
                bus.on(event, (...v) => omnibus.trigger(newEvent || event, ...v))
            }

            if (isOldschoolOnRegistrator(bus, event as string)) {
                const prevCall = (bus as any)[`on${event as string}`]
                (bus as any)[`on${event as string}`] = (...v) => {
                    omnibus.trigger(newEvent || event, ...v)
                    return prevCall(...v)
                }
                return
            }
            if (isCallbackRegistrator(bus)) {
                bus(event as any, (...v) => omnibus.trigger(newEvent || event, ...v))
                return
            }
        }

        this.#registers.push(register)

        return this as unknown as BusBuilder<D & Record<SecondIfUndefned<typeof newEvent, typeof event>, CallbackType<Ret, typeof event extends T ? typeof event : never>>, OmitKeys | SecondIfUndefned<typeof newEvent, typeof event>>
    }

    build() {
        const bus = new Omnibus<FlatType<D>, OmitKeys>(this.#transformers)

        // FIXME: probably needs to move this into omnibus itself to allow destructing.
        this.#registers
            .forEach(r => r(bus as Omnibus<any>))

        return bus
    }

    static init() {
        return new BusBuilder()
    }
}