var Blink1 = require('./src/blink1');

console.log(Blink1.devices());

var blink1 = new Blink1.Blink1();

blink1.version(function(version) {
  console.log(version);
});



blink1.fadeToRGB(1000, 255, 255, 0, function() {
  console.log('done');
  blink1.setRGB(255, 0, 0);
});