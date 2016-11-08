import compile from './object-from-template';
import emptyPromise from './empty-promise';
import errors from 'feathers-errors';
import faker from 'faker';

function reportError(opts) {
  return err => {
    if (opts.debug === true) {
      console.error('Seeding error:', err);
    }
    
    throw new errors.GeneralError(err);
  };
}

export default (opts = {}) => {
  if (opts === false || opts.disabled === true) {
    return () => {
      if (opts.debug === true) {
        console.info('Seeder is disabled, so nothing is being inserted into the database.');
      }

      this.seed = emptyPromise.array;
    };
  }

  if (!opts.services || !(opts.services instanceof Array)) {
    throw new errors.BadRequest('You must include an array of services to be seeded.');
  }

  return function () {
    const app = this;

    app.seed = function () {
      let createPromises = [];

      opts.services.forEach(serviceConfig => {
        if (!serviceConfig.path) {
          throw new errors.BadRequest('You must include the path of every service you want to seed.');
        }

        if (!serviceConfig.template && !serviceConfig.templates) {
          throw new errors.BadRequest('You must specify a template or array of templates for seeded objects.');
        }

        const service = app.service(serviceConfig.path);
        const additionalParams = Object.assign({}, opts.params, serviceConfig.params);
        if (opts.debug === true) {
          console.info('Additional params:', additionalParams);
        }

        const count = Number(serviceConfig.count) || 1;

        // Delete from service, if necessary
        let shouldDelete = opts.delete !== false && serviceConfig.delete !== false;
        if (!shouldDelete && opts.debug === true) {
          console.info(`Not deleting any items from ${serviceConfig.path}...`);
        }

        let deletePromise = shouldDelete ? service.remove(additionalParams) : emptyPromise.array();

        return deletePromise.then(deleted => {
          if (opts.debug === true) {
            console.info(`Deleted ${deleted.length} items from ${serviceConfig.path}`);
          }

          // Now, let's seed the app.
          if (serviceConfig.template && serviceConfig.disabled !== true) {
            // Single template
            for (let i = 0; i < count; i++) {
              let compiled = compile(serviceConfig.template, faker, opts);
              if (opts.debug === true) {
                console.info('Compiled template:', compiled);
              }

              createPromises.push(service.create(compiled, additionalParams));
            }
          }

          else if (serviceConfig.templates && serviceConfig.disabled !== true) {
            // Multiple templates
            for (let i = 0; i < count; i++) {
              let template = serviceConfig.templates[Math.floor(Math.random() * serviceConfig.templates.length)];
              let compiled = compile(template, faker, opts);
              if (opts.debug === true) {
                console.info('Compiled template:', compiled);
              }

              createPromises.push(service.create(compiled, additionalParams));
            }
          }

          else if (opts.debug === true) {
            console.info(`Seeder is disabled for ${serviceConfig.path}, so nothing is being inserted into the database.`);
          }
        }).catch(reportError(opts));
      });

      return Promise.all(createPromises).then(created => {
        if (opts.debug === true) {
          console.info(`Created ${created.length} items:`, created);
        }
        // Remember: Passing additional params causes a delay and the Promise returns before seeding is actually complete.
        return new Promise((resolve) => {
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
