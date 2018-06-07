const Entity = require('../../Entity');
  Ability = require('./Ability'),
  prototypes = require('../../Battle/Card/prototypes');

module.exports = class extends Entity{
  constructor(prototype){
    super();
    this.prototype = prototype;
    this.abilities = new Array;
  }

  static fromState(state){
    const instance = new this(state.prototype);
    instance._id = state._id;
    instance.abilities = state.abilities.map(Ability.fromState.bind(Ability));

    return instance;
  }

  createPrototype(){
    return Object.assign(
      {_id: this._id},
      prototypes.cards[this.prototype],
      {abilities: this.abilities.map(ability => ability.createPrototype())}
    );
  }
};
