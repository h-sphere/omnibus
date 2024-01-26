import { Parameters } from "./types";

export class Builder<Input extends Parameters<any>, Output extends Parameters<any> = Input> {
    protected call = async (t, ...p) => t(...p as unknown as Parameters<Output>)
    map<NewOutput>(fn: (...i: Parameters<Output>) => NewOutput | Promise<NewOutput>) {
        const prev = this.call
        this.call = async (t, ...p) => {
            const trigger = async (...p: Parameters<Output>) => {
                const data = await fn(...p as any) as any
                const arrayData = (Array.isArray(data) ? data : [data] as Output)
                await t(...arrayData as any)
            }
            await prev(trigger, ...p)
        }
        return this as unknown as Builder<Input, Awaited<Parameters<NewOutput>>>
    }

    filter(filt: (...i: Parameters<Input>) => boolean) {
        const prev = this.call
        this.call = async (t, ...p) => {
            if (await filt(...p as any)) {
                await prev(t, ...p)
            }
        }

        return this
    }

    reduce<NewOut>(fn: (...val: [...Parameters<Output>, ...Parameters<NewOut>]) => NewOut, init: NewOut) {
        const prev = this.call
        let acc= (Array.isArray(init) ? init : [init]) as Parameters<NewOut>
        this.call = async (t, ...p) => {
            const trigger = async (...p: Parameters<Output>) => {
                const newVal = await fn(...[...p, ...acc]);
                acc = (Array.isArray(newVal) ? newVal : [newVal]) as Parameters<NewOut>
                await (t as any)(newVal) // FIXME: not sure how to fix this
            }
            await prev(trigger, ...p)
        }
        return this as unknown as Builder<Input, Awaited<Parameters<NewOut>>>
    }

    protected shouldMemoize: boolean = false

    memoize() {
        this.shouldMemoize = true

        return this
    }

    static init<Input>() {
        return new Builder<Parameters<Input>>()
    }
}


export class BuildableBuilder<Input extends Parameters<any>, Output extends Parameters<any> = Input> extends Builder<Input, Output> {
    build() {
        if (!this.shouldMemoize) {
            return this.call
        }

        const mem = new Map<string, Parameters<Output>>()
        return async (t, ...p: Parameters<Input>) => {

            const hash = p.map(el => el.toString()).join('::::')

            if (mem.has(hash)) {
                return mem.get(hash)
            }
            const newT = (...res: Parameters<Output>) => {
                mem.set(hash, res)
                return t(...res)
            }

            this.call(newT, ...p)
        }
    }

    static init<Input>() {
        return new BuildableBuilder<Parameters<Input>>()
    }

    // We need to cast map, this looks nasty, not sure if there's better way of doing it in TS
    map<NewOutput>(fn: (...i: Parameters<Output>) => NewOutput | Promise<NewOutput>): BuildableBuilder<Input, Awaited<Parameters<NewOutput>>> {
        return super.map(fn) as unknown as BuildableBuilder<Input, Awaited<Parameters<NewOutput>>>
    }
    reduce<NewOut>(fn: (...val: [...Parameters<Output>, ...Parameters<NewOut>]) => NewOut, init: NewOut) {
        return super.reduce(fn, init) as unknown as BuildableBuilder<Input, Awaited<Parameters<NewOut>>>
    }
}


export const args = <T>() => new Builder<Parameters<T>>()