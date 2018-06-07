const container = require('../Container'),
  fs = require('fs');

const Location = require('./Location/Location'),
  Road = require('./Location/Road');

const locations = new Map,
  roads = new Map;

async function init(config){
  const [
    world,
    locationRepository,
    roadRepository,
    playerRepository,
    battleRepository
  ] = await container.getAll([
    'world',
    'locationRepository',
    'roadRepository',
    'playerRepository',
    'battleRepository'
  ]);

  locationRepository.collection.deleteMany();
  roadRepository.collection.deleteMany();
  playerRepository.collection.deleteMany();
  battleRepository.collection.deleteMany();

  // Locations
  for(const state of config.world.locations){
    if(!locations.has(state.name)){
      const location = new Location(
        world,
        state.name,
        state.description
      );
      if('isStart' in state){
        location.isStart = state.isStart;
      }
      if('startMoney' in state){
        location.startMoney = state.startMoney;
      }
      if('cardStore' in state){
        location.cardStore = state.cardStore;
      }
      if('abilityStore' in state){
        location.abilityStore = state.abilityStore;
      }
      locations.set(state.name, location);
      locationRepository.save(location);
    }
  }

  // Roads
  for(const locationState of config.world.locations){
    if(!('roads' in locationState)){
      continue;
    }

    for(const endName of locationState.roads){
      const startName = locationState.name,
        index = startName + ':' + endName;
      if(!roads.has(index)){
        if(!locations.has(startName)){
          continue;
        }
        if(!locations.has(endName)){
          continue;
        }

        const road = new Road(
          locations.get(startName)._id,
          locations.get(endName)._id
        );
        roads.set(index, road);
        roadRepository.save(road);
      }
    }
  }

  console.log('done');
}

const worldName = process.argv[2];

if(worldName === undefined){
  console.log('Not set world configuration');
  return;
}

init(require(__dirname + `/../../data/worlds/${worldName}`));
