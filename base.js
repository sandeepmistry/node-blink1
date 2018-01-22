const HID   = require('node-hid');
const _     = require('lodash');

/**********
 * CONFIG *
 **********/

const VENDOR_ID = 0x27B8;
const PRODUCT_ID = 0x01ED;

const REPORT_ID     = 1;
const REPORT_LENGTH = 9;

class Blink1_Base {
    constructor(serialNumber) {
        let blink1HIDdevices = Blink1_Base._blink1HIDdevices();

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
    }

    static _blink1HIDdevices() {
        return HID.devices(VENDOR_ID, PRODUCT_ID);
    };

    static devices() {
        return _.map(Blink1_Base._blink1HIDdevices(), ({ serialNumber }) => serialNumber);
    };

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
        return new Promise((resolve, reject) => {
            resolve(this.hidDevice.getFeatureReport(REPORT_ID, REPORT_LENGTH));
        });
    }
}

module.exports = Blink1_Base;
