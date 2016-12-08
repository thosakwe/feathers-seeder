'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = require('debug')('feathers-seeder');

var Seeder = function () {
  function Seeder(app, opts) {
    _classCallCheck(this, Seeder);

    this.app = app;
    this.opts = opts;

    this.compiler = new _compiler2.default(opts.generators);
  }

  _createClass(Seeder, [{
    key: 'compileTemplate',
    value: function compileTemplate(template) {
      return this.compiler.compile(template);
    }
  }, {
    key: 'seedApp',
    value: function seedApp() {
      var _this = this;

      debug('Seeding app...');

      return new Promise(function (resolve, reject) {
        var promises = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _this.opts.services[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var cfg = _step.value;

            promises.push(_this.seed(cfg));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        debug('Running ' + promises.length + ' seeder(s)...');

        return Promise.all(promises).then(function (seeded) {
          debug('Created ' + seeded.length + ' total items:', seeded);
          return resolve(seeded);
        }).catch(reject);
      });
    }
  }, {
    key: 'seed',
    value: function seed(cfg) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!cfg.path) {
          throw new Error('You must include the path of every service you want to seed.');
        }

        if (!cfg.template && !cfg.templates) {
          throw new Error('You must specify a template or array of templates for seeded objects.');
        }

        if (cfg.count && cfg.randomize === false) {
          throw new Error('You may not specify both randomize = false with count');
        }

        var service = _this2.app.service(cfg.path);
        var params = Object.assign({}, _this2.opts.params, cfg.params);
        var count = Number(cfg.count) || 1;
        var randomize = typeof cfg.randomize === 'undefined' ? true : cfg.randomize;
        debug('Params seeding \'' + cfg.path + '\':', params);
        debug('Param randomize: ' + randomize);
        debug('Creating ' + count + ' instance(s)');

        // Delete from service, if necessary
        var shouldDelete = _this2.opts.delete !== false && cfg.delete !== false;

        if (!shouldDelete) {
          debug('Not deleting any items from ' + cfg.path + '.');
        }

        var deletePromise = shouldDelete ? service.remove(null, params) : Promise.resolve([]);

        return deletePromise.then(function (deleted) {
          debug('Deleted from \'' + cfg.path + ':\'', deleted);

          var pushPromise = function pushPromise(template) {
            return new Promise(function (resolve, reject) {
              var compiled = _this2.compileTemplate(template);
              debug('Compiled template:', compiled);

              return service.create(compiled, params).then(function (created) {
                debug('Created:', created);

                if (typeof cfg.callback !== 'function') {
                  return resolve(created);
                } else {
                  return cfg.callback(created, _this2.seed.bind(_this2)).then(function (result) {
                    debug('Result of callback on \'' + cfg.path + '\':', result);
                    return resolve(created);
                  }).catch(reject);
                }
              }).catch(reject);
            });
          };

          // Now, let's seed the app.
          var promises = [];

          if (cfg.template && cfg.disabled !== true) {
            // Single template
            for (var i = 0; i < count; i++) {
              promises.push(pushPromise(cfg.template));
            }
          } else if (cfg.templates && cfg.disabled !== true) {
            // Multiple random templates
            if (randomize) {
              for (var _i = 0; _i < count; _i++) {
                var idx = Math.floor(Math.random() * cfg.templates.length);
                var template = cfg.templates[idx];
                debug('Picked random template index ' + idx);
                promises.push(pushPromise(template));
              }
            }
            // All templates
            else {
                for (var _i2 = 0; _i2 < cfg.templates.length; _i2++) {
                  var _template = cfg.templates[_i2];
                  promises.push(pushPromise(_template));
                }
              }
          }

          if (!promises.length) {
            debug('Seeder disabled for ' + cfg.path + ', not modifying database.');
            return resolve([]);
          } else {
            return Promise.all(promises).then(resolve).catch(reject);
          }
        }).catch(reject);
      });
    }
  }]);

  return Seeder;
}();

exports.default = Seeder;
module.exports = exports['default'];