import errors from 'feathers-errors';
import Seeder from './seeder';

export default function seeder(opts = {}) {
  if (opts === false || opts.disabled === true) {
    return function() {
      this.seed = () => {
        if (opts.debug === true) {
          console.info('Seeder is disabled, not modifying database.');
        }

        return Promise.resolve([]);
      };
    };
  }

  if (!(opts.services instanceof Array)) {
    throw new Error('You must include an array of services to be seeded.');
  }

  return function() {
    const app = this;
    const seeder = new Seeder(app, opts);

    app.seed = () => {
      return seeder.seedApp().then().catch(err => {
        if (opts.debug === true) {
          console.error('Seeding error:', err);
        }

        throw new errors.GeneralError(err);
      });
    };
  };
}
