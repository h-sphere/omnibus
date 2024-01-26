`# Basics

If you want to have a quick overview of what Omnibus is capable of, this page serves as a quick start guide. There is much more to explore so I recommend to have a look at more detailed documentation on the following pages too.

## Create your Event Bus
We can create Omnibus Event Bus using the builder pattern.


```ts
import { Omnibus, args } from '@hypersphere/omnibus';

const bus = Omnibus.builder()
.register('success', args<{ data: string, id: string }>())
.register('error', args<{ message: string }>())
.build()
```

The code above creates a new event bus with two events: `success` and `error`. Each of the events is individualy and the typing is exposed when triggering the event.

```ts
bus.trigger('success', { data: 'all your base are belong to us', id: 'id_1234' })

bus.trigger('success', { message: 'Error occurred' }) // Error: payload does not match the event type.
```

## Subscribing to events

Once our bus is created, we can register to incoming events by calling `on` method:

```ts
bus.on('success', (result) => {
    console.log(`Success, got data: ${result.data}`)
})
```

Every time the event is triggered, the registed function will be handled. The function argument is statically typed.

## Unsubscribing from the event

Sometimes we might need to unsubscribe from the event. This can be done in two ways:
- with unsubscribe handler returned from `on` method
- with `using` keyword

### Unsubscribe using handler
Every invocation of `on` method returns a unsubscribe function that when invoked will result in unsubscribing from the event bus


```ts
const unsubscribe = bus.on('success', (result) => { /* logic here */})

// some logic here
unsubscribe()
// callback will no longer be handled

```

### Unsubscribing using `using` keyword

Since TypeScript 5.2 you can use [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) syntax to clean up resources automatically.

```ts
{
    using _unsubscribe = bus.on('success', (result) => /* logic here */)

    /* here is your async logic */
}
// Event will be unsubscribed here
```

## Derriving buses
The true power of Omnibus comes with derived events. Thanks to that we can create new events that transform other events, filter them out or combine values of multiple messages.

```ts
const bus = Omnibus.builder()
.register('log', args<{ message: string, severity: 'info' | 'error'}>())
.derive('log.error', 'log', b =>
    b.filter(e => e.severity === 'error')
)
.derive('log.error::count', 'log.error', b =>
    b.reduce((_, b) => b + 1, 0)
)
.build()
```

The code above creates bus that exposes 3 events: `log`, `log.error` and `log.error::count`. The `log.error` is filtered out bus containing only logs with severity `error`. The `log.error::count` uses this resulting bus and allows you to subscribe to updates on total number of errors.

### Currently available methods

| method  | description                                                           |
|---------|-----------------------------------------------------------------------|
| .filter | filters out events based on the result of the callback                |
| .map    | maps each individual event into the new format                        |
| .reduce | takes previously returned value and the new one to generate a new one |
| .memoize| remembers the result of the builder transformations based on the parameter|

