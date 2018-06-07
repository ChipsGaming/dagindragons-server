const Event = require('../../Event/Event');

module.exports = class extends Event{
  constructor(battle){
    super('battle.startAction', battle);
  }
};
