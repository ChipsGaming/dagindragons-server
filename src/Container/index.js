const Container = require('./Container'),
  CallbackFactory = require('./CallbackFactory');
  SharedFactory = require('./SharedFactory'),
  InjectFactory = require('./InjectFactory'),
  {MongoClient} = require('mongodb');

module.exports = new Container({
  'world': new (require('../World/World')),
  'battles': new Map,
  // Database
  'mongoClient': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      MongoClient.connect('mongodb://localhost:8080', {useNewUrlParser: true})
    )
  ),
  'database': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      (await container.get('mongoClient')).db('test')
    )
  ),
  'playersCollection': new SharedFactory(
    new CallbackFactory(async (name, container) => {
      const collection = (await container.get('database')).collection('players');
      collection.createIndex({sid: 1}, {unique: true});
      collection.createIndex({name: 1}, {unique: true});
      collection.createIndex({location: 1});

      return collection;
    })
  ),
  'playerRepository': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      new (require('../World/Player/PlayerRepository'))(
        await container.get('playersCollection'),
        require('../World/Player/Player'),
        await container.get('locationRepository')
      )
    )
  ),
  'locationsCollection': new SharedFactory(
    new CallbackFactory(async (name, container) => {
      const collection = (await container.get('database')).collection('locations');
      collection.createIndex({isStart: 1});

      return collection;
    })
  ),
  'locationRepository': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      new (require('../World/Location/LocationRepository'))(
        await container.get('locationsCollection'),
        require('../World/Location/Location'),
        await container.get('world'),
        await container.get('roadRepository')
      )
    )
  ),
  'roadsCollection': new SharedFactory(
    new CallbackFactory(async (name, container) => {
      const collection = (await container.get('database')).collection('roads');
      collection.createIndex({start: 1, end: 1}, {unique: true});

      return collection;
    })
  ),
  'roadRepository': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      new (require('../World/Location/RoadRepository'))(
        await container.get('roadsCollection'),
        require('../World/Location/Road')
      )
    )
  ),
  'battleCollection': new SharedFactory(
    new CallbackFactory(async (name, container) => {
      const collection = (await container.get('database')).collection('battles');
      collection.createIndex({from: 1, to: 1}, {unique: true});

      return collection;
    })
  ),
  'battleRepository': new SharedFactory(
    new CallbackFactory(async (name, container) =>
      new (require('../World/Battle/BattleRepository'))(
        await container.get('battleCollection'),
        require('../World/Battle/Battle'),
        await container.get('playerRepository')
      )
    )
  ),
  // Http
  'authMiddleware': new SharedFactory(
    new InjectFactory(
      require('../World/Http/AuthMiddleware')
    )
  ),
  'authHandler': new SharedFactory(
    new InjectFactory(
      require('../World/Http/AuthHandler')
    )
  ),
  'worldRouter': new SharedFactory(
    new InjectFactory(
      require('../World/Http/WorldRouter')
    )
  ),
  'battleRouter': new SharedFactory(
    new InjectFactory(
      require('../World/Http/BattleRouter')
    )
  )
});
