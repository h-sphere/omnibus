## Example: MIDIVal

[MIDIVal](https://midival.github.io/) is the library that inspired Omnibus in the first place. While building it, I realised that there were no good, cross-platform, strongly typed solution that would serve as an Event Bus.

MIDIVal is a high-level interface to interact with MIDI devices. It helps programming synthesisers, reading notes and parameters from them, control your website using launchpads and any other MIDI enabled devices. It's super easy to use and under constant development. I recommend to check it out! Here's the example code of how to set up MIDIVal to send some notes to your device:

```ts
import { MIDIVal, MIDIValOutput } from "@midival/core";

MIDIVal.connect()
.then(access => {
    const output = new MIDIValOutput(access.outputs[0]);
    output.sendNoteOn(64, 127);
});
```