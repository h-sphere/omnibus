# Using registrator

When providing public event API you might want to expose ability to listen to events but not allow external parties to trigger them. To support this use case, Omnibus provides ability generate registrators.

Registrator is an object that exposes methods to listen to events: `.on`, `.off` and `.offAll`.


::: info

When multiple registrators are created for the same event bus, their callbacks are independent: calling `.offAll` on one registrator will not unregister callbacks from the other registrator nor the ones registered on the main bus.

:::

## Creating registrator

To create registrator, call `.getRegistrator()` method on your `Omnibus` event bus:
```ts
import { Omnibus, args } from '@hypersphere/omnibus';

const bus = Omnibus.builder()
.register('log', args<string>())
.build()

const reg = bus.getRegistrator()

const cb = jest.fn()

reg.on('log', cb)

bus.trigger('log', 'hello')
```


## Disposing registrator

To make sure all your callbacks have been disposed after registrator is no longer needed, you can use `using` keyword.

::: info
You need to use TypeScript 5.2+ to use this feature and enable ES2022 and `esnext.disposable` lib in your tsconfig.
:::

```ts
const bus = Omnibus.builder()
    .register('log', args<string>())
    .build()
const cb = jest.fn()
{
    using reg = bus.getRegistrator()
    reg.on('log', cb)
    bus.trigger('log', 'hello')
}
bus.trigger('log', 'hello 2') // This will not trigger any callback
```
