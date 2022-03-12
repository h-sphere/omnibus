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

### Using helper functions
```typescript
import { Omnibus } from "@hypersphere/omnibus";
import { skipDuplicates } from "@hypersphere/omnibus/functions";
const bus = new Omnibus();
bus.on("message", skipDuplicates(message => {
    console.log(message);
}));

bus.trigger("Hello World");
bus.trigger("Hello World");
bus.trigger("Lorem Ipsum");

/* Console:
    Hello World
    Lorem Ipsum
*/
```

## Changelog

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