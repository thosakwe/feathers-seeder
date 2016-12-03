import assert from 'assert';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import seeder from '../lib';

describe('feathers-seeder', () => {
  describe('custom-generator', () => {
    it('can seed a basic in-memory service with template funcs', done => {
      const INDEX = 1; 
      const inc = (arg) => { return ++arg; };
      const opts = {
        services: [{
          path: 'dummy',
          template: {
            value: () => inc(INDEX),
          }
        }]
      };

      const app = feathers()
        .configure(hooks)
        .use(`/dummy`, memory())
        .configure(seeder(opts));

      app.seed().then(() => {
        app.service('dummy').find().then(items => {
          assert.equal(items.length, 1);
          assert.equal(items[0].value, INDEX + 1);

        }).catch(done);

        done();
      }).catch(done);
    });
  });
});
