const Blink1_Helpers = require('./helpers');

class Blink1_Validators extends Blink1_Helpers {
    constructor(serialNumber) {
        super(serialNumber);
    }

    // Validators

    _isValidCallback(callback) {
        return (typeof callback === 'function');
    }

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

    _validateColor(color) {
        if (!color.ok) {
            throw new Error('color ('+color+')is invalid');
        }
    }

    _validateRGB(color) {
        this._validateColor(color);
        this._validateNumber(color.r, 'r', 0, 0xff); // Decimal 0 - 255
        this._validateNumber(color.g, 'g', 0, 0xff); // Decimal 0 - 255
        this._validateNumber(color.b, 'b', 0, 0xff); // Decimal 0 - 255
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
}

module.exports = Blink1_Validators;
