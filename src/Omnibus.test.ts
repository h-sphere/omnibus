import { BusBuilder } from "./BusBuilder";
import { Omnibus } from "./Omnibus";
import { BuildableBuilder, args } from "./Builder";

describe("Omnibus", () => {
    it("should properly trigger an event", () => {
        interface EVENTS_A {
            "a": [string]
        };

        const bus = new Omnibus<{'a': [string]}>();
        const fn = jest.fn();

        bus.on("a", fn);
        bus.trigger("a", "12345");

        expect(fn).toHaveBeenCalledWith("12345");
    });

    it("should properly trigger an event with multiple parameters", () => {
        interface EVENTS_B {
            "b": [number, string]
        };

        const bus = new Omnibus<EVENTS_B>();
        const fn = jest.fn();
        bus.on("b", fn);

        bus.trigger("b", 555, "1234");

        expect(fn).toHaveBeenCalledWith(555, "1234");
    });

    it("should properly unregister a function", () => {
        const bus = new Omnibus();
        const fn = jest.fn();
        const fn2 = jest.fn();

        bus.on("a", fn);
        bus.on("a", fn2);
        bus.off("a", fn2);
        bus.trigger("a");
        expect(fn).toBeCalled();
        expect(fn2).not.toBeCalled();
    });

    it('should properly unregister a function using `offAll`', () => {
        const bus = new Omnibus();
        const fn = jest.fn();
        const fn2 = jest.fn();
        bus.on('a', fn);
        bus.on('b', fn2);

        bus.offAll();
        bus.trigger('a');
        bus.trigger('b');
        expect(fn).not.toBeCalled();
        expect(fn2).not.toBeCalled();

    });

    it('should properly build bus with map, filter and reduce', async() => {
        const bus = BusBuilder
            .init()
            .register('log', args<{ message: String, severity: 'error' | 'log'}>())
            .derive('log.error', 'log', b => b.filter(e => e.severity === 'error'))
            .derive('log.error::count', 'log.error', b =>
                b.map(x => 1).reduce((v, acc) => v + acc, 0))
            .build()

        const onErrorCount = jest.fn()

        bus.on('log.error::count', onErrorCount)
        await bus.trigger('log', { message: 'hello', severity: 'error'})

        expect(onErrorCount).toHaveBeenCalledWith(1)

        await bus.trigger('log', { message: 'hello', severity: 'error'})
        await bus.trigger('log', { message: 'hello', severity: 'error'})
        await bus.trigger('log', { message: 'hello', severity: 'error'})

        expect(onErrorCount).toHaveBeenCalledWith(4)
    })

    it('should trigger async method', async () => {
        const getObject = async (orgId: string) => {
            return Promise.resolve({
                id: orgId,
                name: 'Great Object'
            })
        }
        const bus = BusBuilder
            .init()
            .register('object', args<string>())
            .derive('object::fetched', 'object', b => b.map(getObject))
            .build()

        // FIXME: rework so the Awaited value is exposed rather than promise-encapsuled value
        const onFetched = jest.fn()
        bus.on('object::fetched', onFetched)

        bus.on('object::fetched', x => {
            x.name
            expect(x.name).toEqual('Great Object')
        })

        await bus.trigger('object', 'object_1234')
        expect(onFetched).toHaveBeenCalledWith({
            id: 'object_1234',
            name: 'Great Object'
        })
    })

    it('should trigger async method with memoize', async () => {
        const getObject = jest.fn((id: string) => ({
            id,
            name: 'Great Object'
        }))

        const bus = BusBuilder
            .init()
            .register('object', args<string>())
            .derive('object::fetched', 'object', b => b
                .map(getObject)
                .memoize()
            )
            .build()

        expect(getObject).not.toHaveBeenCalled()

        await bus.trigger('object', 'obj_1234')


        expect(getObject).toHaveBeenCalledWith('obj_1234')

        await bus.trigger('object', 'obj_2222')
        expect(getObject).toHaveBeenCalledWith('obj_2222')

        expect(getObject).toHaveBeenCalledTimes(2)

        await bus.trigger('object', 'obj_1234') // Same as the last one
        expect(getObject).toHaveBeenCalledTimes(2) // No change, memoized
    })

    it('should properly expose bus builder from Omnibus object', async () => {
        const bus = Omnibus.builder()
            .register('log', args<string>())
            .build()
        const onLog = jest.fn()
        bus.on('log', onLog)
        await bus.trigger('log', 'hello world')
        expect(onLog).toHaveBeenCalledWith('hello world')
    })

    it('should call callback once - single argument', async () => {
        const bus = Omnibus.builder()
            .register('log', args<string>())
            .build()
        const promise = bus.once('log')
        const cb = jest.fn()
        promise.then(cb)

        expect(cb).not.toHaveBeenCalled()

        await bus.trigger('log', 'hello')
        expect(cb).toHaveBeenCalledWith('hello')
        await bus.trigger('log', 'world')
        expect(cb).not.toHaveBeenCalledWith('world')
    })

    it('should call callback once - multiple arguments', async () => {
        const bus = Omnibus.builder()
            .register('log', args<[string, number, string]>())
            .build()
        const promise = bus.once('log')
        const cb = jest.fn()
        promise.then(cb)

        expect(cb).not.toHaveBeenCalled()

        await bus.trigger('log', 'hello', 5, 'world')
        expect(cb).toHaveBeenCalledWith(['hello', 5, 'world'])
        await bus.trigger('log', 'x', 1, 'z')
        expect(cb).not.toHaveBeenCalledWith(['x', 1, 'z'])
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('should call callback once - callback passed as parameter', async () => {
        const bus = Omnibus.builder()
            .register('log', args<[string, number, string]>())
            .build()

        const cb = jest.fn()
        const _unregister = bus.once('log', cb)
        await bus.trigger('log', 'xxx', 5, 'yyy')
        expect(cb).toHaveBeenCalledWith('xxx', 5, 'yyy')
        await bus.trigger('log', 'xxx', 5, 'yyy')
        expect(cb).toHaveBeenCalledTimes(1)
    })
})