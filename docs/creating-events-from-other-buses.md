# Creating events from other buses

You can register an event in your bus that comes from another bus. It can be either:
- Anoter Omnibus bus
- HTML Event Listener
- Any other class / object / library that allows to register events using `.addEventListener` method
- Any other class / object / library that allows to register events using `.on` method
- Any other class / object / library that allow to register events using declaration of `.on{eventName}` function.

::: warning
This is experimental feature and there is no way of unsbscribing from the target at the moment. You can call `.offAll` and no events will be triggered but Omnibus is not able to fully clean up after itself and there will be still empty event registered in the target bus. This issue will be addressed in the future release.

:::

```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<string>())
.build()

const bus2 = Omnibus.builder()
.from(bus, 'log', 'logOnAnotherBus')
.build()

bus2.on('logOnAnotherBus', (data) => console.log(data))

bus1.trigger('log', 'hello world')
```

You can pass either bus or registrator function itself:

```ts
Omnibus.builder()
.from(bus, 'log', 'newLogName') // This works
.from(bus.on, 'log', 'log2') // This works too
```

If you omit new name of the event, the original name will be used instead.