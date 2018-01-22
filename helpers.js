const Blink1_Base = require('./base');

class Blink1_Helpers extends Blink1_Base {
    constructor(serialNumber) {
        super(serialNumber);
    }

    // Helpers

    _returnCallbackPromise(promise, callback) {
        try {
            this._isValidCallback(callback);
        } catch(error) {
            return promise;
        }

        promise.then(callback);
        return promise;
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
}

module.exports = Blink1_Helpers;
