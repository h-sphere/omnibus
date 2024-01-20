import { wrapDispose } from "./wrapDispose"

describe("wrap dispose test", () => {
    it('should properly return function that is callable as any other', () => {
        const jestFn = jest.fn()
        const fn = wrapDispose(jestFn)
        fn()
        expect(jestFn).toHaveBeenCalledTimes(1)
    })

    it('should automatically call the function when called with using', () => {
        const jestFn = jest.fn()
        {
            using _ = wrapDispose(jestFn)
        }
        expect(jestFn).toHaveBeenCalledTimes(1)
    })
})