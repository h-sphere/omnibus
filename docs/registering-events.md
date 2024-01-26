# Registering Events

You can build your `Omnibus` bus using a builder pattern. During the build step you can register new events in two ways: creating new events using `.register` method or deriving new events from already existing ones using `.derive` method.

## Registering new event

To register new event, call a register method with the new name of the event and the event payload type. To pass the argument types please use `args` method (it's due to TypeScript limitation of not being able to derive some of the generic types while having other provided manually).


```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<{ message: string, severity: 'warning' | 'error' }>())
.build()

```

## Deriving an event

To derive an event from already existing one, use `.derive` method. It takes the name of the new event, the event it's result is derived from and callback that transforms the event payload.

```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<{ message: string, severity: 'warning' | 'error' }>())
.derive('log.error', 'log', b => b.filter(log => log.severity === 'error'))
.build()
```

The code above creates `log.error` event bus based on the error bus by filtering in only error messages.


### Available methods

There are several methods available:

| method  | description                                                           |
|---------|-----------------------------------------------------------------------|
| .filter | filters out events based on the result of the callback                |
| .map    | maps each individual event into the new format                        |
| .reduce | takes previously returned value and the new one to generate a new one |
| .memoize| remembers the result of the builder transformations based on the parameter|

