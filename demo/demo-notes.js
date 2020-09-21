
var async = require('async');
var Blink1 = require('../blink1');

var blink1 = new Blink1();

console.log('hello');

var millis = 300;
async.series([

  function(callback) {
    console.log('Setting to green');
    blink1.fadeToRGB(millis, 0,200,0);
    callback();
  },

  function(callback) {
    console.log('Reading note 0, as string')
    blink1.readNote(0, function(data) {
      console.log('    data:"'+data+'"');
      callback();
    });
  },

  function(callback) {
    var notestr = "hi there this note is too long. abcdefghijklmnopqrstuvwxyz....0123456789";
    console.log('Writing note 4:');
    console.log('    note:"'+notestr+'"');
    blink1.writeNote(4, notestr, function() {
      callback();
    });
  },
  function(callback) {
    console.log('Reading note 4, as string')
    blink1.readNote(4, true, function(data) {
      // console.log("    data:",JSON.stringify(data));
      console.log('    data:"'+data+'"');
      callback();
    });
  },

  function(callback) {
    console.log('Reading note 4, as byte array')
    blink1.readNote(4, false, function(data) {
      console.log("    data:",JSON.stringify(data));
      callback();
    });
  },

  function(callback) {
    console.log('Reading chip Id')
    blink1.getId(function(iddata) {
      console.log(" Id data:",JSON.stringify(iddata));
      callback();
    });
  },

]);

console.log("Done");
