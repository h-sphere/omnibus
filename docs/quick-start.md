# Quick Start

Let's get started with Omnibus library. All core concepts can be learned in 5 minutes!

## Example

```ts twoslash
const sendLogToAnalyse = (x: any) => { }
// ---cut---
import { BusBuilder, args } from '@hypersphere/omnibus';

const bus = BusBuilder
  .init()
  .register('log', args<{
    message: string,
    severity: 'error' | 'warning' | 'info'
  }>())
  .derive('log.error', 'log', (b) => b
    .filter(log => log.severity === 'error'))
  .derive('log.warning', 'log', (b) => b
    .filter(log => log.severity === 'warning'))
  .derive('log.info', 'log', (b) => b
    .filter(log => log.severity === 'info'))
  .build()

// Now we can use our bus

// Registering Event
bus.on('log.error', e => sendLogToAnalyse(e))

// // Triggering event
await bus.trigger('log', {
  message: 'Cannot connect to database',
  severity: 'error'
})
```

The following code sets up an event bus with 5 separate events: `log`, `log.error`, `log.warning`, `log.info` and `log::count`. The last 4 are derived from `log`, meaning that they will get triggered automatically when `log` is triggered. They also use their own builders to filter, map and reduce the data.
Please note that all the methods and objects are strongly typed and Omnibus will automatically detect proper types for each of the events: you will get proper type checking in all the places.