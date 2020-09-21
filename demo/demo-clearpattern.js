var async = require('async');

var Blink1 = require('../blink1');

var blink1 = new Blink1();

console.log('clear pattern');
// clear out all the RAM entries
for( i=0; i< 32; i++) {
  blink1.writePatternLine(0, 0,0,0, i);
}

// save RAM to flash
blink1.savePattern()

blink1.close()
