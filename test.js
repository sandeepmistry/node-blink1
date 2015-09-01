var async = require('async');

var Blink1 = require('./blink1');

var blink1 = new Blink1();

async.series([
  function(callback) {
    console.log('version');
    blink1.version(function(version) {
      console.log('\t' + version);

      callback();
    });
  },
  function(callback) {
    console.log('fadeToRGB');
    var millis = 1000;

    blink1.fadeToRGB(millis, 255, 255, 255, function() {
      console.log('\tdone');
      callback();
    });
  },
  function(callback) {
    console.log('rgb');
    blink1.rgb(function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);
      callback();
    });
  },
  function(callback) {
    console.log('fadeToRGB 1');
    var millis = 1000;

    blink1.fadeToRGB(millis, 255, 0, 0, 1, function() {
      console.log('\tdone');
      callback();
    });
  },
  function(callback) {
    console.log('rgb 1');
    blink1.rgb(1, function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);
      callback();
    });
  },
  function(callback) {
    console.log('rgb 2');
    blink1.rgb(2, function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);
      callback();
    });
  },
  function(callback) {
    console.log('fadeToRGB 2');
    var millis = 1000;

    blink1.fadeToRGB(millis, 0, 255, 0, 2, function() {
      console.log('\tdone');
      callback();
    });
  },
  function(callback) {
    console.log('rgb 1');
    blink1.rgb(1, function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);
      callback();
    });
  },
  function(callback) {
    console.log('rgb 2');
    blink1.rgb(2, function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);
      callback();
    });
  },
  function(callback) {
    console.log('setRGB');
    blink1.setRGB(0, 0, 255, function() {
      console.log('\tdone');
      callback();
    });
  },
  function(callback) {
    console.log('rgb');
    blink1.rgb(0, function(r, g, b) {
      console.log('\t' + r + ', ' + g + ', ' + b);

      callback();
    });
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