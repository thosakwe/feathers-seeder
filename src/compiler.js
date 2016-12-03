const debug = require('debug')('feathers-seeder');
import faker from 'faker';

export default class Compiler {
  compile(template) {
    debug('About to compile template: ', template);

    let result = {};
    Object.keys(template).forEach(key => {
      let value = template[key];
      result[key] = this._populate(key, value);
    });

    return result;
  }

  _populate(key, value) {
    debug(`Populating key: ${key} from value: ${value}`);

    if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date ||
      value === null || value === undefined) {
      debug('Value is a primitive.');

      return value;
    }
    else if (value instanceof String || typeof value === 'string') {
      debug('Value is a string.');

      return faker.fake(value);
    }
    else if (Array.isArray(value)) {
      debug('Value is an array.');

      return value.map(x => this._populate(key, x));
    }
    else if (typeof value === 'function') {
      return value();
    }
    // Otherwise, this is an object, and potentially a template itself
    else {
      debug(`Value is a ${typeof value}`);

      return this.compile(value);
    }
  }
}
