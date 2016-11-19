'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectFromTemplate = require('./object-from-template');

var _objectFromTemplate2 = _interopRequireDefault(_objectFromTemplate);

var _emptyPromise = require('./empty-promise');

var _emptyPromise2 = _interopRequireDefault(_emptyPromise);

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reportError(opts) {
  return function (err) {
    if (opts.debug === true) {
      console.error('Seeding error:', err);
    }

    throw new _feathersErrors2.default.GeneralError(err);
  };
}

exports.default = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (opts === false || opts.disabled === true) {
    return function () {
      if (opts.debug === true) {
        console.info('Seeder is disabled, so nothing is being inserted into the database.');
      }

      undefined.seed = _emptyPromise2.default.array;
    };
  }

  if (!opts.services || !(opts.services instanceof Array)) {
    throw new _feathersErrors2.default.BadRequest('You must include an array of services to be seeded.');
  }

  return function () {
    var app = this;

    app.seed = function () {
      var createPromises = [];

      opts.services.forEach(function (serviceConfig) {
        if (!serviceConfig.path) {
          throw new _feathersErrors2.default.BadRequest('You must include the path of every service you want to seed.');
        }

        if (!serviceConfig.template && !serviceConfig.templates) {
          throw new _feathersErrors2.default.BadRequest('You must specify a template or array of templates for seeded objects.');
        }

        var service = app.service(serviceConfig.path);
        var additionalParams = Object.assign({}, opts.params, serviceConfig.params);
        if (opts.debug === true) {
          console.info('Additional params:', additionalParams);
        }

        var count = Number(serviceConfig.count) || 1;

        // Delete from service, if necessary
        var shouldDelete = opts.delete !== false && serviceConfig.delete !== false;
        if (!shouldDelete && opts.debug === true) {
          console.info('Not deleting any items from ' + serviceConfig.path + '...');
        }

        var deletePromise = shouldDelete ? service.remove(additionalParams) : _emptyPromise2.default.array();

        return deletePromise.then(function (deleted) {
          if (opts.debug === true) {
            console.info('Deleted ' + deleted.length + ' items from ' + serviceConfig.path);
          }

          // Now, let's seed the app.
          if (serviceConfig.template && serviceConfig.disabled !== true) {
            // Single template
            for (var i = 0; i < count; i++) {
              var compiled = (0, _objectFromTemplate2.default)(serviceConfig.template, _faker2.default, opts);
              if (opts.debug === true) {
                console.info('Compiled template:', compiled);
              }

              createPromises.push(service.create(compiled, additionalParams));
            }
          } else if (serviceConfig.templates && serviceConfig.disabled !== true) {
            // Multiple templates
            for (var _i = 0; _i < count; _i++) {
              var template = serviceConfig.templates[Math.floor(Math.random() * serviceConfig.templates.length)];
              var _compiled = (0, _objectFromTemplate2.default)(template, _faker2.default, opts);
              if (opts.debug === true) {
                console.info('Compiled template:', _compiled);
              }

              createPromises.push(service.create(_compiled, additionalParams));
            }
          } else if (opts.debug === true) {
            console.info('Seeder is disabled for ' + serviceConfig.path + ', so nothing is being inserted into the database.');
          }
        }).catch(reportError(opts));
      });

      return Promise.all(createPromises).then(function (created) {
        if (opts.debug === true) {
          console.info('Created ' + created.length + ' items:', created);
        }
        // Remember: Passing additional params causes a delay and the Promise returns before seeding is actually complete.
        return new Promise(function (resolve) {
          setTimeout(function () {
            if (opts.debug === true) {
              console.info('Sorry for the delay...');
            }

            resolve(created);
          }, 50);
        });
      }).catch(reportError(opts));
    };
  };
};

module.exports = exports['default'];