# Example: Logger

You can use Omnibus to create simple logger event bus that can help you trigger and listen to logs of diffrent severity. The following code is a complete implementation of logger that will allow for three types of severity, and will, on top of that provide separate events for each of them and separate bus with incremental count of total events log events fired.

```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const logger = Omnibus.builder()
.register('log', args<{
    message: string,
    severity: 'info' | 'warning' | 'error'
}>())
.derive('log.info', 'log', b => b
    .filter(log => log.severity === 'info')
)
.derive('log.warning', 'log', b => b
    .filter(log => log.severity === 'warning')
)
.derive('log.error', 'log', b => b
    .filter(log => log.severity === 'error')
)
.derive('log::count', 'log', b => b
    .map(_ => 1).reduce((a, b) => a + b, 0)
)
.build()

```