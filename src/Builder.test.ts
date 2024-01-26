import { BuildableBuilder } from "./Builder"

describe("Builder", () => {
    it("should properly prepare builder", async () => {
        const fn = BuildableBuilder
            .init<{ count: number }>()
            .filter(c => c.count > 3)
            .map(c => c.count)
            .build()

        const call = jest.fn()
        await fn(call, { count: 2 })
        expect(call).not.toHaveBeenCalled()

        await fn(call, { count: 5 })
        expect(call).toHaveBeenCalledWith(5)
    })

    it('should test reduce on its own', async () => {
        const fn = BuildableBuilder
            .init<number>()
            .reduce((a, b) => a + b, 0)
            .build()
        const call = jest.fn()
        await fn(call, 4)
        expect(call).toHaveBeenCalledWith(4)

        await fn(call, 1)
        expect(call).toHaveBeenCalledWith(5)

        await fn(call, 10)
        expect(call).toHaveBeenCalledWith(15)
    })

    it('should combine filter and reduce', async () => {
        const fn = BuildableBuilder
            .init<number>()
            .filter(x => x >= 10)
            .reduce((a, b) => a + b, 0)
            .build()

        const call = jest.fn()

        await fn(call, 3)
        await fn(call, 5)
        await fn(call, 1)
        await fn(call, 2)
        expect(call).not.toHaveBeenCalled()

        await fn(call, 10)
        expect(call).toHaveBeenCalledWith(10)

        await fn(call, 25)
        expect(call).toHaveBeenCalledWith(35)
    })

    it('should use all methods at the same time', async () => {
        const fn = BuildableBuilder
        .init<{ count: number, message: string}>()
        .filter(m => m.message === 'qualify')
        .map(m => m.count)
        .map(v => v * 2)
        .reduce((val, acc) => val + acc, 0)
        .map(v => ({ result: v }))
        .build()

        const call = jest.fn()
        await fn(call, { count: 5, message: 'qualify'})
        expect(call).toHaveBeenCalledWith({ result: 10 })
    })

    it('should run multiple filters in a row', async () => {
        const fn = BuildableBuilder
        .init<{ count: number }>()
        .filter(c => c.count % 2 === 0)
        .filter(c => c.count > 10)
        .filter(c => c.count < 20)
        .map(c => c.count)
        .build()

        const call = jest.fn()

        await fn(call, { count: 2 })
        await fn(call, { count: 12 })
        await fn(call, { count: 13 })
        await fn(call, { count: 22 })
        await fn(call, { count: 51 })

        expect(call).toHaveBeenCalledTimes(1)
        expect(call).toHaveBeenCalledWith(12)
    })
    
    it('should properly create bus with reduce', async () => {
        const fn = BuildableBuilder
            .init<{ count: number }>()
            .filter(v => v.count > 0)
            .reduce((v, acc) => v.count + acc, 0)
            .map(v => ({ sum: v }))
            .build()
        
        const trigger = jest.fn()
        await fn(trigger, { count: 5 })
        expect(trigger).toHaveBeenCalledWith({ sum: 5})
        await fn(trigger, { count: 10 })
        expect(trigger).toHaveBeenLastCalledWith({ sum: 15 })
    })
})