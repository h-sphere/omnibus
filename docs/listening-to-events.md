# Listening to events

## Registering listener
In order to start listening to a given event, call `.on` method with event name, followed by callback. The callback parameters are typed based on the event name.


```ts
import { Omnibus, args} from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('ping', args<number>())
.build()

bus.on('ping', val => {
    console.log(`Got ping = ${val}`)
})
```

## Unregistering listener

To unregister already registered listener, you can use either a callback returned from the `.on` method or use a [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) pattern.

### Using callback
Save the callback returned by `.on` method and call it once you need to unregister the method.

```ts
const bus = Omnibus.builder()
.register('ping', args<number>())
.build()

const unregister = bus.on('ping', val => {
    console.log(`Got ping = ${val}`)
})

// Other code

unregister()

bus.trigger('ping', 42) // Callback will not be called anymore.

```

### Using Explicit Resource Management (`using` keyword)

::: info
You need to use TypeScript 5.2+ to use this feature and enable ES2022 and `esnext.disposable` lib in your tsconfig.
:::

If you want to unregister callback as soon as exiting your async function where you registered it, you can use an `using` keyword to achieve that. Omnibus UnregisterCalls comply with `Symbol.dispose` so can be marked with `using` keyword the following way.

```ts
async function() {
    using _ = bus.on('log', e => {
        // handle log
    })

    /* perform your regular operations, throw errors, etc. */
}
// Once the function exits, the event will get unregistered automatically.
```

