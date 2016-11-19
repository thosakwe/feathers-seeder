"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function array() {
  return Promise.resolve([]);
}

function single() {
  return Promise.resolve({});
}

exports.default = { array: array, single: single };
module.exports = exports['default'];