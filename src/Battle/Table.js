const Signal = require('../Signal'),
  Player = require('./Player'),
  PlayerCard = require('./Card/PlayerCard');

module.exports = class{
  static build(players){
    const table = new this;
    players.forEach((options) => {
      const player = new Player(table, options.client).fillDeck(options.deck);
      player.playerCard = new PlayerCard(player, options.props)
      table.players.push(player);
    });

    return table;
  }

  constructor(){
    this.players = new Array;
    this.currentPlayerIndex = 0;
    this.stage = 'get';

    this.onStartLap = new Signal;
    this.onStartBattle = new Signal;
    this.onNextPlayer = new Signal;
  }

  get currentPlayer(){
    return this.players[this.currentPlayerIndex];
  }

  get currentEnemyPlayer(){
    if(this.currentPlayerIndex == 0){
      return this.players[1];
    }
    else{
      return this.players[0];
    }
  }

  nextPlayer(){
    this.currentPlayerIndex++;
    if(this.currentPlayerIndex < this.players.length){
      this.onNextPlayer.notify();
      return true;
    }

    return false;
  }

  init(){
    this.players.forEach((player) => {
      player.onGetCard.observe(this.onGet.bind(this))
      player.onApplyCard.observe(this.onActive.bind(this))
    });

    return this;
  }

  // Life cycle
  start(){
    this.players.forEach((player) => {
      player.takeCardFromDeck();

      const card = player.playerCard;
      card.mana += card.manaRegen;
      if(card.mana > card.maxMana){
        card.mana = card.maxMana;
      }
    });
    this.onStartLap.notify();
    this.getStage();
  }

  getStage(){
    this.currentPlayerIndex = 0;
    this.stage = 'get';
    this.players.forEach((player) => player.playerCard.isActive = true);
  }

  battleStage(){
    this.currentPlayerIndex = 0;
    this.stage = 'battle';
    this.players.forEach((player) => {
      player.playerCard.isActive = true;
      player.cardInGame.forEach((card) => card.isActive = true);
    });
    this.onStartBattle.notify();
  }

  // Listeners
  onGet(){
    if(
      this.currentPlayer.playerCard.isActive
      && this.currentPlayer.cardInHand.length > 0
    ){
      return;
    }

    if(this.nextPlayer()){
      return;
    }

    this.battleStage();
  }

  onActive(){
    if(
      this.currentPlayer.playerCard.isActive
      || this.currentPlayer.activeCardsInGame.length > 0
    ){
      return;
    }

    if(this.nextPlayer()){
      return;
    }

    this.start();
  }
};
