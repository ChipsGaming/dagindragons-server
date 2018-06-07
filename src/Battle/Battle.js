const Player = require('./Player'),
  PlayerCard = require('./Card/PlayerCard'),
  EventEmitter = require('../Event/EventEmitter'),
  NextPlayerEvent = require('./Event/NextPlayer'),
  StartGetEvent = require('./Event/StartGet'),
  StartActionEvent = require('./Event/StartAction');

module.exports = class{
  constructor(){
    this.players = new Array;
    this.currentPlayerIndex = 0;
    this.stage = 'created';
    this.events = new EventEmitter;
  }

  static build(clients){
    const instance = new this;
    clients.forEach(client => {
      const player = new Player(instance, client);
      player.playerCard = new PlayerCard({
        _id: client._id,
        name: client.name,
        maxLife: 30,
        maxAttack: 5,
        cost: 0,
        abilities: client.abilities.map(ability => ability.createPrototype()),
        maxMana: 10,
        mana: 2,
        manaRegen: 1,
        leadership: 2
      }, player);
      player.fillDeck(client.cards.map(card => card.createPrototype()));

      instance.players.push(player);
    })

    return instance;
  }

  get currentPlayer(){
    return this.players[this.currentPlayerIndex];
  }

  get currentEnemyPlayer(){
    if(this.currentPlayerIndex + 1 >= this.players.length){
      return this.players[0];
    }

    return this.players[this.currentPlayerIndex + 1];
  }

  nextPlayer(){
    this.currentPlayerIndex++;
    if(this.currentPlayerIndex < this.players.length){
      this.events.emitEvent(new NextPlayerEvent(this, this.currentPlayer));
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
    this.events.emitEvent(new StartGetEvent(this));
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
    this.events.emitEvent(new StartActionEvent(this));
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
