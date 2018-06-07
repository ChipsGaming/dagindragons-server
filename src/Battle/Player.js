const Signal = require('../Signal'),
  SignalAggregator = require('../SignalAggregator'),
  Card = require('./Card/Card');

module.exports = class{
  constructor(table, client){
    this.table = table;
    this.client = client;
    this.playerCard = null;
    this.cardDeck = new Array;
    this.cardInHand = new Array;
    this.cardInGame = new Array;

    this.onGetDeck = new Signal;
    this.onGetCard = new Signal;
    this.onApplyCard = new Signal;

    this.popUp = {
      onHeal: new SignalAggregator,
      onDamage: new SignalAggregator,
      onAttack: new SignalAggregator,
      onAbility: new SignalAggregator,
      onDie: new SignalAggregator
    };
  }

  get activeCardsInGame(){
    return this.cardInGame.filter((card) => card.isActive);
  }

  fillDeck(cards, shuffle = true){
    if(shuffle){
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }

    this.cardDeck = cards.map(prototype => new Card(prototype, this));

    return this;
  }

  addCardToHand(card){
    this.cardInHand.push(card);
    this.onGetDeck.notify({player: this, card: card});
  }

  removeCardFromHand(card){
    const index = this.cardInHand.indexOf(card);
    if(index === -1){
      return;
    }

    this.cardInHand.splice(index, 1);
  }

  addCardToGame(card){
    this.cardInGame.push(card);
    this.onGetCard.notify({player: this, card: card});

    this.popUp.onHeal.attach(card.onHeal);
    this.popUp.onDamage.attach(card.onDamage);
    this.popUp.onAttack.attach(card.onAttack);
    this.popUp.onAbility.attach(card.onAbility);
    this.popUp.onDie.attach(card.onDie);
  }

  removeCardFromGame(card){
    const index = this.cardInGame.indexOf(card);
    if(index === -1){
      return;
    }
    this.cardInGame.splice(index, 1);

    this.popUp.onHeal.detach(card.onHeal);
    this.popUp.onDamage.detach(card.onDamage);
    this.popUp.onAttack.detach(card.onAttack);
    this.popUp.onAbility.detach(card.onAbility);
    this.popUp.onDie.detach(card.onDie);
  }

  takeCardFromDeck(){
    if(this.cardDeck.length === 0){
      return;
    }

    for(let i = 0; i < this.playerCard.leadership; i++){
      if(this.cardDeck.length === 0){
        break;
      }
      this.addCardToHand(this.cardDeck.pop());
    }
  }
};
