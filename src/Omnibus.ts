import { OmnibusRegistrator } from "./Registrator";
import { CallbackType, UnregisterCallback } from "./types";

export class Omnibus<EventDefinition extends Record<keyof EventDefinition, unknown[]> = Record<string, unknown[]>> {
    #callbacks: Map<keyof EventDefinition, Array<CallbackType<EventDefinition[keyof EventDefinition]>>>;
    
    constructor() {
        this.#callbacks = new Map();
    }

    on<T extends keyof EventDefinition>(event: T, fn: CallbackType<EventDefinition[T]>): UnregisterCallback {
        if (!this.#callbacks.has(event)) {
            this.#callbacks.set(event, []);
        }
        const arr = this.#callbacks.get(event);
        arr.push(fn as unknown as CallbackType<EventDefinition[keyof EventDefinition]>);
        return () => {
            this.off(event, fn);
        }
    }

    off<T extends keyof EventDefinition>(event: T, fn: CallbackType<EventDefinition[T]>): void {
        const callbacks = this.#callbacks.get(event) || [];
        this.#callbacks.set(event, callbacks.filter(f => f !== fn));
    }

    offAll(): void {
        this.#callbacks = new Map();
    }

    async trigger<T extends keyof EventDefinition>(event: T, ...args: EventDefinition[T]): Promise<void> {
        const calls = this.#callbacks.get(event) || [];
        return Promise.all(calls.map(c => c(...args))).then(() => { return });
    }

    getRegistrator(): OmnibusRegistrator<EventDefinition> {
        return new OmnibusRegistrator(this);
    }
}