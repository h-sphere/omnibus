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

## Basic Usage

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

## Changelog

### Version 0.0.2
- Exporting `CallbackType` and `UnregisterCallback`
- Fixed type of `OmnibusRegistrator`
- Added `offAll` method to `Omnibus` class.
- Added default generic type for `Omnibus` and `OmnibusRegistrator`

### Version 0.01
Initial Release