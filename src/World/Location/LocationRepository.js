const Repository = require('../../Repository');

module.exports = class extends Repository{
  constructor(collection, prototype, world, roadRepository){
    super(collection, prototype);
    this.world = world;
    this.roadRepository = roadRepository;
  }

  async extract(entity){
    return {
      _id: entity._id,
      name: entity.name,
      description: entity.description,
      isStart: entity.isStart,
      startMoney: entity.startMoney,
      cardStore: entity.cardStore,
      abilityStore: entity.abilityStore
    };
  }

  async hydrate(state){
    if(state === null){
      return null;
    }

    const entity = new this.prototype(
      this.world,
      state.name,
      state.description
    );
    entity._id = state._id;
    entity.isStart = state.isStart;
    entity.startMoney = state.startMoney;
    entity.cardStore = state.cardStore;
    entity.abilityStore = state.abilityStore;

    return entity;
  }

  async getStart(){
    return this.hydrate(
      await this.collection.findOne({isStart: true})
    );
  }

  async getNearbyLocations(location){
    const id = typeof location === 'string'? location : location._id;

    const roads = await this.roadRepository.getNearby(id),
      nearbyLocations = new Map;

    for(const road of roads){
      if(road.start !== id && !nearbyLocations.has(road.start)){
        nearbyLocations.set(road.start, await this.get(road.start));
      }
      if(road.end !== id && !nearbyLocations.has(road.end)){
        nearbyLocations.set(road.end, await this.get(road.end));
      }
    }

    return Array.from(nearbyLocations.values());
  }
};
