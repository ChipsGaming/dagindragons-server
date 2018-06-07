const Event = require('../../Event/Event');

module.exports = class extends Event{
  constructor(battle, player){
    super('battle.nextPlayer', battle);
    this.player = player;
  }
};
