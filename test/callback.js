import assert from 'assert';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import memory from 'feathers-memory';
import seeder from '../lib';

describe('callback', () => {
  it('can nest config', done => {
    const app = feathers().configure(hooks());
    app.use('/albums', memory());
    app.use('/songs', memory());

    app.use('/albums/:albumId/songs', {
      find(params) {
        console.log(`Searching for songs from album #${params.albumId}...`);
        return app.service('songs').find({
          query: {
            albumId: params.albumId
          }
        });
      },

      create(data, params) {
        const songData = Object.assign(data, {
          albumId: params.albumId
        });
        return app.service('songs').create(songData);
      }
    });

    const seederConfig = {
      services: [{
        path: 'albums',
        template: {
          artist: 'Pink Floyd',
          name: 'Dark Side of the Moon'
        },
        callback(album, seed) {
          return seed({
            delete: false,
            path: 'albums/:albumId/songs',
            params: {
              albumId: album.id
            },
            template: {
              artistName: album.artist,
              name: 'On the Run'
            }
          });
        }
      }]
    };

    app.configure(seeder(seederConfig));

    app.seed().then(albums => {
      console.info('Created albums:', albums);

      app.service('songs').find().then(songs => {
        console.info('Found songs:', songs);

        const darkSide = albums[0][0];
        const onTheRun = songs[0];

        assert.equal(onTheRun.albumId, darkSide.id);
        assert.equal(onTheRun.artistName, darkSide.artist);
        done();
      }).catch(done);
    }).catch(done);
  });
});
