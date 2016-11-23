import errors from 'feathers-errors';
import Seeder from './seeder';

const debug = require('debug')('feathers-seeder');

export default function seeder(opts = {}) {
  if (opts === false || opts.disabled === true) {
    return function() {
      this.seed = () => {
        debug('Seeder is disabled, not modifying database.');

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
        debug(`Seeding error: ${err}`);

        throw new errors.GeneralError(err);
      });
    };
  };
}
