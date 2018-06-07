const Repository = require('../../Repository'),
  Player = require('./Player'),
  Uuid = require('uuid/v4'),
  Card = require('./Card'),
  Ability = require('./Ability'),
  DuplicateEntityException = require('../Exception/DuplicateEntityException'),
  EntityNotFoundException = require('../Exception/EntityNotFoundException');

module.exports = class extends Repository{
  constructor(collection, prototype, locationRepository){
    super(collection, prototype);
    this.locationRepository = locationRepository;
  }

  async extract(entity){
    return {
      _id: entity._id,
      location: entity.location._id,
      name: entity.name,
      password: entity.password,
      sid: entity.sid,
      money: entity.money,
      battle: entity.battle,
      cards: entity.cards,
      abilities: entity.abilities
    };
  }

  async hydrate(state){
    if(state === null){
      return null;
    }

    const entity = new this.prototype(
      await this.locationRepository.get(state.location),
      state.name,
      state.password,
      state.sid
    );
    entity._id = state._id;
    entity.money = state.money;
    entity.battle = state.battle;
    entity.cards = state.cards.map(Card.fromState.bind(Card));
    entity.abilities = state.abilities.map(Ability.fromState.bind(Ability));

    return entity;
  }

  async register(name, password){
    if(await this.collection.findOne({name: name}) !== null){
      throw new DuplicateEntityException(`Player with name ${name} already exists`);
    }

    const startLocation = await this.locationRepository.getStart();
    if(startLocation === null){
      throw new EntityNotFoundException(`Start location not found`);
    }

    const player = new Player(startLocation, name, password, Uuid());
    player.money = startLocation.startMoney;
    this.save(player);

    return player;
  }

  async auth(name, password){
    return this.hydrate(
      await this.collection.findOne({name: name, password: password})
    );
  }

  async authOrRegister(name, password){
    const player = await this.auth(name, password);
    if(player !== null){
      return player;
    }

    return this.register(name, password);
  }

  async getBySID(sid){
    return this.hydrate(
      await this.collection.findOne({sid: sid})
    );
  }

  async getByLocation(location){
    const id = typeof location === 'string'? location : location._id;

    return this.hydrateAll(
      this.collection.find({
        location: id
      })
    );
  }
};
