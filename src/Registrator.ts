import { Omnibus } from "./Omnibus";
import { CallbackType } from "./types";

export class OmnibusRegistrator<EventDefinition extends Record<keyof EventDefinition, unknown[]> = Record<string, unknown[]>> {
    #bus: Omnibus<EventDefinition>;
    #registered: Array<{ name: keyof EventDefinition, fn: CallbackType<EventDefinition[keyof EventDefinition]> }>;

    constructor(bus: Omnibus<EventDefinition>) {
        this.#bus = bus;
        this.#registered = [];
    }

    on<T extends keyof EventDefinition>(event: T, fn: CallbackType<EventDefinition[T]>): () => void {
        this.#bus.on(event, fn);
        this.#registered.push({
            name: event,
            fn: fn as unknown as CallbackType<EventDefinition[keyof EventDefinition]>,
        });
        return () => {
            this.off(event, fn);
        }
    }

    off<T extends keyof EventDefinition>(name: T, fn: CallbackType<EventDefinition[T]>): void {
        const properCall = this.#registered.find((entry) => entry.name === name && entry.fn === fn);
        if (!properCall) {
            throw new Error("Event you are trying to unregister was not registered via this Registrator");
        }
        this.off(name, fn);
        this.#registered = this.#registered.filter((entry) => !(entry.name === name && entry.fn === fn));
    }

    offAll(): void {
        this.#registered.forEach(({ name, fn }) => {
            this.#bus.off(name, fn);
        });
        this.#registered = [];
    }
}