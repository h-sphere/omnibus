import { Parameters } from "./types";
type Call<Inp extends Array<unknown>, Outp extends Array<unknown>> = (trigger: (...p: Outp) => void, ...p: Inp) => Promise<void>;

export class Builder<Input extends Parameters<any>, Output extends Parameters<any> = Input> {
    protected call /*Call<Input, Output>*/ = async (t, ...p) => t(...p as unknown as Output)
    map<NewOutput>(fn: (...i: Output) => NewOutput) {
        const prev = this.call
        this.call = async (t, ...p) => {
            const trigger = (...p: Output) => {
                const data = fn(...p as any) as any
                const arrayData = (Array.isArray(data) ? data : [data] as Output)
                t(...arrayData as any)
            }
            await prev(trigger, ...p)
        }
        return this as unknown as Builder<Input, Parameters<NewOutput>>
    }

    filter(filt: (...i: Input) => boolean) {
        const prev = this.call
        this.call = async (t, ...p) => {
            if (filt(...p as any)) {
                await prev(t, ...p)
            }
        }

        return this
    }

    reduce<NewOut>(fn: (...val: [...Output, NewOut]) => NewOut, init: NewOut) {
        const prev = this.call
        let acc = init
        this.call = async (t, ...p) => {
            const trigger = (...p: Output) => {
                const newVal = fn(...[...p, acc]);
                acc = newVal;
                (t as any)(newVal) // FIXME: not sure how to fix this
            }
            await prev(trigger, ...p)
        }
        return this as unknown as Builder<Input, Parameters<NewOut>>
    }

    static init<Input>() {
        return new Builder<Parameters<Input>>()
    }
}


export class BuildableBuilder<Input extends Parameters<any>, Output extends Parameters<any> = Input> extends Builder<Input, Output> {
    build() {
        return this.call
    }

    static init<Input>() {
        return new BuildableBuilder<Parameters<Input>>()
    }

    // We need to cast map, this looks nasty, not sure if there's better way of doing it in TS
    map<NewOutput>(fn: (...i: Output) => NewOutput): BuildableBuilder<Input, Parameters<NewOutput>> {
        return super.map(fn) as unknown as BuildableBuilder<Input, Parameters<NewOutput>>
    }
    reduce<NewOut>(fn: (...val: [...Output, NewOut]) => NewOut, init: NewOut) {
        return super.reduce(fn, init) as unknown as BuildableBuilder<Input, Parameters<NewOut>>
    }
}


export const args = <T>() => new Builder<Parameters<T>>()