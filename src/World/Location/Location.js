const Entity = require('../../Entity'),
  prototypes = require('../../Battle/Card/prototypes');

module.exports = class extends Entity{
  constructor(world, name, description){
    super();
    this.world = world;
    this.name = name;
    this.description = description;
    this.isStart = false;
    this.startMoney = 0;
    this.cardStore = new Array;
    this.abilityStore = new Array;
  }

  createCardStore(){
    return this.cardStore.map(({prototype, price}) =>
      Object.assign(
        {_id: prototype, price: price},
        prototypes.cards[prototype],
        {
          abilities: prototypes.cards[prototype].abilities.map(prototype =>
            prototypes.abilities[prototype]
          )
        }
      )
    );
  }

  createAbilityStore(){
    return this.abilityStore.map(({prototype, price}) =>
      Object.assign(
        {_id: prototype, price: price},
        prototypes.abilities[prototype]
      )
    );
  }
};
