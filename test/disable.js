var assert = require('assert');
var feathers = require('feathers');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var seeder = require('../lib');

describe('disable', function() {
  it('can be globally disabled', function(done) {
    const app = feathers().configure(hooks()).use('/dummy', memory());
    const config =
    {
      disabled: true,
      services:
      [
        {
          count: 1337,
          path: 'dummy',
          template: { hello: 'world' }
        }
      ]
    };

    app.configure(seeder(config)).seed().then(function() {
      app.service('dummy').find().then(function(items) {
        assert.equal(items.length, 0);
        done();
      }).catch(done);
    }).catch(done);
  });

  it('can be disabled on an individual basis', function(done) {
    // /a will be disabled, while /b is enabled.
    const app = feathers().configure(hooks()).use('/a', memory()).use('/b', memory());
    const config = {
      services:
      [
        {
          count: 700, // disabled should preside even if count is specified
          disabled: true,
          path: 'a',
          template: { 'this should' : 'not be seeded' }
        },
        {
          count: 10,
          path: 'b',
          template: { Barack: 'Obama' }
        }
      ]
    };

    app.configure(seeder(config)).seed().then(function() {
      app.service('a').find().then(function(items) {
        assert.equal(items.length, 0);
        done();
      }).catch(done);
    }).catch(done);
  });
});
