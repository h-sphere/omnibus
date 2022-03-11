import { debounce, delay, filter, skipDuplicates, throttle } from "./functions";

describe("Omnibus Functions", () => {
    describe("skipDuplicates", () => {
        it('should properly skip duplicates for simple array', () => {
            const callback = jest.fn();
            const fn = skipDuplicates(callback);
            fn([1, 2, 3]);
            fn([1, 2, 3]);
            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith([1,2,3]);
        });
        it('should properly call function when the array stays the same', () => {
            const callback = jest.fn();
            const fn = skipDuplicates(callback);
            fn([1,2,3]);
            fn([2,1,3]);
            expect(callback).toBeCalledTimes(2);
        });
        it('should properly call function when arrays are nested', () => {
            const callback = jest.fn();
            const fn = skipDuplicates(callback);
            fn([[1],[2]]);
            fn([[1],[2]]);
            expect(callback).toBeCalledTimes(1);
        });

        it("should properly call function when there are objects as arguments", () => {
            const callback = jest.fn();
            const fn = skipDuplicates(callback);
            fn([{a: "1"}]);
            fn([{a: "1"}]);
            expect(callback).toBeCalledTimes(1);
            expect(callback).toBeCalledWith([{a: "1"}]);
            fn([{a: "2"}]);
            expect(callback).toBeCalledTimes(2);
            fn([5]);
            expect(callback).toBeCalledTimes(3);
            fn([[1,2,3]]);
            expect(callback).toBeCalledTimes(4);
            fn([{a: "1"}]);
            expect(callback).toBeCalledTimes(5);
        });
    });

    describe("filter", () => {
        it('should filter out even numbers', () => {
            const callback = jest.fn();
            const fn = filter(callback, (a: number) => a % 2 !== 0);
            fn(1);
            fn(2);
            fn(3);
            fn(4);
            expect(callback).toBeCalledTimes(2);
            expect(callback).toBeCalledWith(1);
            expect(callback).toBeCalledWith(3);
            expect(callback).not.toBeCalledWith(2);
            expect(callback).not.toBeCalledWith(4);
        });
    });

    describe("throttle", () => {
        beforeEach(() => {
            jest.useFakeTimers("modern");
        });
        it('should properly throttle the function', () => {
            const fn = jest.fn();
            const th = throttle(fn, 1000);
            th("FIRST");
            jest.advanceTimersByTime(500);
            th("SECOND");
            jest.advanceTimersByTime(499);
            th("THIRD");
            jest.advanceTimersByTime(100);
            th("FOURTH");
            expect(fn).toBeCalledTimes(2);
            expect(fn).toBeCalledWith("FIRST");
            expect(fn).toBeCalledWith("FOURTH");
            expect(fn).not.toBeCalledWith("SECOND");
            expect(fn).not.toBeCalledWith("THIRD");
        });
    });

    describe("debounce", () => {
        beforeEach(() => {
            jest.useFakeTimers("modern");
        });
        it("should properly debounce functions", () => {
            const fn = jest.fn();
            const th = debounce(fn, 1000);
            th(1);
            expect(fn).not.toBeCalled();
            jest.advanceTimersByTime(999);
            expect(fn).not.toBeCalled();
            jest.advanceTimersByTime(20);
            expect(fn).toBeCalledTimes(1);
            jest.advanceTimersByTime(10000);
            expect(fn).toBeCalledTimes(1);
        });
    });

    describe("delay", () => {
        beforeEach(() => {
            jest.useFakeTimers("modern");
        });

        it("should properly delay functions", () => {
            const fn = jest.fn();
            const del = delay(fn, 1000);
            del(1);
            jest.advanceTimersByTime(500);
            del(2);
            jest.advanceTimersByTime(501);
            expect(fn).toBeCalledTimes(1);
            expect(fn).toBeCalledWith(1);
            jest.advanceTimersByTime(500);
            expect(fn).toBeCalledTimes(2);
            expect(fn).toBeCalledWith(2);
        });
    })
});