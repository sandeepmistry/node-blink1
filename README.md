# node-blink1

A Node.js library for the
[blink(1)](http://www.kickstarter.com/projects/thingm/blink1-the-usb-rgb-led)
by [ThingM](http://thingm.com).

For for info. on the blink(1), see [todbot/blink1](https://github.com/todbot/blink1)

**Note**: Make sure no other programs, including [Blink1Control](https://blink1.thingm.com/blink1control/) are open and using the blink(1).

## Install

```sh
npm install node-blink1
```

### Linux Users

See [node-hid's compiling from source instructions](https://github.com/node-hid/node-hid#compiling-from-source)

## Usage

```javascript
const { Blink1, devices } = require('node-blink1');
```

Get list of blink(1) devices connected:

```javascript
devices(); // returns array of serial numbers
```

Create blink(1) object without serial number, uses first device:

```javascript
var blink1 = new Blink1();
```

Create blink(1) object with serial number, to get list of serial numbers use
`devices()`:

```javascript
var blink1 = new Blink1(serialNumber);
```

### Get version

Returns Promise

```javascript
blink1.version().then*(version => {
    // version
});
```

### Set colors

Fade to RGB, returns Promise after `delay` ms:

```javascript
let blinkObject = {
    delay : 1000, // Optional # or ms
    red   : 128,  // Required 0 - 255
    green : 128,  // Required 0 - 255
    blue  : 128   // Required 0 - 255
    index : 0     // Optionsl 0 - 2 (mk2 Only)
};
blink1.fadeToRGB(blinkObject);
```

#### Extended Fade example

Because most functions return promises, you can now chain actions together.

This example will cause the device to fade to red over 2.5s, once complete, the device will then fade to green over another 2.5s.

```javascript
let blinkObject = {
    delay : 2500,
    red   : 255,
    green : 0,
    blue  : 0
};
blink1.fadeToRGB(blinkObject).then(({red, green, blue}) => {
    let blinkObject = {
        delay : 2500,
        red   : 0,
        green : 255,
        blue  : 0
    };
    blink1.fadeToRGB(blinkObject);
});
```

Set RGB, returns Promise:

```javascript
let blinkObject = {
    red   : 128,  // Required 0 - 255
    green : 128,  // Required 0 - 255
    blue  : 128   // Required 0 - 255
};
blink1.setRGB(blinkObject);
```

Get RGB, returns Promise (mk2 only):

```javascript
blink1.getRGB(index); // index defaults to 0
```

Off, returns Promise:

```javascript
blink1.off();
```

### Other methods

Set server down (enable, disable), , returns Promise after `delay` ms:

```javascript
blink1.enableServerDown(delay); // tickle

blink1.disableServerDown(delay); // off
```

Play (start playing the pattern lines at the specified position), returns Promise:

```javascript
blink1.play(position);
```

Play Loop (start playing a subset of the pattern lines at specified start and end positions. Specifying count = 0 will loop pattern forever), returns Promise:

```javascript
let blinkObject = {
    start : 1, // Required
    end   : 2, // Required
    count : 2  // Required
};
blink1.playLoop(blinkObject);
```

Pause (stop playing the pattern line), returns Promise:

```javascript
blink1.pause();
```

Write pattern line (set the parameters for a pattern line, at the specified position), returns Promise:

```javascript
let blinkObject = {
    delay    : 100, // Required # of ms
    red      : 128, // Required 0 - 255
    green    : 128, // Required 0 - 255
    blue     : 128, // Required 0 - 255
    position : 2    // Required
};
blink1.writePatternLine(blinkObject);
````

A simple example of this, used to flash red on & off is:

```javascript
let blinkObject = {
    delay    : 200,
    red      : 255,
    green    : 0,
    blue     : 0,
    position : 0
};
let blinkObject2 = {
    delay    : 200,
    red      : 0,
    green    : 0,
    blue     : 0,
    position : 1
};
blink1.writePatternLine(blinkObject);
blink1.writePatternLine(blinkObject2);
blink1.play(0);
```

Read pattern line (at the position), returns Promise:

```javascript
blink1.readPatternLine(position).then(({
    red,
    green,
    blue,
    delay
}) => {
    // readPatternLine values
});
```

Close (the underlying HID device), returns Promise:

```javascript
blink1.close();
```

## License

Copyright (C) 2015 Sandeep Mistry <sandeep.mistry@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/node-blink1?pixel)](https://github.com/igrigorik/ga-beacon)
