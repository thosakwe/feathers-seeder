import assert from 'assert';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import seeder from '../lib';

describe('feathers-seeder', () => {
  describe('basic', () => {
    it('can seed a basic in-memory service', done => {
      const SINGLE = {
        path: 'single',
        template: {
          name: '{{first_name}} {{last_name}}'
        }
      };
      const MULTIPLE = {
        path: 'multiple',
        count: 24,
        template: {
          username: '{{username}}'
        }
      };
      const RANDOM = {
        path: 'random',
        count: 10,
        templates: [{
          username: '{{username}}'
        }, {
          password: '{{password}}'
        }]
      };
      const ALL = {
        path: 'all',
        randomize: false,
        templates: [{
          username: '{{username}}',
          age: 34,
          updatedAt: new Date(),
          profileMedium: `https://dgalywyr863hv.cloudfront.net/pictures/athletes/411352/88294/1/medium.jpg`,
          active: true,
          location: {
            lat: 45.3455656,
            lng: -45.2656565
          }
        }, {
          username: '{{username}}',
          age: 33,
          updatedAt: new Date(),
          profileMedium: `https://dgalywyr863hv.cloudfront.net/pictures/athletes/411352/88294/1/medium.jpg`,
          active: false,
          location: {
            lat: 45.3455656,
            lng: -45.2656565
          }
        }]
      };

      const services = [];
      services.push(SINGLE, MULTIPLE, RANDOM,ALL);

      const app = feathers()
        .configure(hooks)
        .use(`/${SINGLE.path}`, memory())
        .use(`/${MULTIPLE.path}`, memory())
        .use(`/${RANDOM.path}`, memory())
        .use(`/${ALL.path}`, memory())
        .configure(seeder({
          services
        }));

      app.seed().then(() => {
        app.service(`${SINGLE.path}`).find().then(items => {
          assert.equal(items.length, 1);
          console.log(`Seeded ${items.length}`);
        }).catch(done);

        app.service(`${MULTIPLE.path}`).find().then(items => {
          assert.equal(items.length, MULTIPLE.count);
          console.log(`Seeded ${items.length}`);
        }).catch(done);

        app.service(`${RANDOM.path}`).find().then(items => {
          assert.equal(items.length, RANDOM.count);
          console.log(`Seeded ${items.length}`);
        }).catch(done);

        app.service(`${ALL.path}`).find().then(items => {
          assert.equal(items.length, ALL.templates.length);
          console.log(`Seeded ${items.length}`);
        }).catch(done);

        done();
      }).catch(done);
    });
  });
});
