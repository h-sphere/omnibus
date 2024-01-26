# Triggering events

To trigger an event, call `.trigger` method with event name you want to call, followed by payload. The type will be automatically deducted based on the event name.

```ts
import { Omnibus } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<{ message: string, severity: 'warning' | 'error' }>())
.build()

// Triggering an event
bus.trigger('log', { message: 'Issue with parsing', severity: 'warning' })

bus.trigger('log', { data: [1, 2, 3 ]}) // Error

```

## Async transformers and listeners

Both transformers (defined by `.derive` method in the build step) and listeners can contain asynchronous code. To make sure your code waits for them to finish, you can await a trigger call.

```ts
await bus.trigger('log', { message: 'Issue', severity: 'warning' })

// We have guarantee here that all callbacks and transformers succeeded now.
```

If one of the chained operations fails, the trigger method will throw an error.

Result of awaited trigger method is `void` - the only way to get to the results of the derived values is to listen to them.