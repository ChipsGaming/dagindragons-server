const AbstractAbility = require('./AbstractAbility');

module.exports = class extends AbstractAbility{
  constructor(_id, name, description, sourceCard){
    super(_id, name, description, sourceCard, sourceCard.player.table.onStartBattle);
  }

  apply(){
    this.sourceCard.player.cardInGame.forEach(
      (card) => card.heal(1)
    );
    this.sourceCard.player.playerCard.heal(1);
  }
};
