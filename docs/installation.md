# Installation
Omnibus is available on the npm package manager. You can install it using your favourite tool:

::: code-group

```bash [npm]
npm install @hypersphere/omnibus
```

```bash [yarn]
yarn add @hypersphere/omnibus
```


:::

Once installed you can import it inside your project using the following syntax:

```ts
import { Omnibus, args } from '@hypersphere/omnibus'

const bus = Omnibus.builder()
.register('log', args<{ message: string }>())
.build()

bus.on('log', console.log)

```