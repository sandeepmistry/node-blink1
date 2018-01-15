const HID = require('node-hid');
const _   = require('lodash');

const VENDOR_ID  = 0x27B8;
const PRODUCT_ID = 0x01ED;

const REPORT_ID     = 1;
const REPORT_LENGTH = 9;

let _blink1HIDdevices = () => {
    return HID.devices(VENDOR_ID, PRODUCT_ID);
};

let devices = () => {
    return _.map(_blink1HIDdevices(), ({ serialNumber }) => serialNumber);
};

class Blink1 {
    constructor(serialNumber) {
        let blink1HIDdevices = _blink1HIDdevices();

        if (blink1HIDdevices.length === 0) {
            throw new Error('No blink(1)\'s could be found');
        }

        var blink1HIDdevicePath = null;

        if (serialNumber === undefined) {
            serialNumber = blink1HIDdevices[0].serialNumber;
        }

        _.find(blink1HIDdevices, (blink1HIDdevice) => {
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

        this.doDegamma = true;
    }

    // Hardware API

    _sendCommand(/* command [, args ...]*/) {
        var featureReport = [REPORT_ID, 0, 0, 0, 0, 0, 0, 0, 0];

        _.forEach(arguments, (argument, k) => {
            if (k === 0) {
                featureReport[1] = argument.charCodeAt(0);
                return;
            }

            featureReport[k + 1] = argument;
        });

        this.hidDevice.sendFeatureReport(featureReport);
    }

    _readResponse() {
        return new Promise(resolve => {
            resolve(this.hidDevice.getFeatureReport(REPORT_ID, REPORT_LENGTH));
        });
    }

    // Helpers

    _isValidCallback(callback) {
        return (typeof callback === 'function');
    }

    _serverDown(on, delay) {
        return new Promise(resolve => {
            let dms = delay / 10;
            this._sendCommand('D', on, dms >> 8, dms % 0xff);

            setTimeout(resolve, delay);
        });
    }

    _play(play, position) {
        return new Promise(resolve => {
            this._sendCommand('p', play, position);
            resolve();
        });
    }

    _playLoop({
        play,
        start,
        end,
        count
    }) {
        return new Promise(resolve => {
            this._sendCommand('p', play, start, end, count);
            resolve();
        });
    }

    // Validators

    _validateNumber(number, name, min, max) {
        if (typeof number !== 'number') {
            throw new Error(name + ' must be a number');
        }

        if (number < min || number > max) {
            throw new Error(name + ' must be between ' + min + ' and ' + max);
        }
    }

    _validateAddress(address) {
        this._validateNumber(address, 'address', 0, 0xffff); // Decimal 0 - 65535
    }

    _validateValue(value) {
        this._validateNumber(value, 'value', 0, 0xff); // Decimal 0 - 255
    }

    _validateCount(value) {
        this._validateNumber(value, 'count', 0, 0xff); // Decimal 0 - 255
    }

    _validateFadeMillis(fadeMillis) {
        this._validateNumber(fadeMillis, 'fadeMillis', 0, 0x9FFF6); // Decimal 0 - 655350
    }

    _validateRGB(r, g, b) {
        this._validateNumber(r, 'r', 0, 0xff); // Decimal 0 - 255
        this._validateNumber(g, 'g', 0, 0xff); // Decimal 0 - 255
        this._validateNumber(b, 'b', 0, 0xff); // Decimal 0 - 255
    }

    _validateMillis(millis) {
        this._validateNumber(millis, 'millis', 0, 0x9FFF6); // Decimal 0 - 655350
    }

    _validatePosition(position) {
        this._validateNumber(position, 'position', 0, 11);
    }

    _validateIndex(index) {
        this._validateNumber(index, 'index', 0, 2);
    }

    // API

    version() {
        return new Promise(resolve => {
            this._sendCommand('v');

            this._readResponse().then(response => {
                resolve(String.fromCharCode(response[3]) + '.' + String.fromCharCode(response[4]));
            });
        });
    }

    eeRead(address) {
        return new Promise((resolve, reject) => {
            try {
                this._validateAddress(address);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('e', address);

            this._readResponse().then(response => {
                resolve(response[3]);
            });
        });
    }

    eeWrite(address, value) {
        return new Promise((resolve, reject) => {
            try {
                this._validateAddress(address);
                this._validateValue(value);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('E', address, value);

            this._readResponse().then(() => {
                resolve();
            });
        });
    }

    degamma(n) {
        // Allow pass-through r,g,b values
        if (!this.doDegamma) {
            return n;
        }

        return Math.floor(
            ((1 << Math.floor(n / 32)) - 1) +
            Math.floor(
                (1 << Math.floor(n / 32)) * Math.floor((n % 32) + 1) + 15
            ) / 32);
    }

    fadeToRGB({
        delay,
        red,
        green,
        blue,
        index = 0
    }) {
        return new Promise((resolve, reject) => {
            try {
                this._validateFadeMillis(delay);
                this._validateRGB(red, green, blue);
                this._validateIndex(index);
            } catch(error) {
                reject(error);
            }

            let dms = delay / 10;
            this._sendCommand('c', this.degamma(red), this.degamma(green), this.degamma(blue), dms >> 8, dms % 0xff, index);

            setTimeout(() => resolve({
                red,
                green,
                blue,
                index
            }), delay);
        });
    }

    setRGB({
        red,
        green,
        blue
    }) {
        return new Promise((resolve, reject) => {
            try {
                this._validateRGB(red, green, blue);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('n', this.degamma(red), this.degamma(green), this.degamma(blue));
            resolve({
                red,
                green,
                blue
            });
        });
    }

    off() {
        return new Promise(resolve => {
            this.setRGB({
                red   : 0,
                green : 0,
                blue  : 0
            }).then(response => {
                resolve(response);
            });
        });
    }

    getRGB(index = 0) {
        return new Promise(resolve => {
            this._sendCommand('r', index, 0, 0, 0, 0, index);

            this._readResponse().then(response => {
                var red   = response[2];
                var green = response[3];
                var blue  = response[4];

                resolve({
                    red,
                    green,
                    blue
                });
            });
        });
    }

    enableServerDown(delay) {
        return new Promise((resolve, reject) => {
            try {
                this._validateMillis(delay);
            } catch(error) {
                reject(error);
            }

            this._serverDown(1, delay).then(response => {
                resolve();
            });
        });
    }

    disableServerDown(delay) {
        return new Promise((resolve, reject) => {
            try {
                this._validateMillis(delay);
            } catch(error) {
                reject(error);
            }

            this._serverDown(0, delay).then(response => {
                resolve();
            });
        });
    }

    play(position) {
        return new Promise((resolve, reject) => {
            try {
                this._validatePosition(position);
            } catch(error) {
                reject(error);
            }

            this._play(1, position).then(response => {
                resolve();
            });
        });
    }

    playLoop({
        start,
        end,
        count
    }) {
        return new Promise((resolve, reject) => {
            try {
                this._validatePosition(start);
                this._validatePosition(end);
                this._validateCount(count);
            } catch(error) {
                reject(error);
            }

            this._playLoop(1, start, end, count).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }

    pause() {
        return new Promise(resolve => {
            this._play(0, 0).then(() => {
                resolve();
            });
        });
    }

    writePatternLine({
        delay,
        red,
        green,
        blue,
        position
    }) {
        return new Promise((resolve, reject) => {
            try {
                this._validateFadeMillis(delay);
                this._validateRGB(red, green, blue);
                this._validatePosition(position);
            } catch(error) {
                reject(error);
            }

            let dms = delay / 10;
            this._sendCommand('P', this.degamma(red), this.degamma(green), this.degamma(blue), dms >> 8, dms % 0xff, position, 0);
            resolve();
        });
    }

    readPatternLine(position) {
        return new Promise((resolve, reject) => {
            try {
                this._validatePosition(position);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('R', 0, 0, 0, 0, 0, position, 0);

            this._readResponse().then(response => {
                resolve({
                    red   : response[2],
                    green : response[3],
                    blue  : response[4],
                    delay : ((response[5] << 8) + (response[6] & 0xff)) * 10
                });
            });
        });
    }

    close() {
        return new Promise(resolve => {
            this.hidDevice.close();
            resolve();
        });
    }
}

module.exports = Blink1;
module.exports.Blink1  = Blink1; // backwards compatibility with older version
module.exports.devices = devices;
