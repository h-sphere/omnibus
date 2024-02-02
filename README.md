# Hypersphere Omnibus

## Installation
```bash
yarn add @hypersphere/omnibus
```

## Features
- Fully typed custom Event Bus
- Each event can be individually typed
- Full code completion
- Levarages TypeScript native functionality (no magic)
- Fully open sourced

## Usage

### Basic Example

```typescript
import { User, Message } from "./types";
import { Omnibus } from "@hypersphere/omnibus";

interface EventDefinitions {
    "message": [message: Message, author: User, recipient: User],
    "activity-change": [newActivity: "active"|"inactive", user: User],
};

const bus = new Omnibus<EventDefinitions>();

bus.on("message", (msg, msgAuthor, msgRecipient) => {
    // all parameters are properly typed here.
});

bus.on("activity-change", (activity, user) => {
    // all parameters are properly typed here too
});

// TypeScript will also make sure those are provided properly.
bus.trigger("message", new Message("xxx"), user1, user2);

```

### Using BusBuilder

```typescript
import { BusBuilder, args } from '@hypersphere/omnibus';

const bus = BusBuilder
    .init()
    .register('message', args<string>())
    .register('error', args<string>())
    .build()

bus.on('message', (x: string) => { })
bus.on('error', (x: string) => { })
```

### Using Bus Builder derive

TODO: finish this

### Using with `using` syntax

TODO: finish this

## Changelog


### Version 0.1.3
- Added new `.from` method for `Omnibus.builder()` - you can now combine events from other buses (including native buses and other libraries!)

### Version 0.1.2
- minor: improving returned types by flattening them = better TS inspection
- exposing two new helper types: `OmnibusEvents` and `OmnibusEventPayload`
- Fixed issue with Registrator's `.off` method not working properly
- Added support for disposing `OmnibusRegistrator` and added documentation around this logic

### Version 0.1.1
- Fixing issue with `.reduce` interface - now handles arrays properly
- Adding `.memoize` builder method so values can be properly handled between calls
- Fixed bunch of typings

### Version 0.1.0
This version is jam-packed with great new features:
- Introducing new `BusBuilder` that allows you to build your event bus in declarative way
- `BusBuilder` allows you to compose new events based on the other ones providing powerful way of filtering, mapping and reducing messages
- The `on` method can be now used with new [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) allowing you to use `using` keyword to remove event when exiting function
- Breaking change: Removed `functions` helpers as they are now being replaced with `BusBuilder` approach

### Version 0.0.6
- Fixing issue with delay using interval instead of timeout function.

### Version 0.0.5
- Fixed deployment issues.

### Version 0.0.4
- Fixed way package was exporting it's functions
- Exporting sourcemaps

### Version 0.0.3
- Added `@hypersphere/omnibus/functions` module that provides useful helper functionality:
- `delay` allows you to get event delayed but set amount of milliseconds
- `skipDuplicates` ensures that you won't get 2 same events with the same parameters in a row
- `filter` provides generic way for filtering events by providing custom function
- `throttle` and `debounce` provides functionality of throttling and debouncing events respectively

### Version 0.0.2
- Exporting `CallbackType` and `UnregisterCallback`
- Fixed type of `OmnibusRegistrator`
- Added `offAll` method to `Omnibus` class.
- Added default generic type for `Omnibus` and `OmnibusRegistrator`

### Version 0.0.1
- Initial Release