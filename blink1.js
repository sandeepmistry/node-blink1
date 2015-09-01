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

Blink1.prototype._isValidCallback = function(callback) {
  return (typeof callback === 'function');
};

Blink1.prototype._validateNumber = function(number, name, min, max) {
  if (typeof number !== 'number') {
    throw new Error(name + ' must be a number');
  }

  if (number < min || number > max) {
    throw new Error(name + ' must be between ' + min + ' and ' + max);
  }
};

Blink1.prototype._validateAddress = function(address) {
  this._validateNumber(address, 'address', 0, 0xffff);
};

Blink1.prototype._validateValue = function(value) {
  this._validateNumber(value, 'value', 0, 0xff);
};

Blink1.prototype._validateCount = function(value) {
  this._validateNumber(value, 'count', 0, 0xff);
};

Blink1.prototype._validateFadeMillis = function(fadeMillis) {
  this._validateNumber(fadeMillis, 'fadeMillis', 0, 0x9FFF6);
};

Blink1.prototype._validateRGB = function(r, g, b) {
  this._validateNumber(r, 'r', 0, 0xff);
  this._validateNumber(g, 'g', 0, 0xff);
  this._validateNumber(b, 'b', 0, 0xff);
};

Blink1.prototype._validateMillis = function(millis) {
  this._validateNumber(millis, 'millis', 0, 0x9FFF6);
};

Blink1.prototype._validatePosition = function(position) {
  this._validateNumber(position, 'position', 0, 11);
};

Blink1.prototype._validateIndex = function(index) {
  this._validateNumber(index, 'index', 0, 2);
};

Blink1.prototype._readResponse = function(callback) {
  if (this._isValidCallback(callback)) {
    callback.apply(this, [this.hidDevice.getFeatureReport(REPORT_ID, REPORT_LENGTH)]);
  }
};

Blink1.prototype.version = function(callback) {
  this._sendCommand('v');

  this._readResponse(function(response) {
    var version = String.fromCharCode(response[3]) + '.' + String.fromCharCode(response[4]);

    if(this._isValidCallback(callback)) {
      callback(version);
    }
  });
};

Blink1.prototype.eeRead = function(address, callback) {
  this._validateAddress(address);

  this._sendCommand('e', address);

  this._readResponse(function(response) {
    var value = response[3];

    if(this._isValidCallback(callback)) {
      callback(value);
    }
  });
};

Blink1.prototype.eeWrite = function(address, value, callback) {
  this._validateAddress(address);
  this._validateValue(value);

  this._sendCommand('E', address, value);

  if(this._isValidCallback(callback)) {
    callback();
  }
};

Blink1.prototype.degamma = function(n) {
  return Math.floor(((1 << Math.floor(n / 32)) - 1) +
          Math.floor((1 << Math.floor(n / 32)) * Math.floor((n % 32) + 1) + 15) / 32);
};


Blink1.prototype.fadeToRGB = function(fadeMillis, r, g, b, index, callback) {
  this._validateFadeMillis(fadeMillis);
  this._validateRGB(r, g, b);

  var dms = fadeMillis / 10;

  if (this._isValidCallback(index)) {
    // backwards compatible API, no index
    callback = index;
    index = 0;
  } else if (index === undefined) {
    index = 0;
  }

  this._validateIndex(index);

  this._sendCommand('c', this.degamma(r), this.degamma(g), this.degamma(b), dms >> 8, dms % 0xff, index);

  if(this._isValidCallback(callback)) {
    setTimeout(callback, fadeMillis);
  }
};

Blink1.prototype.setRGB = function(r, g, b, callback) {
  this._validateRGB(r, g, b);

  this._sendCommand('n', this.degamma(r), this.degamma(g), this.degamma(b));

  if(this._isValidCallback(callback)) {
    callback();
  }
};


Blink1.prototype.off = function(callback) {
  this.setRGB(0, 0, 0, callback);
};

Blink1.prototype.rgb = function(index, callback) {
  if (this._isValidCallback(index)) {
    callback = index;
    index = 0;
  } else if (index === undefined) {
    index = 0;
  }

  this._sendCommand('r', index, 0, 0, 0, 0, index);

  this._readResponse(function(response) {
    var r = response[2];
    var g = response[3];
    var b = response[4];

    if(this._isValidCallback(callback)) {
      callback(r, g, b);
    }
  });
};

Blink1.prototype._serverDown = function(on, millis, callback) {
  var dms = millis / 10;

  this._sendCommand('D', on, dms >> 8, dms % 0xff);

  if(this._isValidCallback(callback)) {
    setTimeout(callback, millis);
  }
};

Blink1.prototype.enableServerDown = function(millis, callback) {
  this._validateMillis(millis);

  this._serverDown(1, millis, callback);
};

Blink1.prototype.disableServerDown = function(millis, callback) {
  this._validateMillis(millis);

  this._serverDown(0, millis, callback);
};

Blink1.prototype._play = function(play, position, callback) {
  this._sendCommand('p', play, position);

  if(this._isValidCallback(callback)) {
    callback();
  }
};

Blink1.prototype.play = function(position, callback) {
  this._validatePosition(position);

  this._play(1, position, callback);
};

Blink1.prototype._playLoop = function(play, position, endPosition, count, callback) {
  this._sendCommand('p', play, position, endPosition, count);

  if(this._isValidCallback(callback)) {
    callback();
  }
};

Blink1.prototype.playLoop = function(startPosition, endPosition, count, callback) {
  this._validatePosition(startPosition);
  this._validatePosition(endPosition);
  this._validateCount(count);

  this._playLoop(1, startPosition, endPosition, count, callback);
};

Blink1.prototype.pause = function(callback) {
  this._play(0, 0, callback);
};

Blink1.prototype.writePatternLine = function(fadeMillis, r, g, b, position, callback) {
  this._validateFadeMillis(fadeMillis);
  this._validateRGB(r, g, b);
  this._validatePosition(position);

  var dms = fadeMillis / 10;

  this._sendCommand('P', this.degamma(r), this.degamma(g), this.degamma(b), dms >> 8, dms % 0xff, position, 0);

  if(this._isValidCallback(callback)) {
    callback();
  }
};

Blink1.prototype.readPatternLine = function(position, callback) {
  this._validatePosition(position);

  this._sendCommand('R', 0, 0, 0, 0, 0, position, 0);

  this._readResponse(function(response) {
    var value = {
      r: response[2],
      g: response[3],
      b: response[4],
      fadeMillis: ((response[5] << 8) + (response[6] & 0xff)) * 10
    };

    if(this._isValidCallback(callback)) {
      callback(value);
    }
  });
};

Blink1.prototype.close = function(callback) {
	this.hidDevice.close();

  if(this._isValidCallback(callback)) {
    callback();
  }
};

Blink1.devices = devices;

module.exports = Blink1;
module.exports.Blink1 = Blink1; // backwards compatibility with older version

