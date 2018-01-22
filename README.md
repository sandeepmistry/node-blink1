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
const Blink1 = require('node-blink1');
```

Get list of blink(1) devices connected:

* Returns an array of serial numbers

```javascript
Blink1.devices();
```

Create blink(1) object without serial number, uses first device:

```javascript
var blink1 = new Blink1();
```

Create blink(1) object with serial number, to get list of serial numbers use
`Blink1.devices()`:

* Accepts an optional Serial Number parameter

```javascript
var blink1 = new Blink1(serialNumber);
```

### rgbcolor package usage

This blink1 package natively supports the [rgbcolor package](https://www.npmjs.com/package/rgbcolor). It is not required if you just pass an object containing RGB properties. At any point you see `new Color()` in the example code below, you can replace it with an RGB color object as shown:

```javascript
// An example color object for the color red
var red = {
    r: 255,
    g: 0,
    b: 0
};

// An few example rgbcolor objects for the color red
const Color = require('rgbcolor');
var red = new Color('red');
var red = new Color('rgb(255,0,0)');
var red = new Color('#FF0000');
var red = new Color('#F00');
```

### Get version

* Accepts an optional callback function parameter
* Returns Promise; automatically calls optional callback

```javascript
blink1.version([callback]).then*(version => {
    console.log("Version:", version);
});
```

### Set colors

Fade to RGB, returns Promise after `delay` ms:

* Accepts an object containing:
    - Required RGBColor object
    - Optional delay in ms
    - Optional index 0 - 2 (only Mk2 supported)
    - Optional callback function
* Returns Promise; automatically calls optional callback

```javascript
const Color = require('rgbcolor');
let blinkObject = {
    color : new Color('orange'),
    delay : 1000,
    index : 0,
    callback : () => {}
};
blink1.fadeToRGB(blinkObject);
```

#### Extended Fade example

Because most functions return promises, you can now chain actions together.

This example will cause the device to fade to red over 2.5s, once complete, the device will then fade to green over another 2.5s.

```javascript
const Color = require('rgbcolor');
let blinkObject = {
    delay : 2500,
    color : new Color('red')
};
blink1.fadeToRGB(blinkObject).then(({red, green, blue}) => {
    let blinkObject = {
        delay : 2500,
        color : new Color('green')
    };
    blink1.fadeToRGB(blinkObject);
});
```

Set RGB, returns Promise:

* Accepts a required RGBColor object
* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
const Color = require('rgbcolor');
blink1.setRGB(new Color('red')[, callback]);
```

Get current RGB (mk2 only):

* Accepts an optional index (default is 0)
* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.getRGB([index][, callback]);
```

### Turn device off

Off:

* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.off([callback]);
```

### Other methods

#### enableServerDown() & disableServerDown()

Set server down (enable, disable) after `delay` ms:

* Accepts required delay in ms
* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.enableServerDown(delay[, callback]); // tickle

blink1.disableServerDown(delay[, callback]); // off
```

#### play()

Play (start playing the pattern lines at the specified position):

* Accepts required play position
* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.play(position[, callback]);
```

#### playLoop()

Play Loop (start playing a subset of the pattern lines at specified start and end positions. Specifying count = 0 will loop pattern forever):

* Accepts an object containing:
    - Required start position
    - Required end position
    - Required count
    - Optional callback function
* Returns Promise; automatically calls optional callback

```javascript
let blinkObject = {
    start    : 1,
    end      : 2,
    count    : 2,
    callback : () => {}
};
blink1.playLoop(blinkObject);
```

#### pause()

Pause (stop playing the pattern line):

* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.pause([callback]);
```

#### writePatternLine()

Write pattern line (set the parameters for a pattern line, at the specified position):

* Accepts an object containing:
    - Required RGBColor object
    - Required delay in ms
    - Required position
    - Optional callback function
* Returns Promise; automatically calls optional callback

```javascript
const Color = require('rgbcolor');
let blinkObject = {
    color    : new Color('red'),
    delay    : 100,
    position : 2,
    callback : () => {}
};
blink1.writePatternLine(blinkObject);
````

A simple example of this, used to flash red on & off is:

```javascript
const Color = require('rgbcolor');
let blinkObject = {
    delay    : 200,
    color    : new Color('red')
    position : 0
};
let blinkObject2 = {
    delay    : 200,
    color    : new Color('black')
    position : 1
};
blink1.writePatternLine(blinkObject);
blink1.writePatternLine(blinkObject2);
blink1.play(0);
```

#### readPatternLine()

Read pattern line (at the position):

* Accepts a required position
* Accepts an optional callback function
* Returns Promise; automatically calls optional callback

```javascript
blink1.readPatternLine(position[, callback]).then(({
    color,
    delay
}) => {
    // readPatternLine values
});
```

#### close()

Close (the underlying HID device):

* Accepts an optional callback function
* Returns Promise; automatically calls optional callback


```javascript
blink1.close([callback]);
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
