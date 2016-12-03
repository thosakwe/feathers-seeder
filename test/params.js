var assert = require('assert');
var errors = require('feathers-errors');
var feathers = require('feathers');
var hooks = require('feathers-hooks');
var memory = require('feathers-memory');
var seeder = require('../lib');

describe('params', function() {
  it('can pass custom params globally', function(done) {
    const app = feathers().configure(hooks()).use('/dummy', memory());
    const config = {
      params: {
        hello: 'world'
      },
      services: [
        {
          count: 4,
          path: 'dummy',
          template: { michael: 'jackson' }
        }
      ]
    };
    const dummy = app.service('dummy');

    //Deny create if {hello:'world'} not present in params
    dummy.before({
      create: function(hook) {
        if (hook.params.hello !== 'world') {
          console.error('Invalid params', hook.params);
          throw new errors.BadRequest({errors: ['Params must have {hello:"world"}']});
        }
      }
    });

    app.configure(seeder(config)).seed().then(function() {
      dummy.find().then(function(items) {
        assert.equal(items.length, 4);
        done();
      }).catch(done);
    }).catch(done);
  });

  it('can pass custom params locally', function(done) {
    const app = feathers().configure(hooks()).use('/dummy', memory());
    const config = {
      services: [
        {
          params: {
            hello: 'world'
          },
          count: 4,
          path: 'dummy',
          template: { michael: 'jackson' }
        }
      ]
    };
    const dummy = app.service('dummy');
    //Deny create if {hello:'world'} not present in params
    dummy.before({
      create: function(hook) {
        if (hook.params.hello !== 'world') {
          console.error('Invalid params', hook.params);
          throw new errors.BadRequest({errors: ['Params must have {hello:"world"}']});
        }
      }
    });

    app.configure(seeder(config)).seed().then(function(created) {
      console.log('Dummy created: ', created);

      dummy.find().then(function(items) {
        assert.equal(items.length, 4);
        done();
      }).catch(done);
    }).catch(done);
  });
});
