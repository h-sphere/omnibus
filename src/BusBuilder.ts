import { BuildableBuilder, Builder } from "./Builder";
import { Omnibus } from "./Omnibus";
import { Definitions, Transformers, Parameters } from "./types";

export class BusBuilder<D extends Definitions = {}> {
    #transformers: Transformers<D> = new Map()
    register<N extends string, T>(name: N, _: Builder<Parameters<T>>) {
        return this as unknown as BusBuilder<D & Record<N, Parameters<T>>>
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
        return this as unknown as BusBuilder<D & Record<T, Parameters<Res>>>
    }

    build() {
        const bus = new Omnibus<D>(this.#transformers)

        return bus
    }

    static init() {
        return new BusBuilder()
    }
}