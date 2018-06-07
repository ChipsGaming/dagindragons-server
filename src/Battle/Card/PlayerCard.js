const Card = require('./Card');

module.exports = class extends Card{
  constructor(prototype, player){
    super(prototype, player);
    this.maxMana = prototype.maxMana;
    this.mana = prototype.mana;
    this.manaRegen = prototype.manaRegen;
    this.leadership = prototype.leadership;
  }

  get(card){
    this.mana -= card.cost;
    this.player.removeCardFromHand(card);
    this.player.addCardToGame(card);
    card.onInGame.notify();
  }

  skipGet(){
    this.isActive = false;
    this.player.onGetCard.notify({player: this});
  }
};
