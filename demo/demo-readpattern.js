var Blink1 = require('../blink1');

var blink1 = new Blink1();

var mypattern = new Array(32);

for( i=0; i< 32; i++) {
  blink1.readPatternLine(i, function(value) {
    mypattern[i] = value
  });
}
console.log("Done!");
console.log(mypattern);
