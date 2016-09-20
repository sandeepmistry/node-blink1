var async = require('async');

var Blink1 = require('./blink1');

var blink1 = new Blink1();

async.series([
  function(callback) {
    console.log("repeat pattern");
    var pattern = ["black", "blue", "blue", "green", "black", {color: "black", delay: 1000}];
    blink1.repeatPattern(pattern, 3, function() {
      callback();
    });
  },
  function(callback) {
    console.log('rgb pattern');
    var pattern = [{r: 255, g: 0, b:0}, {r: 0, g: 0, b: 0, delay: 1000}, {r: 255, g: 255, b: 0}];
    blink1.playPattern(pattern, function() {
      callback();
    });
  },
  function(callback) {
    console.log('color pattern');
    var pattern = [{color: "black", delay: 1000}, "red", {color: "white", delay: 1000}, "yellow"];
    blink1.playPattern(pattern, function() {
      callback();
    });
  },
  function(callback) {
    console.log('loop pattern');
    var pattern = ["black", "red", "red", "black"];
    blink1.loopPattern(pattern);
    setTimeout(callback, 2000)
  },
  function(callback) {
    console.log('change pattern');
    var pattern = ["black", "orange", "orange", "black"];
    blink1.loopPattern(pattern);
    setTimeout(callback, 2000)
  },
  function(callback) {
    console.log("stop");
    blink1.stopPattern();
    callback();
  },
  function(callback) {
    console.log('off');
    blink1.off(function() {
      console.log('\tdone');

      callback();
    });
  },
  function() {
    process.exit(0);
  }
]);
