---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Omnibus"
  text: "Event Bus TypeScript Library"
  image: 
    light: /assets/logo.svg
    dark: /assets/logo-light.svg
    alt: Omnibus Logo
  tagline: The only event library you will ever need
  actions:
    - theme: brand
      text: Get Started
      link: /quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/h-sphere/omnibus

features:
  - title: Cross Platform
    icon: 🔃
    details: Omnibus can run on any platform without any additional dependencies
  - title: TypeScript first
    icon:
      src: /assets/ts.png
      alt: Type Script
    details: Every method, event and property is properly typed and inferred from your code
  - title: Open Sourced
    icon: 
      src: /assets/os.svg
      alt: Open Source
    details: Check out the source code, improve, contribute!
---
<section class="vp-doc">
  <div style="max-width: 1152px; margin: 1em auto; padding: 1em;">

## Omnibus 101
```ts twoslash
import { BusBuilder, args } from '@hypersphere/omnibus'

const bus = BusBuilder
  .init()
  .register('transaction', args<{ amount: number }>())
  .build()

bus.on('transaction', t => {
  //                  ^?
  console.log(t)
})

bus.trigger('transaction', {
  amount: 55
})

```

  </div>
</section>