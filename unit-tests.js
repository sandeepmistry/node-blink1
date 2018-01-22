var Color = require('rgbcolor');

var should = require('should');
var mockery = require('mockery');

describe('blink(1)', () => {
  var BLINK1_SRC_PATH = './blink1';

  var VENDOR_ID = 0x27B8;
  var PRODUCT_ID = 0x01ED;

  var FEATURE_REPORT_ID = 1;
  var FEATURE_REPORT_LENGTH = 9;

  var MOCK_HID_DEVICE_1_SERIAL_NUMBER = '1A001407';
  var MOCK_HID_DEVICE_2_SERIAL_NUMBER = '1A001408';
  var MOCK_HID_DEVICE_1_PATH = 'path_1A001407';
  var MOCK_HID_DEVICE_2_PATH = 'path_1A001408';

  var MOCK_HID_DEVICE_1 = {
    serialNumber: MOCK_HID_DEVICE_1_SERIAL_NUMBER,
    path: MOCK_HID_DEVICE_1_PATH
  };

  var MOCK_HID_DEVICE_2 = {
    serialNumber: MOCK_HID_DEVICE_2_SERIAL_NUMBER,
    path: MOCK_HID_DEVICE_2_PATH
  };

  var Blink1;
  var mockHIDdevices;
  var sentFeatureReport;
  var recvFeatureReport;
  var closed = false;

  var mockHIDdevice = {
    sendFeatureReport: function(featureReport) {
      sentFeatureReport = featureReport;
    },

    getFeatureReport: function(id, length) {
      return ((id === FEATURE_REPORT_ID ) && (length === FEATURE_REPORT_LENGTH)) ? recvFeatureReport : null;
    },

    close: function() {
      closed = true;
    }
  };

  var mockHID = {
    devices: function(vendorId, productId) {
      return ((vendorId === VENDOR_ID) && (productId === PRODUCT_ID)) ? mockHIDdevices : null;
    },

    HID: function(path) {
      return (path === MOCK_HID_DEVICE_1_PATH) ? mockHIDdevice : null;
    }
  };

  beforeEach(function() {
    mockery.registerAllowable(BLINK1_SRC_PATH);
    mockery.enable();

    mockery.registerMock('node-hid', mockHID);

    Blink1 = require(BLINK1_SRC_PATH);
  });

  afterEach(function() {
    mockery.deregisterAllowable(BLINK1_SRC_PATH);
    mockery.disable();

    mockery.deregisterMock('node-hid');

    Blink1 = null;
    mockHIDdevices = null;

    recvFeatureReport = null;
    sentFeatureReport = null;
  });

  describe('#devices', () => {

    it('should return no serial numbers when there are no blink(1) HID devices', () => {
      mockHIDdevices = [];

      Blink1.devices().should.have.length(0);
    });

    it('should return two serial numbers when there are two blink(1) HID devices', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      Blink1.devices().should.eql([MOCK_HID_DEVICE_1_SERIAL_NUMBER, MOCK_HID_DEVICE_2_SERIAL_NUMBER]);
    });
  });

  describe('#Blink1', () => {

    it('should reject (catch) promise when there are no blink(1) HID devices', () => {
      mockHIDdevices = [];

      (function(){
        new Blink1();
      }).should.throwError('No blink(1)\'s could be found');
    });

    it('should not throw an error when there are blink(1) HID devices', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1();
    });

    it('should reject (catch) promise when there are no blink(1) HID devices with the supplied serial number', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      (function(){
        new Blink1(MOCK_HID_DEVICE_2_SERIAL_NUMBER);
      }).should.throwError('No blink(1)\'s with serial number ' + MOCK_HID_DEVICE_2_SERIAL_NUMBER + ' could be found');
    });

    it('should not throw an error when there are blink(1) HID devices with the supplied serial number', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should store correct serial number', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      var blink1 = new Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should select first blink(1) HID device when no serial number is supplied', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      var blink1 = new Blink1();
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should open correct HID device path', () => {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      var blink1 = new Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.hidDevice.should.equal(mockHIDdevice);
    });
  });

  var blink1;

  var setupBlink1 = function() {
    mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

    blink1 = new Blink1();
  };

  var teardownBlink1 = function() {
    blink1 = null;
  };

  describe('#Blink1.version', () => {

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x76, 0, 0x31, 0x30, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should send version feature report', () => {
      blink1.version();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x76, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise with version', (done) => {
      blink1.version().then(version => {
        done();
      });
    });

    it('should resolve promise with correct version', (done) => {

      blink1.version().then(version => {
        version.should.eql('1.0');
        done();
      });
    });
  });

  describe('#Blink1.eeRead', () => {

    var ADDRESS = 1;
    var VALUE = 5;

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x65, 0, VALUE, 0, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should reject (catch) promise when address is not a number', () => {
      (function(){
        blink1.eeRead('Bad address').catch((error) => {
            error.should.eql("Bad address must be a number")
        });
      })
    });

    it('should reject (catch) promise when address is less than 0', () => {
      (function(){
        blink1.eeRead(-1).catch((error) => {
            error.should.eql("address must be between 0 and 65535")
        });
      })
    });

    it('should reject (catch) promise when address is greater than 65535', () => {
      (function(){
        blink1.eeRead(65536).catch((error) => {
            error.should.eql("address must be between 0 and 65535")
        });
      })
    });

    it('should send eeread feature report', () => {
      blink1.eeRead(ADDRESS);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x65, 1, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise with value', (done) => {
      blink1.eeRead(ADDRESS).then(value => {
        done();
      });
    });

    it('should resolve promise with correct value', (done) => {

      blink1.eeRead(ADDRESS).then(value => {
        value.should.eql(VALUE);
        done();
      });
    });
  });

  describe('#Blink1.eeWrite', () => {

    var ADDRESS = 1;
    var VALUE = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when address is not a number', () => {
      (function(){
        blink1.eeWrite('Bad address', VALUE).catch(error => {
            error.should.eql("bad address must be a number");
        });
      })
    });

    it('should reject (catch) promise when address is less than 0', () => {
      (function(){
        blink1.eeWrite(-1, VALUE).catch(error => {
            error.should.eql("address must be between 0 and 65535");
        });
      })
    });

    it('should reject (catch) promise when address is greater than 65535', () => {
      (function(){
        blink1.eeWrite(65536, VALUE).catch(error => {
            error.should.eql("address must be between 0 and 65535");
        });
      })
    });

    it('should reject (catch) promise when value is not a number', () => {
      (function(){
        blink1.eeWrite(ADDRESS, 'Bad value').catch(error => {
            error.should.eql("Bad value must be a number");
        });
      })
    });

    it('should reject (catch) promise when value is less than 0', () => {
      (function(){
        blink1.eeWrite(ADDRESS, -1).catch(error => {
            error.should.eql("value must be between 0 and 255");
        });
      })
    });

    it('should reject (catch) promise when value is greater than 255', () => {
      (function(){
        blink1.eeWrite(ADDRESS, 256).catch(error => {
            error.should.eql("value must be between 0 and 255");
        });
      })
    });

    it('should send eewrite feature report', () => {
      blink1.eeWrite(ADDRESS, VALUE);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x45, ADDRESS, VALUE, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.eeWrite(ADDRESS, VALUE).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.fadeToRGB', () => {
    var FADE_MILLIS = 10;
    var R = 10;
    var G = 20;
    var B = 40;
    var INDEX = 1;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when fadeMillis is not a number', () => {
      (function(){
        blink1.fadeToRGB({
            delay : 'Bad fadeMillis',
            color : new Color('rgb('+R+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("fadeMillis must be a number");
        });
      });
    });

    it('should reject (catch) promise when fadeMillis is less than 0', () => {
      (function(){
        blink1.fadeToRGB({
            delay : -1,
            color : new Color('rgb('+R+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("fadeMillis must be between 0 and 655350");
        });
      });
    });

    it('should reject (catch) promise when fadeMillis is greater than 655350', () => {
      (function(){
        blink1.fadeToRGB({
            delay : 655351,
            color : new Color('rgb('+R+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("fadeMillis must be between 0 and 655350");
        });
      });
    });

    it('should reject (catch) promise when r is not a number', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("r must be a number");
        });
      });
    });

    it('should reject (catch) promise when r is less than 0', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+-1+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("r must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when r is greater than 255', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+256+','+G+','+B+')')
        }).catch(error => {
            error.should.eql("r must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when g is not a number', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+',Bad g,'+B+')')
        }).catch(error => {
            error.should.eql("g must be a number");
        });
      });
    });

    it('should reject (catch) promise when g is less than 0', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+-1+','+B+')')
        }).catch(error => {
            error.should.eql("g must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when g is greater than 255', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+256+','+B+')')
        }).catch(error => {
            error.should.eql("g must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when b is not a number', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+',Bad b)')
        }).catch(error => {
            error.should.eql("b must be a number");
        });
      });
    });

    it('should reject (catch) promise when b is less than 0', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+-1+')')
        }).catch(error => {
            error.should.eql("b must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when b is greater than 255', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+256+')')
        }).catch(error => {
            error.should.eql("b must be between 0 and 255");
        });
      });
    });

    it('should send fadetorgb feature report', () => {
      blink1.fadeToRGB({
          delay : FADE_MILLIS,
          color : new Color('rgb('+R+','+G+','+B+')')
      });

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x63, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.fadeToRGB({
          delay : FADE_MILLIS,
          color : new Color('rgb('+R+','+G+','+B+')')
      }).then(() => {
          done();
      });
    });

    it('should reject (catch) promise when index is less than 0', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')'),
            index : -1
        }).catch(error => {
            error.should.eql("index must be between 0 and 2");
        });
      });
    });

    it('should reject (catch) promise when index is greater than 2', () => {
      (function(){
        blink1.fadeToRGB({
            delay : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')'),
            index : 3
        }).catch(error => {
            error.should.eql("index must be between 0 and 2");
        });
      });
    });

    it('should send fadetorgb index feature report', () => {
      blink1.fadeToRGB({
          delay : FADE_MILLIS,
          color : new Color('rgb('+R+','+G+','+B+')'),
          index : INDEX
      });

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x63, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, INDEX, 0]);
    });

    it('should resolve promise (index)', (done) => {
      blink1.fadeToRGB({
          delay : FADE_MILLIS,
          color : new Color('rgb('+R+','+G+','+B+')'),
          index : INDEX
      }).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.setRGB', () => {
    var R = 10;
    var G = 20;
    var B = 40;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when r is not a number', () => {
      (function(){
        blink1.setRGB(new Color('rgb(bad r,'+G+','+B+')')).catch(error => {
            error.should.eql("r must be a number");
        });
      });
    });

    it('should reject (catch) promise when r is less than 0', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+-1+','+G+','+B+')')).catch(error => {
            error.should.eql("r must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when r is greater than 255', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+256+','+G+','+B+')')).catch(error => {
            error.should.eql("r must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when g is not a number', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+',Bad g,'+B+')')).catch(error => {
            error.should.eql("g must be a number");
        });
      });
    });

    it('should reject (catch) promise when g is less than 0', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+','+-1+','+B+')')).catch(error => {
            error.should.eql("g must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when g is greater than 255', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+','+256+','+B+')')).catch(error => {
            error.should.eql("g must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when b is not a number', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+','+G+',Bad b)')).catch(error => {
            error.should.eql("b must be a number");
        });
      });
    });

    it('should reject (catch) promise when b is less than 0', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+','+G+','+-1+')')).catch(error => {
            error.should.eql("b must be between 0 and 255");
        });
      });
    });

    it('should reject (catch) promise when b is greater than 255', () => {
      (function(){
        blink1.setRGB(new Color('rgb('+R+','+G+','+256+')')).catch(error => {
            error.should.eql("b must be between 0 and 255");
        });
      });
    });

    it('should send setrgb feature report', () => {
      blink1.setRGB(new Color('rgb('+R+','+G+','+B+')'));

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x6e, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.setRGB(new Color('rgb('+R+','+G+','+B+')')).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.off', () => {

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send setrgb 0, 0, 0 feature report', () => {
      blink1.off();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x6e, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.off().then(() => {
          done();
      });
    });
  });

  describe('#Blink1.getRGB', () => {
    var INDEX = 1;
    var R = 1;
    var G = 2;
    var B = 3;

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x72, R, G, B, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should send rgb feature report', () => {
      blink1.getRGB();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x72, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise with r, g, b', (done) => {
      blink1.getRGB().then(({r, g, b}) => {
        done();
      });
    });

    it('should resolve promise with correct r, g, b', (done) => {
      blink1.getRGB().then(({r, g, b}) => {
          r.should.eql(R);
          g.should.eql(G);
          b.should.eql(B);
        done();
      });
    });

    it('should send rgb index feature report', () => {
      blink1.getRGB(INDEX);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x72, INDEX, 0, 0, 0, 0, INDEX, 0]);
    });

    it('should resolve promise with r, g, b (index)', (done) => {
      blink1.getRGB(INDEX).then(({r, g, b}) => {
        done();
      });
    });

    it('should resolve promise with correct r, g, b (index)', (done) => {
      blink1.getRGB(INDEX).then(({r, g, b}) => {
          r.should.eql(R);
          g.should.eql(G);
          b.should.eql(B);
        done();
      });
    });
  });

  describe('#Blink1.enableServerDown', () => {
    var MILLIS = 10;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when millis is not a number', () => {
      (function(){
        blink1.enableServerDown('Bad millis').catch(error => {
          error.should.eql("millis must be a number");
        });
      });
    });

    it('should reject (catch) promise when millis is less than 0', () => {
      (function(){
        blink1.enableServerDown(-1).catch(error => {
          error.should.eql("millis must be between 0 and 655350");
        });
      });
    });

    it('should reject (catch) promise when millis is greater than 655350', () => {
      (function(){
        blink1.enableServerDown(655351).catch(error => {
          error.should.eql("millis must be between 0 and 655350");
        });
      });
    });

    it('should send serverdown on feature report', () => {
      blink1.enableServerDown(MILLIS);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 1, (MILLIS / 10) >> 8, (MILLIS / 10) % 0xff, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.enableServerDown(0).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.disableServerDown', () => {
    var MILLIS = 10;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when millis is not a number', () => {
      (function(){
        blink1.disableServerDown('Bad millis').catch(error => {
          error.should.eql("millis must be a number");
        });
      });
    });

    it('should reject (catch) promise when millis is less than 0', () => {
      (function(){
        blink1.disableServerDown(-1).catch(error => {
          error.should.eql("millis must be between 0 and 655350");
        });
      });
    });

    it('should reject (catch) promise when millis is greater than 655350', () => {
      (function(){
        blink1.disableServerDown(-1).catch(error => {
          error.should.eql("millis must be between 0 and 655350");
        });
      });
    });

    it('should send serverdown off feature report', () => {
      blink1.disableServerDown(0);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.disableServerDown(0).then(() => {
        done();
      });
    });
  });

  describe('#Blink1.play', () => {
    var POSITION = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);


    it('should reject (catch) promise when position is not a number', () => {
      (function(){
        blink1.play('Bad position').catch(error => {
            error.should.eql('position must be a number');
        });
      });
    });

    it('should reject (catch) promise when position is less than 0', () => {
      (function(){
        blink1.play(-1).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when position is greater than 11', () => {
      (function(){
        blink1.play(12).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should send play on feature report', () => {
      blink1.play(POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 1, POSITION, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.play(0).then(() => {
        done();
      });
    });
  });

  describe('#Blink1.playLoop', () => {
    var STARTPOSITION = 5;
    var ENDPOSITION = 8;
    var COUNT = 1;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);


    it('should reject (catch) promise when start position is not a number', () => {
      (function(){
        blink1.playLoop({
            start : 'Bad position',
            end   : 2,
            count : 2
        }).catch(error => {
            error.should.eql('position must be a number');
        });
      });
    });

    it('should reject (catch) promise when end position is not a number', () => {
      (function(){
        blink1.playLoop({
            start : 1,
            end   : 'Bad position',
            count : 2
        }).catch(error => {
            error.should.eql('position must be a number');
        });
      });
    });

    it('should reject (catch) promise when count is not a number', () => {
      (function(){
        blink1.playLoop({
            start : 1,
            end   : 2,
            count : 'Bad count'
        }).catch(error => {
            error.should.eql('count must be a number');
        });
      });
    });

    it('should reject (catch) promise when start position is less than 0', () => {
      (function(){
        blink1.playLoop({
            start : -1,
            end   : 2,
            count : 2
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when end position is less than 0', () => {
      (function(){
        blink1.playLoop({
            start : 1,
            end   : -1,
            count : 2
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when count is less than 0', () => {
      (function(){
        blink1.playLoop({
            start : 1,
            end   : 1,
            count : -1
        }).catch(error => {
            error.should.eql('count must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when start position is greater than 11', () => {
      (function(){
        blink1.playLoop({
            start : 12,
            end   : 2,
            count : 2
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when end position is greater than 11', () => {
      (function(){
        blink1.playLoop({
            start : 2,
            end   : 12,
            count : 2
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should send play on feature report', () => {
      (function(){
        blink1.playLoop({
          start : STARTPOSITION,
          end   : ENDPOSITION,
          count : COUNT
        });

        sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 1, STARTPOSITION, ENDPOSITION, COUNT, 0, 0, 0]);
      });
    });

    it('should resolve promise', (done) => {
      blink1.playLoop({
          start : 0,
          end   : 1,
          count : 1
      }).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.pause', () => {
    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send play off feature report', () => {
      blink1.pause();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.pause().then(() => {
        done();
      });
    });
  });

  describe('#Blink1.writePatternLine', () => {
    var FADE_MILLIS = 10;
    var R = 10;
    var G = 20;
    var B = 40;
    var POSITION = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should reject (catch) promise when fadeMillis is not a number', () => {
      (function(){
        blink1.writePatternLine({
            delay    : 'Bad fadeMillis',
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('fadeMillis must be a number');
        });
      });
    });

    it('should reject (catch) promise when fadeMillis is less than 0', () => {
      (function(){
        blink1.writePatternLine({
            delay    : -1,
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('fadeMillis must be between 0 and 655350');
        });
      });
    });

    it('should reject (catch) promise when fadeMillis is greater than 655350', () => {
      (function(){
        blink1.writePatternLine({
            delay    : 655351,
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('fadeMillis must be between 0 and 655350');
        });
      });
    });

    it('should reject (catch) promise when r is not a number', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb(Bad r,'+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('r must be a number');
        });
      });
    });

    it('should reject (catch) promise when r is less than 0', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+-1+','+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('r must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when r is greater than 255', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+256+','+G+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('r must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when g is not a number', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+',Bad g,'+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('g must be a number');
        });
      });
    });

    it('should reject (catch) promise when g is less than 0', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+-1+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('g must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when g is greater than 255', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+256+','+B+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('g must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when b is not a number', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+',Bad b)'),
            position : POSITION
        }).catch(error => {
            error.should.eql('b must be a number');
        });
      });
    });

    it('should reject (catch) promise when b is less than 0', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+-1+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('b must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when b is greater than 255', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+256+')'),
            position : POSITION
        }).catch(error => {
            error.should.eql('b must be between 0 and 255');
        });
      });
    });

    it('should reject (catch) promise when position is not a number', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : 'Bad position'
        }).catch(error => {
            error.should.eql('position must be a number');
        });
      });
    });

    it('should reject (catch) promise when position is less than 0', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : -1
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when position is greater than 11', () => {
      (function(){
        blink1.writePatternLine({
            delay    : FADE_MILLIS,
            color : new Color('rgb('+R+','+G+','+B+')'),
            position : 12
        }).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should send writepatternline feature report', () => {
      blink1.writePatternLine({
          delay    : FADE_MILLIS,
          color    : new Color('rgb('+R+','+G+','+B+')'),
          position : POSITION
      });

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x50, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, POSITION, 0]);
    });

    it('should resolve promise', (done) => {
      blink1.writePatternLine({
          delay    : FADE_MILLIS,
          color    : new Color('rgb('+R+','+G+','+B+')'),
          position : POSITION
      }).then(() => {
          done();
      });
    });
  });

  describe('#Blink1.readPatternLine', () => {
    var POSITION = 5;

    var FADE_MILLIS = 1000;
    var R = 10;
    var G = 20;
    var B = 40;

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x52, R, G, B, (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, POSITION, 0];
    });
    afterEach(teardownBlink1);

    it('should reject (catch) promise when position is not a number', () => {
      (function(){
        blink1.readPatternLine('Bad position').catch(error => {
            error.should.eql('position must be a number');
        });
      });
    });

    it('should reject (catch) promise when position is less than 0', () => {
      (function(){
        blink1.readPatternLine(-1).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should reject (catch) promise when position is greater than 11', () => {
      (function(){
        blink1.readPatternLine(12).catch(error => {
            error.should.eql('position must be between 0 and 11');
        });
      });
    });

    it('should send readpatternline feature report', () => {
      blink1.readPatternLine(POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x52, 0, 0, 0, 0, 0, POSITION, 0]);
    });

    it('should resolve promise with value', (done) => {
      blink1.readPatternLine(POSITION).then(({
          color,
          delay
      }) => {
          done();
      });
    });

    it('should resolve promise with correct value', (done) => {

      blink1.readPatternLine(POSITION).then(({
          color,
          delay
      }) => {
          color.r.should.eql(R);
          color.g.should.eql(G);
          color.b.should.eql(B);
          delay.should.eql(FADE_MILLIS);

          done();
      });
    });
  });

  describe('#Blink1.close', () => {
    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should close HID device', (done) => {
      blink1.close().then(() => {
        done();
      });

      closed.should.eql(true);
    });

    it('should resolve promise', (done) => {
      blink1.close().then(() => {
        closed.should.eql(true);

        done();
      });
    });
  });
});
