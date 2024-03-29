import { wrapDispose } from "./wrapDispose";
import { OmnibusRegistrator } from "./Registrator";
import { CallbackType, Definitions, ReverseParameters, Transformers, UnregisterCallback } from "./types";
import { BusBuilder } from "./BusBuilder";

type UnregistratorOrPromise<Cb, Event> = Exclude<Cb, undefined> extends never ? UnregisterCallback : Promise<Event>

export class Omnibus<EventDefinitions extends Record<keyof EventDefinitions, unknown[]> = Record<string, unknown[]>, OmitKeys extends string = ''> {
    #callbacks: Map<keyof EventDefinitions, Array<CallbackType<EventDefinitions[keyof EventDefinitions]>>>;
    #transformers: Transformers<EventDefinitions>
    
    constructor(transformers?: Transformers<EventDefinitions>) {
        this.#callbacks = new Map();
        this.#transformers = transformers || new Map();

        this.on = this.on.bind(this)
    }

    static builder() {
        return new BusBuilder()
    }

    on<T extends keyof EventDefinitions>(event: T, fn: CallbackType<EventDefinitions[T]>): UnregisterCallback {
        if (!this.#callbacks.has(event)) {
            this.#callbacks.set(event, []);
        }
        const arr = this.#callbacks.get(event);
        arr.push(fn as unknown as CallbackType<EventDefinitions[keyof EventDefinitions]>);
        return wrapDispose(() => {
            this.off(event, fn);
        })
    }

    once<T extends keyof EventDefinitions>(event: T): Promise<EventDefinitions[T]>;
    once<T extends keyof EventDefinitions, const Cb extends CallbackType<EventDefinitions[T]>>(event: T, cb: Cb): UnregisterCallback;
    once<T extends keyof EventDefinitions, const Cb extends undefined | CallbackType<EventDefinitions[T]>>(event: T, cb?: Cb): UnregistratorOrPromise<typeof cb, EventDefinitions[T]> {
        if (cb) {
            const callback = (...d: EventDefinitions[T]) => {
                this.off(event, callback)
                cb(...d)
            }

            return this.on(event, callback) as UnregistratorOrPromise<Cb, EventDefinitions[T]>
        }
        return new Promise((resolve => {
            const unregister = this.on(event, (...data) => {
                unregister()
                if (data.length === 1) {
                    resolve(data[0] as any)
                } else {
                    resolve(data as any)
                }
            })
        })) as UnregistratorOrPromise<Cb, EventDefinitions[T]>
    }

    off<T extends keyof EventDefinitions>(event: T, fn: CallbackType<EventDefinitions[T]>): void {
        const callbacks = this.#callbacks.get(event) || [];
        this.#callbacks.set(event, callbacks.filter(f => f !== fn));
    }

    offAll(): void {
        this.#callbacks = new Map();
    }

    async trigger<T extends keyof Omit<EventDefinitions, OmitKeys>>(event: T, ...args: EventDefinitions[T]): Promise<void> {
        const calls = this.#callbacks.get(event) || [];
        
        await Promise
            .all(calls
                .map(c => c(...args))
            )
            .then(() => { return });
        
        if (this.#transformers.has(event)) {
            await Promise.all(this.#transformers.get(event).map(({ targetKey, transformer }) => {
                return transformer( (...d) => this.trigger(targetKey as any, ...d as any), ...args as any)
            }))
        }
    }

    getRegistrator(): OmnibusRegistrator<EventDefinitions> {
        return new OmnibusRegistrator(this);
    }
}

export type OmnibusEvents<O extends Omnibus<any>> = O extends Omnibus<infer E> ? E : never

export type OmnibusEventPayload<O extends Omnibus<any>, K extends keyof OmnibusEvents<O>> = OmnibusEvents<O>[K]
