import { BusBuilder } from "./BusBuilder"
import { args } from "./Builder";

describe("Bus Builder", () => {

    it('should properly call mapped bus', async () => {
    const builder = new BusBuilder()

    const bus = builder
        .register('progress', args<number>())
        .derive('done', 'progress', (b => b.map(a => a.toString())))
        .build()

        const onProgress = jest.fn()
        const onDone = jest.fn()
        bus.on('progress', onProgress)
        bus.on('done', onDone)

        // Fixme: why number number???
        await bus.trigger('progress', 5)
        expect(onProgress).toHaveBeenCalledWith(5)
        expect(onDone).toHaveBeenCalledWith('5')

        await bus.trigger('done', 'xxx')
        expect(onDone).toHaveBeenCalledWith('xxx')
    })

    it('should properly call filtered bus', async () => {
        const bus = BusBuilder
            .init()
            .register('log', args<{ type: 'error' | 'warning', message: string }>())
            .derive('log.error', 'log', (b) => b.filter(({ type }) => type === 'error'))
            .derive('log.warning', 'log', (b) => b.filter(({ type }) => type === 'warning'))
            .build()
        
        const onWarning = jest.fn()
        const onError = jest.fn()

        bus.on('log', () => { })

        bus.on('log.error', onError)
        bus.on('log.warning', onWarning)

        await bus.trigger('log', {
            type: 'error',
            message: 'Error Happened'
        })

        expect(onError).toHaveBeenCalledTimes(1)

        expect(onWarning).not.toHaveBeenCalled()

        onError.mockClear()

        await bus.trigger('log', {
            type: 'warning',
            message: 'Warning Happened'
        })

        expect(onError).not.toHaveBeenCalled()
        expect(onWarning).toHaveBeenCalled()
    })

    it('should properly attach Omnibus to another omnibus by passing `.on` method directly', async () => {
        const bus1 = new BusBuilder()
            .register('log', args<string>())
            .build()

        const bus2 = new BusBuilder()
            .from(bus1.on, 'log')
            .register('log2', args<string>())
            .build()

        const callback = jest.fn()
        bus2.on('log', callback)

        await bus1.trigger('log', 'hello')
        expect(callback).toHaveBeenCalledWith('hello')
    })

    it('should properly attach Omnibus to another omnibus by passing whole bus', async () => {
        const bus1 = new BusBuilder()
            .register('log', args<string>())
            .register('qwerty', args<{ x: number, y: number}>())
            .build()

        const bus2 = new BusBuilder()
            .from(bus1, 'log')
            // .register('log2', args<string>())
            .from(bus1, 'qwerty')
            // .from(bus1.on, 'log2')
            .build()

        const callback = jest.fn()
        bus2.on('log', callback)
        bus2.on('qwerty', x => {
            x
        })

        await bus1.trigger('log', 'hello')
        expect(callback).toHaveBeenCalledWith('hello')
    })

    it('should properly use another bus with name overriding', async () => {
        const bus1 = new BusBuilder()
            .register('log', args<number>())
            .build()

        const bus2 = new BusBuilder()
            .from(bus1, 'log', 'myNewAmazingLog')
            .build()

        const callback = jest.fn()
        bus2.on('myNewAmazingLog', callback)
        await bus1.trigger('log', 5)
        await bus1.trigger('log', 10)
        expect(callback).toHaveBeenCalledTimes(2)
        expect(callback).toHaveBeenCalledWith(5)
        expect(callback).toHaveBeenCalledWith(10)
    })
})