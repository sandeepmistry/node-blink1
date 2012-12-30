node-blink1
===========

A node.js library for the [blink(1)](http://www.kickstarter.com/projects/thingm/blink1-the-usb-rgb-led) by [ThingM](http://thingm.com)

Install
-------

    npm install node-blink1

Usage
-----

    var Blink1 = require('node-blink1');

Get list of blink(1) devices connected:

    Blink1.devices(); // returns array of serial numbers
    
Create blink(1) object without serial number, uses first device:

    var blink1 = new Blink1.Blink1();
    
Create blink(1) object with serial number, to get list of serial numbers use `Blink1.devices()`:

    var blink1 = new Blink1.Blink1(serialNumber);
    

Get version:

    blink1.version(callback(version))
    
__Set colors__
    
Fade to RGB, optional callback called after `fadeMillis` ms:
    
    blink1.fadeToRGB(fadeMillis, r, g, b, [callback])
    
Set RGB:

    blink1.setRGB(r, g, b, [callback])
    
__Other methods__
    
Set server down (on, off), optional callback called after `millis` ms:

    blink1.serverDown(on, millis, [callback])
    
Play:

    blink1.play = function(play, position, [callback])
    
Write pattern line:

    blink1.writePatternLine(fadeMillis, r, g, b, position, [callback])
    
Read pattern line:

    blink1.readPatternLine(position, [callback])

License
========

Copyright (C) 2012 Sandeep Mistry <sandeep.mistry@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

