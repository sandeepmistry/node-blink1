var Blink1 = require('./blink1');

console.log(Blink1.devices());

var blink1 = new Blink1.Blink1();

console.log(blink1.version());

blink1.fadeToRGB(1000, 255, 255, 0, function() {
  console.log('done');
  blink1.setRGB(255, 0, 0);
  blink1.serverDown(5000, function() {
    console.log('server down');
  });
});