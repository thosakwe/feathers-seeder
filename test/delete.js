var assert = require('assert');
var feathers = require('feathers');
var memory = require('feathers-memory');
var seeder = require('../lib');

describe('deletions', function() {
  it('can disable deletions globally', function(done) {
    const app = feathers().use('/dummy', memory());
    const config = {
      delete: false,
      services: [
        {
          count: 2,
          path: 'dummy',
          template: { scooby: { dooby: 'doo' }, 'where are': '{{name.lastName}}' }
        }
      ]
    };
    const dummy = app.service('dummy');
    dummy.create([{hello: 'world'}, {foo: 'bar'}, {billie: 'jean'}]).then(function() {
      app.configure(seeder(config)).seed().then(function() {
        dummy.find().then(function(items) {
          assert.equal(items.length, 5);
          done();
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });

  it('can disable deletions locally', function(done) {
    const app = feathers().use('/tickets', memory()).use('/artists', memory());
    const config = {
      services: [
        {
          count: 5,
          path: 'tickets',
          template: {
            buyerName: '{{name.firstName}} {{name.lastName}}'
          }
        },
        {
          delete: false,
          count: 3,
          path: 'artists',
          template: {
            john: '{{name.lastName}}'
          }
        }
      ]
    };
    const tickets = app.service('tickets');
    const artists = app.service('artists');

    // Items should be deleted from tickets, but artists should persist
    // Ignore this pyramid of doom, I'm kinda tired right now...
    tickets.create([{foo:'bar'}, {'hit it': 'fergie!'}]).then(function() {
      artists.create([{michael: 'jackson'}, {marvin: 'gaye'}]).then(function() {
        app.configure(seeder(config)).seed().then(function() {
          tickets.find().then(function(_tickets) {
            artists.find().then(function(_artists) {
              assert.equal(_tickets.length, 5);
              assert.equal(_artists.length, 5);
              done();
            }).catch(done);
          }).catch(done);
        }).catch(done);
      }).catch(done);
    }).catch(done);
  });
});
