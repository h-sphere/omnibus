import { args } from "./Builder"
import { Omnibus } from "./Omnibus"

describe("Test registrator", () => {
	it("should properly create registrator that listens to main bus", async () => {
		const bus = Omnibus.builder()
			.register('log', args<string>())
			.build()

		const registrator = bus.getRegistrator()

		const callback = jest.fn()
		registrator.on('log', callback)

		bus.trigger('log', 'test 1')
		expect(callback).toHaveBeenCalledWith('test 1')
	})

	it('should properly create two independent registrators', async () => {
		const bus = Omnibus.builder()
			.register('log', args<string>())
			.build()

		const registrator1 = bus.getRegistrator()

		const callback = jest.fn()
		registrator1.on('log', callback)

		const registrator2 = bus.getRegistrator()
		registrator2.on('log', callback)

		bus.trigger('log', 'test 1')
		expect(callback).toHaveBeenCalledWith('test 1')
		expect(callback).toHaveBeenCalledTimes(2)

		registrator1.off('log', callback)

		bus.trigger('log', 'test 2')

		expect(callback).toHaveBeenCalledWith('test 2')
		expect(callback).toHaveBeenCalledTimes(3)
	})

	it('should properly offAll evets', async () => {
		const bus = Omnibus.builder()
			.register('log', args<string>())
			.build()

			const reg = bus.getRegistrator()

			const cb1 = jest.fn()
			const cb2 = jest.fn()

			reg.on('log', cb1)
			reg.on('log', cb2)


			bus.trigger('log', 'trig 1')
			expect(cb1).toHaveBeenCalledTimes(1)
			expect(cb2).toHaveBeenCalledTimes(1)

			cb1.mockClear()
			cb2.mockClear()
			
			reg.offAll()
			bus.trigger('log', 'hello world 2')

			expect(cb1).not.toHaveBeenCalled()
			expect(cb2).not.toHaveBeenCalled()
	})

	it('should properly dispose registartor', async () => {
		const bus = Omnibus.builder()
			.register('log', args<string>())
			.build()
		const cb = jest.fn()
		{
			using reg = bus.getRegistrator()
			reg.on('log', cb)
			bus.trigger('log', 'hello')
			expect(cb).toHaveBeenCalledWith('hello')
			expect(cb).toHaveBeenCalledTimes(1)
		}
		bus.trigger('log', 'hello 2')
		expect(cb).toHaveBeenCalledTimes(1)
		expect(cb).not.toHaveBeenCalledWith('hello 2')
	})

})