# Listening Once
Sometimes you might want to listen to a given event exactly once. Omnibus provides method `.once` to do exactly that.

You can use this method in two variants. When passing single argument, event name, the method will return a promise that will get resolved on the first event. This is an easy way to syncronise your events and listen to them in sequence.

```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<string>())
.build()

// Pass bus to other async functions...

const result = await bus.once('log') // Log would need to be triggered from somewhere async
```

This method is especially useful when listening to other, external events, like clicks.

```ts
import { Omnibus } from '@hypersphere/omnibus'

const button = document.querySelector('button[.see-more]')

const bus = Omnibus.builder()
.from(button, 'click')
.build()

const clickEvent = await bus.once('click')
```

Another way to trigger event once is to pass a callback as a second parameter. Method in this form has the same signature like the `.on` method and you can use the unregister callback returned from `.once` call to unregister the callback before it is executed if needed.

```ts
import { Omnibus } from '@hypersphere/omnibus'

const button = document.querySelector('button[.see-more]')

const bus = Omnibus.builder()
.from(button, 'click')
.build()

const unregister = bus.once('click', (e) => {
    console.log('Button clicked', e)
})

setTimeout(unregister, 5000) // unregistering automatically after 5s. 
```