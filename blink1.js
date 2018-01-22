const Color = require('rgbcolor');
const Blink1_Validators = require('./validators');

class Blink1 extends Blink1_Validators {
    constructor(serialNumber) {
        super(serialNumber);
    }

    // API

    version(callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('v');

            this._readResponse().then(response => {
                resolve(String.fromCharCode(response[3]) + '.' + String.fromCharCode(response[4]));
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    eeRead(address, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateAddress(address);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('e', address);

            this._readResponse().then(response => {
                resolve(response[3]);
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    eeWrite(address, value, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateAddress(address);
                this._validateValue(value);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('E', address, value);

            this._readResponse().then(() => {
                resolve();
            });
        });

        return this._returnCallbackPromise(promise, callback);
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
        color,
        index = 0,
        callback = () => {}
    }) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateFadeMillis(delay);
                this._validateRGB(color);
                this._validateIndex(index);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            let dms = delay / 10;
            this._sendCommand('c', this.degamma(color.r), this.degamma(color.g), this.degamma(color.b), dms >> 8, dms % 0xff, index);

            setTimeout(() => resolve({
                color,
                index
            }), delay);
        });

        return this._returnCallbackPromise(promise, callback);
    }

    setRGB(color, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateRGB(color);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('n', this.degamma(color.r), this.degamma(color.g), this.degamma(color.b));
            resolve(color);
        });

        return this._returnCallbackPromise(promise, callback);
    }

    off(callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this.setRGB(new Color('black')).then(response => {
                resolve(response);
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    getRGB(index = 0, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('r', index, 0, 0, 0, 0, index);

            this._readResponse().then(response => {
                resolve(new Color('rgb('+response[2]+','+response[3]+','+response[4]+')'));
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    enableServerDown(delay, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateMillis(delay);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._serverDown(1, delay).then(response => {
                resolve();
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    disableServerDown(delay, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateMillis(delay);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._serverDown(0, delay).then(response => {
                resolve();
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    play(position, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validatePosition(position);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._play(1, position).then(response => {
                resolve();
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    playLoop({
        start,
        end,
        count,
        callback = () => {}
    }) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validatePosition(start);
                this._validatePosition(end);
                this._validateCount(count);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._playLoop(1, start, end, count).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    pause(callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._play(0, 0).then(() => {
                resolve();
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    writePatternLine({
        delay,
        color,
        position,
        callback = () => {}
    }) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validateFadeMillis(delay);
                this._validateRGB(color);
                this._validatePosition(position);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            let dms = delay / 10;
            this._sendCommand('P', this.degamma(color.r), this.degamma(color.g), this.degamma(color.b), dms >> 8, dms % 0xff, position, 0);
            resolve();
        });

        return this._returnCallbackPromise(promise, callback);
    }

    readPatternLine(position, callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._validatePosition(position);
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this._sendCommand('R', 0, 0, 0, 0, 0, position, 0);

            this._readResponse().then(response => {
                resolve({
                    color: new Color('rgb('+response[2]+','+response[3]+','+response[4]+')'),
                    delay : ((response[5] << 8) + (response[6] & 0xff)) * 10
                });
            });
        });

        return this._returnCallbackPromise(promise, callback);
    }

    close(callback = () => {}) {
        const promise = new Promise((resolve, reject) => {
            try {
                this._isValidCallback(callback);
            } catch(error) {
                reject(error);
            }

            this.hidDevice.close();
            resolve();
        });

        return this._returnCallbackPromise(promise, callback);
    }
}

module.exports = Blink1;
