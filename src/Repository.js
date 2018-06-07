const Entity = require('./Entity');

module.exports = class{
  constructor(collection, prototype = Entity){
    this.collection = collection;
    this.prototype = prototype;
  }

  async extract(entity){
    return entity;
  }

  async hydrate(state){
    if(state === null){
      return null;
    }

    const entity = new this.prototype;
    for(const prop in state){
      entity[prop] = state[prop];
    }

    return entity;
  }

  async hydrateAll(cursor){
    return Promise.all(
      (await cursor.toArray())
        .map(this.hydrate.bind(this))
    )
  }

  async get(id){
    return this.hydrate(
      await this.collection.findOne({_id: id})
    );
  }

  async save(entity){
    this.collection.save(
      await this.extract(entity)
    );
  }

  async remove(entity){
    this.collection.findOneAndDelete({_id: entity._id});
  }
};
