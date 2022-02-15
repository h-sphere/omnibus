import { Omnibus } from "./Omnibus";

describe("Omnibus", () => {
    it("should properly trigger an event", () => {
        interface EVENTS_A {
            "a": [string]
        };

        const bus = new Omnibus<EVENTS_A>();
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
        const bus = new Omnibus<Record<string, unknown[]>>();
        const fn = jest.fn();
        const fn2 = jest.fn();

        bus.on("a", fn);
        bus.on("a", fn2);
        bus.off("a", fn2);
        bus.trigger("a");
        expect(fn).toBeCalled();
        expect(fn2).not.toBeCalled();
    })
})