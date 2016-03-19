import assert from 'assert';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import seeder from '../lib';

describe('feathers-seeder', () => {
  describe('basic', () => {
    it('can seed a basic in-memory service', done => {
      const services = [
        {
          path: 'dummy',
          template: {
            name: '{{name.firstName}} {{name.lastName}}'
          }
        },
        {
          count: 24,
          path: 'user',
          template: {
            username: '{{internet.userName}}'
          }
        },
        {
          count: 10,
          path: 'multiple_templates',
          templates: [
            {username: '{{internet.userName}}'},
            {password: '{{internet.password}}'}
          ]
        }
      ];
      const app = feathers()
        .configure(hooks)
        .use('/dummy', memory())
        .use('/user', memory())
        .use('/multiple_templates', memory())
        .configure(seeder({services, debug: true}));

      app.seed().then(() => {
        return app.service('dummy').find().then(items => {
          assert.equal(items.length, 1);
          console.log('1 dummy:', items[0]);
          return app.service('user').find().then((users) => {
            assert.equal(users.length, 24);
            console.log('24 users:', users);
            return app.service('multiple_templates').find().then(items => {
              assert.equal(items.length, 10);
              console.log('10 arbitrary items:', items);
              done();
            }).catch(done);
          }).catch(done);
        }).catch(done);
      }).catch(done);
    });
  });
});
