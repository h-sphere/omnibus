import { Omnibus } from "./Omnibus";
import { CallbackType } from "./types";

export class OmnibusRegistrator<EventDefinition extends Record<keyof EventDefinition, unknown[]> = Record<string, unknown[]>> {
    #bus: Omnibus<EventDefinition>;
    #registered: Array<{
        name: keyof EventDefinition,
        fn: CallbackType<EventDefinition[keyof EventDefinition]>,
        wrappedFn: CallbackType<EventDefinition[keyof EventDefinition]>
    }>;

    constructor(bus: Omnibus<EventDefinition>) {
        this.#bus = bus;
        this.#registered = [];
    }

    on<T extends keyof EventDefinition>(event: T, fn: CallbackType<EventDefinition[T]>): () => void {
        const wrappedFn: CallbackType<EventDefinition[T]> = (...args) => fn(...args)
        this.#bus.on(event, wrappedFn);
        this.#registered.push({
            name: event,
            wrappedFn,
            fn
        });
        return () => {
            this.off(event, wrappedFn);
        }
    }

    off<T extends keyof EventDefinition>(name: T, fn: CallbackType<EventDefinition[T]>): void {
        const properCall = this.#registered.find((entry) => entry.name === name && entry.fn === fn);
        if (!properCall) {
            throw new Error("Event you are trying to unregister was not registered via this Registrator");
        }
        this.#bus.off(name, properCall.wrappedFn);
        this.#registered = this.#registered.filter((entry) => !(entry.name === name && entry.fn === fn));
    }

    offAll(): void {
        this.#registered.forEach(({ name, wrappedFn }) => {
            this.#bus.off(name, wrappedFn);
        });
        this.#registered = [];
    }

    [Symbol.dispose]() {
        this.offAll()
    }
}