var HID = require('HID');

var VENDOR_ID = 0x27B8;
var PRODUCT_ID = 0x01ED;

var REPORT_ID = 1;

var hidDevices = function() {
  return HID.devices(VENDOR_ID, PRODUCT_ID) || [];
}

var devices = function() {
  var serialNumbers = [];
  
  hidDevices().forEach(function(device) {
    serialNumbers.push(device.serialNumber);
  });
  
  return serialNumbers;
};

function Blink1(serialNumber) {
  var devices = hidDevices();
  
  if (devices.length === 0) {
    throw new Error("No blink(1)'s could be found");
  }
  
  this.devicePath = null;
  if (serialNumber) {
    devices.some(function(device) {      
      if (serialNumber === device.serialNumber) {
        this.devicePath = device.path;
      }
      
      return (this.devicePath !== null);
    });
  } else {
    this.devicePath = devices[0].path;
  }
  
  if (this.device === null) {
    throw new Error("No blink(1)'s with serial number ' + serialNumber + ' could be found");
  }
  
  this.device = new HID.HID(this.devicePath);
  this.serialNumber = this.device.serialNumber;
  
  return this;
};

Blink1.prototype.version = function() {
  var command = [REPORT_ID, 0x76 /* 'v' */, 0, 0, 0, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);

  var response = this.device.getFeatureReport(1, 9);
  
  return ((response[3] - 0x30) * 100 + (response[4] - 0x30));
};

Blink1.prototype.eeread = function(address) {
  var command = [REPORT_ID, 0x65 /* 'e' */, 0, 0, 0, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);

  var response = this.device.getFeatureReport(1, 9);
  
  return response[3];
};

Blink1.prototype.eeread = function(address, val) {
  var command = [REPORT_ID, 0x45 /* 'E' */, 0, 0, 0, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);
};

Blink1.prototype.fadeToRGB = function(fadeMillis, r, g, b, callback) {
  var dms = fadeMillis / 10;
  
  var command = [REPORT_ID, 0x63 /* 'c' */, r, g, b, dms >> 8, dms % 0xff, 0, 0];
  this.device.sendFeatureReport(command);
  
  if (callback) {
    setTimeout(callback, fadeMillis);
  }
};

Blink1.prototype.setRGB = function(r, g, b, callback) {  
  var command = [REPORT_ID, 0x6e /* 'n' */, r, g, b, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);
  
  if (callback) {
    callback();
  }
};

Blink1.prototype.serverDown = function(millis, callback) {
  var dms = millis / 10;
  
  var command = [REPORT_ID, 0x44 /* 'D' */, dms >> 8, dms % 0xff, 0, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);
  
  if (callback) {
    setTimeout(callback, millis);
  }
};

Blink1.prototype.play = function(play, position, callback) {  
  var command = [REPORT_ID, 0x70 /* 'p' */, play, postion, 0, 0, 0, 0, 0];
  this.device.sendFeatureReport(command);
  
  if (callback) {
    callback();
  }
};

Blink1.prototype.writePatternLine = function(fadeMillis, r, g, b, callback) {
  var dms = fadeMillis / 10;
  
  var command = [REPORT_ID, 0x46 /* 'F' */, r, g, b, dms >> 8, dms % 0xff, 0, 0];
  this.device.sendFeatureReport(command);
  
  if (callback) {
    callback();
  }
};

Blink1.prototype.readPatternLine = function(pos, callback) {
  
  var command = [REPORT_ID, 0x52 /* 'R' */, 0, 0, 0, 0, 0, pos, 0];
  this.device.sendFeatureReport(command);
  
  var response = this.device.getFeatureReport(1, 9);
  
  if (callback) {
    callback({
      r: response[2],
      g: response[3],
      b: response[4],
      fadeMillis: ((response[5] << 8) + (response[6] & 0xff)) * 10
    });
  }
};

exports.Blink1 = Blink1;
exports.devices = devices;