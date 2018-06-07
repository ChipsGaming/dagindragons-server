const Event = require('../../../Event/Event');

module.exports = class extends Event{
  constructor(player, from, to){
    super('player.move', player);
    this.from = from;
    this.to = to;
  }
};
