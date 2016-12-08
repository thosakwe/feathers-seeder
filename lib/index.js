'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = seeder;

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _seeder = require('./seeder');

var _seeder2 = _interopRequireDefault(_seeder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = require('debug')('feathers-seeder');

function seeder() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (opts === false || opts.disabled === true) {
    return function () {
      this.seed = function () {
        debug('Seeder is disabled, not modifying database.');

        return Promise.resolve([]);
      };
    };
  }

  if (!(opts.services instanceof Array)) {
    throw new Error('You must include an array of services to be seeded.');
  }

  return function () {
    var app = this;
    var seeder = new _seeder2.default(app, opts);

    app.seed = function () {
      return seeder.seedApp().then().catch(function (err) {
        debug('Seeding error: ' + err);

        throw new _feathersErrors2.default.GeneralError(err);
      });
    };
  };
}
module.exports = exports['default'];