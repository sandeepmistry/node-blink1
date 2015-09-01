node-blink1
===========

[![Analytics](https://ga-beacon.appspot.com/UA-56089547-1/sandeepmistry/node-blink1?pixel)](https://github.com/igrigorik/ga-beacon)

A Node.js library for the
[blink(1)](http://www.kickstarter.com/projects/thingm/blink1-the-usb-rgb-led)
by [ThingM](http://thingm.com).

For for info. on the blink(1), see [todbot/blink1](https://github.com/todbot/blink1)

Install
-------

    npm install node-blink1

### Windows Users

`node-blink1` depends on `node-hid`, a native module that uses `node-gyp` to
build.  `node-gyp` requires Python 2.7.3 in the PATH, and if you have Python 3
installed, you may have to modify your PATH for `node-gyp` to locate it.

See [issue #3](https://github.com/sandeepmistry/node-blink1/issues/3) for
details.

### Linux Users

If you encounter the following error while installing, you'll need new install
of `libusb`.

```
libusb.h: No such file or directory compilation terminated.
```

For Debian and Ubuntu, install the package `libusb-1.0-0.dev`.

See [issue #4](https://github.com/sandeepmistry/node-blink1/issues/4) for
details.

Usage
-----

    var Blink1 = require('node-blink1');

Get list of blink(1) devices connected:

    Blink1.devices(); // returns array of serial numbers

Create blink(1) object without serial number, uses first device:

    var blink1 = new Blink1();

Create blink(1) object with serial number, to get list of serial numbers use
`Blink1.devices()`:

    var blink1 = new Blink1(serialNumber);

Get version:

    blink1.version(callback(version));

__Set colors__

Fade to RGB, optional callback called after `fadeMillis` ms:

    blink1.fadeToRGB(fadeMillis, r, g, b, [callback]); // r, g, b: 0 - 255

    blink1.fadeToRGB(fadeMillis, r, g, b, [index, callback]); // r, g, b: 0 - 255
                                                             // index (mk2 only): 0 - 2

Set RGB:

    blink1.setRGB(r, g, b, [callback]); // r, g, b: 0 - 255

Get RGB (mk2 only):

    blink1.rgb([index,] callback(r, g, b));

Off:

    blink1.off([callback]);

__Other methods__

Set server down (enable, disable), optional callback called after `millis` ms:

    blink1.enableServerDown(millis, [callback]) // tickle

    blink1.disableServerDown(millis, [callback]) // off

Play (start playing the pattern lines at the specified position):

    blink1.play = function(position, [callback])

Play Loop (start playing a subset of the pattern lines at specified start and end positions. Specifying count = 0 will loop pattern forever):

    blink1.playLoop = function(startPosition, endPosition, count, [callback])

Pause (stop playing the pattern line):

    blink1.pause = function([callback])

Write pattern line (set the parameters for a pattern line, at the specified position):

    blink1.writePatternLine(fadeMillis, r, g, b, position, [callback]) // r, g, b: 0 - 255

A simple example of this, used to flash red on & off is:
```javascript
blink1.writePatternLine(200, 255, 0, 0, 0);
blink1.writePatternLine(200, 0, 0, 0, 1);
blink1.play(0);
```

Read pattern line (at the position):

    blink1.readPatternLine(position, [callback])

Close (the underlying HID device):

    blink1.close([callback]);

License
========

Copyright (C) 2014 Sandeep Mistry <sandeep.mistry@gmail.com>

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
