var HID = require('node-hid');

var VENDOR_ID = 0x27B8;
var PRODUCT_ID = 0x01ED;

var REPORT_ID = 1;
var REPORT_LENGTH = 9;

var _blink1HIDdevices = function() {
  return HID.devices(VENDOR_ID, PRODUCT_ID);
};

var devices = function() {
  var serialNumbers = [];

  _blink1HIDdevices().forEach(function(device) {
    serialNumbers.push(device.serialNumber);
  });

  return serialNumbers;
};

function Blink1(serialNumber) {
  var blink1HIDdevices = _blink1HIDdevices();

  if (blink1HIDdevices.length === 0) {
    throw new Error('No blink(1)\'s could be found');
  }

  var blink1HIDdevicePath = null;

  if (serialNumber === undefined) {
    serialNumber =  blink1HIDdevices[0].serialNumber;
  }

  blink1HIDdevices.some(function(blink1HIDdevice) {
    if (serialNumber === blink1HIDdevice.serialNumber) {
      blink1HIDdevicePath = blink1HIDdevice.path;
    }

    return (blink1HIDdevicePath !== null);
  });

  if (blink1HIDdevicePath === null) {
    throw new Error('No blink(1)\'s with serial number ' + serialNumber + ' could be found');
  }

  this.serialNumber = serialNumber;
  this.hidDevice = new HID.HID(blink1HIDdevicePath);
}

Blink1.prototype._sendCommand = function(/* command [, args ...]*/) {
  var featureReport = [REPORT_ID, 0, 0, 0, 0, 0, 0, 0, 0];

  featureReport[1] = arguments[0].charCodeAt(0);

  for (var i = 1; i < arguments.length; i++) {
    featureReport[i + 1] = arguments[i];
  }

  this.hidDevice.sendFeatureReport(featureReport);
};

Blink1.prototype._readResponse = function(callback) {
  callback(this.hidDevice.getFeatureReport(REPORT_ID, REPORT_LENGTH));
};

Blink1.prototype.version = function(callback) {
  this._sendCommand('v');

  this._readResponse(function(response) {
    var version = String.fromCharCode(response[3]) + '.' + String.fromCharCode(response[4]);

    if(callback) {
      callback(version);
    }
  });
};

Blink1.prototype.eeRead = function(address, callback) {
  this._sendCommand('e', address);

  this._readResponse(function(response) {
    var value = response[3];

    if(callback) {
      callback(value);
    }
  });
};

Blink1.prototype.eeWrite = function(address, value, callback) {
  this._sendCommand('E', address, value);

  if(callback) {
    callback();
  }
};

Blink1.prototype.fadeToRGB = function(fadeMillis, r, g, b, callback) {
  var dms = fadeMillis / 10;
  this._sendCommand('c', r, g, b, dms >> 8, dms % 0xff);

  if(callback) {
    setTimeout(callback, fadeMillis);
  }
};
//
Blink1.prototype.setRGB = function(r, g, b, callback) {
  this._sendCommand('n', r, g, b);

  if (callback) {
    callback();
  }
};

Blink1.prototype.serverDown = function(on, millis, callback) {
  var dms = millis / 10;

  this._sendCommand('D', on, dms >> 8, dms % 0xff);

  if (callback) {
    setTimeout(callback, millis);
  }
};

Blink1.prototype.play = function(play, position, callback) {
  this._sendCommand('p', play, position);

  if (callback) {
    callback();
  }
};

Blink1.prototype.writePatternLine = function(fadeMillis, r, g, b, position, callback) {
  var dms = fadeMillis / 10;

  this._sendCommand('P', r, g, b, dms >> 8, dms % 0xff, position, 0);

  if (callback) {
    callback();
  }
};

Blink1.prototype.readPatternLine = function(position, callback) {
  this._sendCommand('R', 0, 0, 0, 0, 0, position, 0);

  this._readResponse(function(response) {
    var value = {
      r: response[2],
      g: response[3],
      b: response[4],
      fadeMillis: ((response[5] << 8) + (response[6] & 0xff)) * 10
    };

    if (callback) {
      callback(value);
    }
  });
};

exports.Blink1 = Blink1;
exports.devices = devices;