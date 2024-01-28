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
})