// Setup babel
require('babel-register')();

// Setup testing utilities
global._ = require('lodash');
global.chai = require('chai');
global.assert = chai.assert;
global.expect = chai.expect;
global.sinon = require('sinon');

// Configure chai
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
