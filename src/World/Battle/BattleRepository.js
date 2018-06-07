const Repository = require('../../Repository'),
  Battle = require('../../Battle/Battle'),
  EntityNotFoundException = require('../Exception/EntityNotFoundException');

module.exports = class extends Repository{
  constructor(collection, prototype, playerRepository){
    super(collection, prototype);
    this.playerRepository = playerRepository;
    this.battles = new Map;
  }

  async extract(entity){
    return {
      _id: entity._id,
      from: entity.from._id,
      to: entity.to._id
    };
  }

  async hydrate(state){
    if(state === null){
      return null;
    }

    const [from, to] = await Promise.all([
      this.playerRepository.get(state.from),
      this.playerRepository.get(state.to)
    ]);

    const entity = new this.prototype(from, to);
    entity._id = state._id;

    return entity;
  }

  async getBattle(id){
    if(!this.battles.has(id)){
      const battleConfig = await this.get(id);
      if(battleConfig === null){
        throw new EntityNotFoundException('Battle not found');
      }

      this.battles.set(id, Battle.build([battleConfig.from, battleConfig.to]));
    }

    return this.battles.get(id);
  }
};
