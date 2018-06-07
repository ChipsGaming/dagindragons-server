const Entity = require('../../Entity'),
  Battle = require('../../Battle/Battle'),
  MoveEvent = require('./Event/Move'),
  AttackEvent = require('./Event/Attack');

module.exports = class extends Entity{
  constructor(location, name, password, sid){
    super();
    this.location = location;
    this.name = name;
    this.password = password;
    this.sid = sid;
    this.money = 0;
    this.battle = null;
    this.cards = new Array;
    this.abilities = new Array;
  }

  move(location){
    const fromLocation = this.location;

    this.location = location;
    this.location.world.events.emitEvent(
      new MoveEvent(this, fromLocation, location)
    );
  }

  buyCard(card, price){
    this.cards.push(card);
    this.money -= price;
  }

  buyAbility(ability, price){
    this.abilities.push(ability);
    this.money -= price;
  }

  attack(player, battle){
    this.battle = battle._id;
    player.battle = battle._id;

    this.location.world.events.emitEvent(
      new AttackEvent(this, player, battle)
    );
  }
};
