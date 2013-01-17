
var should = require('should');
var mockery = require('mockery');

describe('blink(1)', function() {
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

  var mockHIDdevice = {
    sendFeatureReport: function(featureReport) {
      sentFeatureReport = featureReport;
    },

    getFeatureReport: function(id, length) {
      return ((id === FEATURE_REPORT_ID ) && (length === FEATURE_REPORT_LENGTH)) ? recvFeatureReport : null;
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

  describe('#devices', function() {

    it('should return no serial numbers when there are no blink(1) HID devices', function() {
      mockHIDdevices = [];

      Blink1.devices().should.have.length(0);
    });

    it('should return two serial numbers when there are two blink(1) HID devices', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      Blink1.devices().should.eql([MOCK_HID_DEVICE_1_SERIAL_NUMBER, MOCK_HID_DEVICE_2_SERIAL_NUMBER]);
    });
  });

  describe('#Blink1', function() {

    it('should throw an error when there are no blink(1) HID devices', function() {
      mockHIDdevices = [];

      (function(){
        new Blink1.Blink1();
      }).should.throwError('No blink(1)\'s could be found');
    });

    it('should not throw an error when there are blink(1) HID devices', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1.Blink1();
    });

    it('should throw an error when there are no blink(1) HID devices with the supplied serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      (function(){
        new Blink1.Blink1(MOCK_HID_DEVICE_2_SERIAL_NUMBER);
      }).should.throwError('No blink(1)\'s with serial number ' + MOCK_HID_DEVICE_2_SERIAL_NUMBER + ' could be found');
    });

    it('should not throw an error when there are blink(1) HID devices with the supplied serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1.Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should store correct serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      var blink1 = new Blink1.Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should select first blink(1) HID device when no serial number is supplied', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      var blink1 = new Blink1.Blink1();
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should open correct HID device path', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      var blink1 = new Blink1.Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.hidDevice.should.equal(mockHIDdevice);
    });
  });

  var blink1;

  var setupBlink1 = function() {
    mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

    blink1 = new Blink1.Blink1();
  };

  var teardownBlink1 = function() {
    blink1 = null;
  };

  describe('#Blink1.version', function() {

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x76, 0, 0x31, 0x30, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should send version feature report', function() {
      blink1.version();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x76, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back with version', function(done) {
      blink1.version(function(version) {
        done();
      });
    });

    it('should call back with correct version', function(done) {

      blink1.version(function(version) {
        version.should.eql('1.0');
        done();
      });
    });
  });

  describe('#Blink1.eeRead', function() {

    var ADDRESS = 1;
    var VALUE = 5;

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x65, 0, VALUE, 0, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should send eeread feature report', function() {
      blink1.eeRead(ADDRESS);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x65, 1, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back with value', function(done) {
      blink1.eeRead(ADDRESS, function(value) {
        done();
      });
    });

    it('should call back with correct value', function(done) {

      blink1.eeRead(ADDRESS, function(value) {
        value.should.eql(VALUE);
        done();
      });
    });
  });

  describe('#Blink1.eeWrite', function() {

    var ADDRESS = 1;
    var VALUE = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send eewrite feature report', function() {
      blink1.eeWrite(ADDRESS, VALUE);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x45, ADDRESS, VALUE, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.eeWrite(ADDRESS, VALUE, done);
    });
  });

  describe('#Blink1.fadeToRGB', function() {
    var FADE_MILLIS = 10;
    var R = 10;
    var G = 20;
    var B = 40;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send fadetorgb feature report', function() {
      blink1.fadeToRGB(FADE_MILLIS, R, G, B);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x63, R, G, B, (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.fadeToRGB(FADE_MILLIS, R, G, B, done);
    });
  });

  describe('#Blink1.setRGB', function() {
    var R = 10;
    var G = 20;
    var B = 40;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send setrgb feature report', function() {
      blink1.setRGB(R, G, B);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x6e, R, G, B, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.setRGB(R, G, B, done);
    });
  });

  describe('#Blink1.serverDown', function() {
    var MILLIS = 10;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send serverdown on feature report', function() {
      blink1.serverDown(1, MILLIS);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 1, (MILLIS / 10) >> 8, (MILLIS / 10) % 0xff, 0, 0, 0, 0]);
    });

    it('should send serverdown off feature report', function() {
      blink1.serverDown(0, 0);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.serverDown(1, 0, done);
    });
  });

  describe('#Blink1.play', function() {
    var POSITION = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send play on feature report', function() {
      blink1.play(1, POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 1, POSITION, 0, 0, 0, 0, 0]);
    });

    it('should send play off feature report', function() {
      blink1.play(0, 0);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.play(1, 0, done);
    });
  });

  describe('#Blink1.writePatternLine', function() {
    var FADE_MILLIS = 10;
    var R = 10;
    var G = 20;
    var B = 40;
    var POSITION = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send writepatternline feature report', function() {
      blink1.writePatternLine(FADE_MILLIS, R, G, B, POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x50, R, G, B, (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, POSITION, 0]);
    });

    it('should call back', function(done) {
      blink1.writePatternLine(FADE_MILLIS, R, G, B, POSITION, done);
    });
  });

  describe('#Blink1.readPatternLine', function() {
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

    it('should send readpatternline feature report', function() {
      blink1.readPatternLine(POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x52, 0, 0, 0, 0, 0, POSITION, 0]);
    });

    it('should call back with value', function(done) {
      blink1.readPatternLine(POSITION, function(value) {
        done();
      });
    });

    it('should call back with correct value', function(done) {

      blink1.readPatternLine(POSITION, function(value) {
        value.r.should.eql(R);
        value.g.should.eql(G);
        value.b.should.eql(B);
        value.fadeMillis.should.eql(FADE_MILLIS);

        done();
      });
    });
  });
});