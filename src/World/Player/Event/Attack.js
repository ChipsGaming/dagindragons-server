const Event = require('../../../Event/Event');

module.exports = class extends Event{
  constructor(player, target, battle){
    super('player.attack', player);
    this.target = target;
    this.battle = battle;
  }
};
