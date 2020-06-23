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
var Blink1 = require('node-blink1');
```

Get list of blink(1) devices connected:

```javascript
Blink1.devices(); // returns array of serial numbers
```

Create blink(1) object without serial number, uses first device:

```javascript
var blink1 = new Blink1();
```

Create blink(1) object with serial number, to get list of serial numbers use
`Blink1.devices()`:

```javascript
var blink1 = new Blink1(serialNumber);
```

### Get version

```javascript
blink1.version(callback(version));
```

### Set colors

Fade to RGB, optional callback called after `fadeMillis` ms:

```javascript
blink1.fadeToRGB(fadeMillis, r, g, b, [callback]); // r, g, b: 0 - 255

blink1.fadeToRGB(fadeMillis, r, g, b, [index, callback]); // r, g, b: 0 - 255
                                                          // index (mk2 only): 0 - 2
```

Set RGB:

```javascript
blink1.setRGB(r, g, b, [callback]); // r, g, b: 0 - 255
```

Get RGB (mk2 only):

```javascript
blink1.rgb([index,] callback(r, g, b));
```

Off:

```javascript
blink1.off([callback]);
```

### Other methods
__Disable gamma correction:
```javascript
blink1.enableDegamma = false   // defaults to true
```

__Set server down [enable, disable]__, optional callback called after `millis` ms:

```javascript
blink1.enableServerDown(millis, [callback]); // tickle

blink1.disableServerDown(millis, [callback]); // off
```

__Play__ (start playing the pattern lines at the specified position):

```javascript
blink1.play(position, [callback]);
```

__Play Loop__
Start playing a subset of the pattern lines at specified start and end positions. Specifying count = 0 will loop pattern forever):

```javascript
blink1.playLoop(startPosition, endPosition, count, [callback]);
```

__Pause__ (stop playing the pattern line):

```javascript
blink1.pause([callback]);
```

__Write pattern line__
(set the parameters for a pattern line, at the specified position):

```javascript
blink1.writePatternLine(fadeMillis, r, g, b, position, [callback]) // r, g, b: 0 - 255
````

A simple example of this, used to flash red on & off is:

```javascript
blink1.writePatternLine(200, 255, 0, 0, 0);
blink1.writePatternLine(200, 0, 0, 0, 1);
blink1.play(0);
```

__Set 'LedN'__ Set which LED to address for `writePatternLine()`:

```javascript
blink1.setLedN(1); // set top LED
```

An example:

```javascript
blink1.setLedN(1); // set top LED for pattern position 0
blink1.writePatternLine(200, 255, 0, 0, 0);
blink1.setLedN(2); // set bottom LED for position 1
blink1.writePatternLine(200, 0, 255, 0, 1);
blink1.setLedN(0); // set both LEDs for position 2
blink1.writePatternLine(200, 0, 0, 0, 2);
```

__Save RAM pattern__ (to blink(1) non-volatile memory)

```js
blink1.writePatternLine(200, 255, 0, 0, 0);
blink1.writePatternLine(200, 0, 0, 0, 1);
blink1.savePattern([callback]);
```
Note: This command may return an error, but the command did succeed.
This is because to save to its internal flash memory, the blink(1) must
turn off USB for a moment.

__Read pattern line__ (at the position):

```javascript
blink1.readPatternLine(position, [callback])
```

__Write User Note__ (to blink(1) non-volatile memory)

```js
var noteId = 2
blink1.writeUserNote( noteId, "this is a note" )
```

__Close__ (the underlying HID device):

```js
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
