import { wrapDispose } from "./wrapDispose";
import { OmnibusRegistrator } from "./Registrator";
import { CallbackType, Definitions, Transformers, UnregisterCallback } from "./types";
import { BusBuilder } from "./BusBuilder";

export class Omnibus<EventDefinitions extends Record<keyof EventDefinitions, unknown[]> = Record<string, unknown[]>> {
    #callbacks: Map<keyof EventDefinitions, Array<CallbackType<EventDefinitions[keyof EventDefinitions]>>>;
    #transformers: Transformers<EventDefinitions>
    
    constructor(transformers?: Transformers<EventDefinitions>) {
        this.#callbacks = new Map();
        this.#transformers = transformers || new Map();
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

    off<T extends keyof EventDefinitions>(event: T, fn: CallbackType<EventDefinitions[T]>): void {
        const callbacks = this.#callbacks.get(event) || [];
        this.#callbacks.set(event, callbacks.filter(f => f !== fn));
    }

    offAll(): void {
        this.#callbacks = new Map();
    }

    async trigger<T extends keyof EventDefinitions>(event: T, ...args: EventDefinitions[T]): Promise<void> {
        const calls = this.#callbacks.get(event) || [];
        
        await Promise
            .all(calls
                .map(c => c(...args))
            )
            .then(() => { return });
        
        if (this.#transformers.has(event)) {
            await Promise.all(this.#transformers.get(event).map(({ targetKey, transformer }) => {
                return transformer( (...d) => this.trigger(targetKey, ...d as any), ...args as any)
            }))
        }
    }

    getRegistrator(): OmnibusRegistrator<EventDefinitions> {
        return new OmnibusRegistrator(this);
    }
}