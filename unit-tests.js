
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
        new Blink1();
      }).should.throwError('No blink(1)\'s could be found');
    });

    it('should not throw an error when there are blink(1) HID devices', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1();
    });

    it('should throw an error when there are no blink(1) HID devices with the supplied serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      (function(){
        new Blink1(MOCK_HID_DEVICE_2_SERIAL_NUMBER);
      }).should.throwError('No blink(1)\'s with serial number ' + MOCK_HID_DEVICE_2_SERIAL_NUMBER + ' could be found');
    });

    it('should not throw an error when there are blink(1) HID devices with the supplied serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      new Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should store correct serial number', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1];

      var blink1 = new Blink1(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should select first blink(1) HID device when no serial number is supplied', function() {
      mockHIDdevices = [MOCK_HID_DEVICE_1, MOCK_HID_DEVICE_2];

      var blink1 = new Blink1();
      blink1.serialNumber.should.eql(MOCK_HID_DEVICE_1_SERIAL_NUMBER);
    });

    it('should open correct HID device path', function() {
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

    it('should throw an error when address is not a number', function() {
      (function(){
        blink1.eeRead('Bad address');
      }).should.throwError('address must be a number');
    });

    it('should throw an error when address is less than 0', function() {
      (function(){
        blink1.eeRead(-1);
      }).should.throwError('address must be between 0 and 65535');
    });

    it('should throw an error when address is greater than 65535', function() {
      (function(){
        blink1.eeRead(65536);
      }).should.throwError('address must be between 0 and 65535');
    });

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

    it('should throw an error when address is not a number', function() {
      (function(){
        blink1.eeWrite('Bad address', VALUE);
      }).should.throwError('address must be a number');
    });

    it('should throw an error when address is less than 0', function() {
      (function(){
        blink1.eeWrite(-1, VALUE);
      }).should.throwError('address must be between 0 and 65535');
    });

    it('should throw an error when address is greater than 65535', function() {
      (function(){
        blink1.eeWrite(65536, VALUE);
      }).should.throwError('address must be between 0 and 65535');
    });

    it('should throw an error when value is not a number', function() {
      (function(){
        blink1.eeWrite(ADDRESS, 'Bad value');
      }).should.throwError('value must be a number');
    });

    it('should throw an error when value is less than 0', function() {
      (function(){
        blink1.eeWrite(ADDRESS, -1);
      }).should.throwError('value must be between 0 and 255');
    });

    it('should throw an error when value is greater than 255', function() {
      (function(){
        blink1.eeWrite(ADDRESS, 256);
      }).should.throwError('value must be between 0 and 255');
    });

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
    var INDEX = 1;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should throw an error when fadeMillis is not a number', function() {
      (function(){
        blink1.fadeToRGB('Bad fadeMillis', R, G, B);
      }).should.throwError('fadeMillis must be a number');
    });

    it('should throw an error when fadeMillis is less than 0', function() {
      (function(){
        blink1.fadeToRGB(-1, R, G, B);
      }).should.throwError('fadeMillis must be between 0 and 655350');
    });

    it('should throw an error when fadeMillis is greater than 655350', function() {
      (function(){
        blink1.fadeToRGB(655351, R, G, B);
      }).should.throwError('fadeMillis must be between 0 and 655350');
    });

    it('should throw an error when r is not a number', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, 'Bad r', G, B);
      }).should.throwError('r must be a number');
    });

    it('should throw an error when r is less than 0', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, -1, G, B);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when r is greater than 255', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, 256, G, B);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when g is not a number', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, 'Bad g', B);
      }).should.throwError('g must be a number');
    });

    it('should throw an error when g is less than 0', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, -1, B);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when g is greater than 255', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, 256, B);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when b is not a number', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, G, 'Bad b');
      }).should.throwError('b must be a number');
    });

    it('should throw an error when b is less than 0', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, G, -1);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should throw an error when b is greater than 255', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, G, 256);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should send fadetorgb feature report', function() {
      blink1.fadeToRGB(FADE_MILLIS, R, G, B);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x63, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.fadeToRGB(FADE_MILLIS, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), done);
    });

    it('should throw an error when index is less than 0', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, G, B, -1);
      }).should.throwError('index must be between 0 and 2');
    });

    it('should throw an error when index is greater than 2', function() {
      (function(){
        blink1.fadeToRGB(FADE_MILLIS, R, G, B, 3);
      }).should.throwError('index must be between 0 and 2');
    });

    it('should send fadetorgb index feature report', function() {
      blink1.fadeToRGB(FADE_MILLIS, R, G, B, INDEX);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x63, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, INDEX, 0]);
    });

    it('should call back (index)', function(done) {
      blink1.fadeToRGB(FADE_MILLIS, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), INDEX, done);
    });
  });

  describe('#Blink1.setRGB', function() {
    var R = 10;
    var G = 20;
    var B = 40;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should throw an error when r is not a number', function() {
      (function(){
        blink1.setRGB('Bad r', G, B);
      }).should.throwError('r must be a number');
    });

    it('should throw an error when r is less than 0', function() {
      (function(){
        blink1.setRGB(-1, G, B);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when r is greater than 255', function() {
      (function(){
        blink1.setRGB(256, G, B);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when g is not a number', function() {
      (function(){
        blink1.setRGB(R, 'Bad g', B);
      }).should.throwError('g must be a number');
    });

    it('should throw an error when g is less than 0', function() {
      (function(){
        blink1.setRGB(R, -1, B);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when g is greater than 255', function() {
      (function(){
        blink1.setRGB(R, 256, B);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when b is not a number', function() {
      (function(){
        blink1.setRGB(R, G, 'Bad b');
      }).should.throwError('b must be a number');
    });

    it('should throw an error when b is less than 0', function() {
      (function(){
        blink1.setRGB(R, G, -1);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should throw an error when b is greater than 255', function() {
      (function(){
        blink1.setRGB(R, G, 256);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should send setrgb feature report', function() {
      blink1.setRGB(R, G, B);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x6e, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.setRGB(R, G, B, done);
    });
  });

  describe('#Blink1.off', function() {

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send setrgb 0, 0, 0 feature report', function() {
      blink1.off();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x6e, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.off(done);
    });
  });

  describe('#Blink1.rgb', function() {
    var INDEX = 1;
    var R = 1;
    var G = 2;
    var B = 3;

    beforeEach(function() {
      setupBlink1();

      recvFeatureReport = [FEATURE_REPORT_ID, 0x72, R, G, B, 0, 0, 0, 0];
    });
    afterEach(teardownBlink1);

    it('should send rgb feature report', function() {
      blink1.rgb();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x72, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back with r, g, b', function(done) {
      blink1.rgb(function(r, g, b) {
        done();
      });
    });

    it('should call back with correct r, g, b', function(done) {
      blink1.rgb(function(r, g, b) {
        r.should.eql(R);
        g.should.eql(G);
        b.should.eql(B);
        done();
      });
    });

    it('should send rgb index feature report', function() {
      blink1.rgb(INDEX);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x72, INDEX, 0, 0, 0, 0, INDEX, 0]);
    });

    it('should call back with r, g, b (index)', function(done) {
      blink1.rgb(INDEX, function(r, g, b) {
        done();
      });
    });

    it('should call back with correct r, g, b (index)', function(done) {
      blink1.rgb(INDEX, function(r, g, b) {
        r.should.eql(R);
        g.should.eql(G);
        b.should.eql(B);
        done();
      });
    });
  });

  describe('#Blink1.enableServerDown', function() {
    var MILLIS = 10;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should throw an error when millis is not a number', function() {
      (function(){
        blink1.enableServerDown('Bad millis');
      }).should.throwError('millis must be a number');
    });

    it('should throw an error when millis is less than 0', function() {
      (function(){
        blink1.enableServerDown(-1);
      }).should.throwError('millis must be between 0 and 655350');
    });

    it('should throw an error when millis is greater than 655350', function() {
      (function(){
        blink1.enableServerDown(655351);
      }).should.throwError('millis must be between 0 and 655350');
    });

    it('should send serverdown on feature report', function() {
      blink1.enableServerDown(MILLIS);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 1, (MILLIS / 10) >> 8, (MILLIS / 10) % 0xff, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.enableServerDown(0, done);
    });
  });

  describe('#Blink1.disableServerDown', function() {
    var MILLIS = 10;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should throw an error when millis is not a number', function() {
      (function(){
        blink1.disableServerDown('Bad millis');
      }).should.throwError('millis must be a number');
    });

    it('should throw an error when millis is less than 0', function() {
      (function(){
        blink1.disableServerDown(-1);
      }).should.throwError('millis must be between 0 and 655350');
    });

    it('should throw an error when millis is greater than 655350', function() {
      (function(){
        blink1.disableServerDown(655351);
      }).should.throwError('millis must be between 0 and 655350');
    });

    it('should send serverdown off feature report', function() {
      blink1.disableServerDown(0);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x44, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.disableServerDown(0, done);
    });
  });

  describe('#Blink1.play', function() {
    var POSITION = 5;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);


    it('should throw an error when position is not a number', function() {
      (function(){
        blink1.play('Bad position');
      }).should.throwError('position must be a number');
    });

    it('should throw an error when position is less than 0', function() {
      (function(){
        blink1.play(-1);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when position is greater than 11', function() {
      (function(){
        blink1.play(12);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should send play on feature report', function() {
      blink1.play(POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 1, POSITION, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.play(0, done);
    });
  });

  describe('#Blink1.playLoop', function() {
    var STARTPOSITION = 5;
    var ENDPOSITION = 8;
    var COUNT = 1;

    beforeEach(setupBlink1);
    afterEach(teardownBlink1);


    it('should throw an error when start position is not a number', function() {
      (function(){
        blink1.playLoop('Bad position', 2, 2);
      }).should.throwError('position must be a number');
    });

    it('should throw an error when end position is not a number', function() {
      (function(){
        blink1.playLoop(1, 'Bad position', 2);
      }).should.throwError('position must be a number');
    });

    it('should throw an error when count is not a number', function() {
      (function(){
        blink1.playLoop(1, 2, 'Bad count');
      }).should.throwError('count must be a number');
    });

    it('should throw an error when start position is less than 0', function() {
      (function(){
        blink1.playLoop(-1, 2, 2);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when end position is less than 0', function() {
      (function(){
        blink1.playLoop(1, -1, 2);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when count is less than 0', function() {
      (function(){
        blink1.playLoop(1, 1, -1);
      }).should.throwError('count must be between 0 and 255');
    });

    it('should throw an error when start position is greater than 11', function() {
      (function(){
        blink1.playLoop(12, 2, 2);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when end position is greater than 11', function() {
      (function(){
        blink1.playLoop(2, 12, 2);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should send play on feature report', function() {
      blink1.playLoop(STARTPOSITION, ENDPOSITION, COUNT );

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 1, STARTPOSITION, ENDPOSITION, COUNT, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.playLoop(0, 1, 1, done);
    });
  });

  describe('#Blink1.pause', function() {
    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should send play off feature report', function() {
      blink1.pause();

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x70, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should call back', function(done) {
      blink1.pause(done);
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

    it('should throw an error when fadeMillis is not a number', function() {
      (function(){
        blink1.writePatternLine('Bad fadeMillis', R, G, B, POSITION);
      }).should.throwError('fadeMillis must be a number');
    });

    it('should throw an error when fadeMillis is less than 0', function() {
      (function(){
        blink1.writePatternLine(-1, R, G, B, POSITION);
      }).should.throwError('fadeMillis must be between 0 and 655350');
    });

    it('should throw an error when fadeMillis is greater than 655350', function() {
      (function(){
        blink1.writePatternLine(655351, R, G, B, POSITION);
      }).should.throwError('fadeMillis must be between 0 and 655350');
    });

    it('should throw an error when r is not a number', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, 'Bad r', G, B, POSITION);
      }).should.throwError('r must be a number');
    });

    it('should throw an error when r is less than 0', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, -1, G, B, POSITION);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when r is greater than 255', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, 256, G, B, POSITION);
      }).should.throwError('r must be between 0 and 255');
    });

    it('should throw an error when g is not a number', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, 'Bad g', B, POSITION);
      }).should.throwError('g must be a number');
    });

    it('should throw an error when g is less than 0', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, -1, B, POSITION);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when g is greater than 255', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, 256, B, POSITION);
      }).should.throwError('g must be between 0 and 255');
    });

    it('should throw an error when b is not a number', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, 'Bad b', POSITION);
      }).should.throwError('b must be a number');
    });

    it('should throw an error when b is less than 0', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, -1, POSITION);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should throw an error when b is greater than 255', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, 256, POSITION);
      }).should.throwError('b must be between 0 and 255');
    });

    it('should throw an error when position is not a number', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, B, 'Bad position');
      }).should.throwError('position must be a number');
    });

    it('should throw an error when position is less than 0', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, B, -1);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when position is greater than 11', function() {
      (function(){
        blink1.writePatternLine(FADE_MILLIS, R, G, B, 12);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should send writepatternline feature report', function() {
      blink1.writePatternLine(FADE_MILLIS, R, G, B, POSITION);

      sentFeatureReport.should.eql([FEATURE_REPORT_ID, 0x50, blink1.degamma(R),  blink1.degamma(G),  blink1.degamma(B), (FADE_MILLIS / 10) >> 8, (FADE_MILLIS / 10) % 0xff, POSITION, 0]);
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

    it('should throw an error when position is not a number', function() {
      (function(){
        blink1.readPatternLine('Bad position');
      }).should.throwError('position must be a number');
    });

    it('should throw an error when position is less than 0', function() {
      (function(){
        blink1.readPatternLine(-1);
      }).should.throwError('position must be between 0 and 11');
    });

    it('should throw an error when position is greater than 11', function() {
      (function(){
        blink1.readPatternLine(12);
      }).should.throwError('position must be between 0 and 11');
    });

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

  describe('#Blink1.close', function() {
    beforeEach(setupBlink1);
    afterEach(teardownBlink1);

    it('should close HID device', function(done) {
      blink1.close(done);

      closed.should.eql(true);
    });

    it('should callback', function(done) {
      blink1.close(function() {
        closed.should.eql(true);

        done();
      });
    });
  });
});
