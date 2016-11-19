'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function compile(template, faker) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (opts.debug === true) {
    console.info('About to compile this template:', template);
  }

  var result = {};
  Object.keys(template).forEach(function (key) {
    var value = template[key];
    result[key] = _populate(key, value, faker, opts);
  });

  return result;
}

function _populate(key, value, faker, opts) {
  if (opts.debug === true) {
    console.info('Populating ' + key + ' from this value:', value);
  }

  if (value instanceof Number || value instanceof Boolean || value instanceof Date || value === null || value === undefined) {
    if (opts.debug === true) {
      console.info('This is a primitive.');
    }

    return value;
  } else if (value instanceof String || typeof value === 'string') {
    if (opts.debug === true) {
      console.info('This is a string.');
    }

    return faker.fake(value);
  } else if (Array.isArray(value)) {
    if (opts.debug === true) {
      console.info('This is an array.');
    }

    return value.map(function (x) {
      return _populate(key, x, faker, opts);
    });
  }
  // Otherwise, this is an object, and potentially a template itself
  else {
      if (opts.debug === true) {
        console.info('This is a ' + (typeof value === 'undefined' ? 'undefined' : _typeof(value)));
      }
      return compile(value, faker, opts);
    }
}

exports.default = compile;
module.exports = exports['default'];