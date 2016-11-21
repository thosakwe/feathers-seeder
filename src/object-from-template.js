function compile(template, faker, opts = {}) {
  if (opts.debug === true) {
      console.info('About to compile this template:', template);
  }

  let result = {};
  Object.keys(template).forEach(key => {
    let value = template[key];
    result[key] = _populate(key, value, faker, opts);
  });

  return result;
}

function _populate(key, value, faker, opts) {
  if (opts.debug === true) {
      console.info(`Populating ${key} from this value:`, value);
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date ||
      value === null || value === undefined) {
        if (opts.debug === true) {
            console.info('This is a primitive.');
        }

        return value;
  }
  else if (value instanceof String || typeof value === 'string') {
    if (opts.debug === true) {
        console.info('This is a string.');
    }

    return faker.fake(value);
  }

  else if (Array.isArray(value)) {
    if (opts.debug === true) {
        console.info('This is an array.');
    }

    return value.map(x => _populate(key, x, faker, opts));
  }
  // Otherwise, this is an object, and potentially a template itself
  else {
    if (opts.debug === true) {
        console.info(`This is a ${typeof value}`);
    }
    return compile(value, faker, opts);
  }
}

export default compile;
