const debug = require('debug')('feathers-seeder');

function compile(template, faker, opts = {}) {
  debug(`About to compile template: ${template}`);

  let result = {};
  Object.keys(template).forEach(key => {
    let value = template[key];
    result[key] = _populate(key, value, faker, opts);
  });

  return result;
}

function _populate(key, value, faker, opts) {
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

    return value.map(x => _populate(key, x, faker, opts));
  }
  // Otherwise, this is an object, and potentially a template itself
  else {
    debug(`Value is a ${typeof value}`);

    return compile(value, faker, opts);
  }
}

export default compile;
