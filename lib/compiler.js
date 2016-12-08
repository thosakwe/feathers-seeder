'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require('debug')('feathers-seeder');

var Compiler = function () {
  function Compiler() {
    _classCallCheck(this, Compiler);
  }

  _createClass(Compiler, [{
    key: 'compile',
    value: function compile(template) {
      var _this = this;

      debug('About to compile template: ', template);

      var result = {};
      Object.keys(template).forEach(function (key) {
        var value = template[key];
        result[key] = _this._populate(key, value);
      });

      return result;
    }
  }, {
    key: '_populate',
    value: function _populate(key, value) {
      var _this2 = this;

      debug('Populating key: ' + key + ' from value: ' + value);

      if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date || value === null || value === undefined) {
        debug('Value is a primitive.');

        return value;
      } else if (value instanceof String || typeof value === 'string') {
        debug('Value is a string.');

        return _faker2.default.fake(value);
      } else if (Array.isArray(value)) {
        debug('Value is an array.');

        return value.map(function (x) {
          return _this2._populate(key, x);
        });
      } else if (typeof value === 'function') {
        return value();
      }
      // Otherwise, this is an object, and potentially a template itself
      else {
          debug('Value is a ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));

          return this.compile(value);
        }
    }
  }]);

  return Compiler;
}();

exports.default = Compiler;
module.exports = exports['default'];