const AbstractRouter = require('../../Http/AbstractRouter'),
  prototypes = require('../../Battle/Card/prototypes'),
  Battle = require('../Battle/Battle'),
  Card = require('../Player/Card'),
  Ability = require('../Player/Ability'),
  EntityNotFoundException = require('../Exception/EntityNotFoundException'),
  LogicException = require('../Exception/LogicException');

module.exports = class extends AbstractRouter{
  constructor(
    playerRepository,
    locationRepository,
    roadRepository,
    battleRepository
  ){
    super();
    this.playerRepository = playerRepository;
    this.locationRepository = locationRepository;
    this.roadRepository = roadRepository;
    this.battleRepository = battleRepository;
  }

  bind(server, path = '/'){
    this.router.use([
      '/attack/:id',
      '/move/:id'
    ], async (req, res, next) => {
      if(req.currentPlayer.battle !== null){
        return res.status(500).json(new LogicException('You are in battle'));
      }
      next();
    });
    this.router.get('/view/player', this.viewCurrentPlayer.bind(this));
    this.router.get('/view/player/:id', this.viewPlayer.bind(this));
    this.router.get('/view/location', this.viewCurrentLocation.bind(this));
    this.router.post('/buy/card/:id', this.buyCard.bind(this));
    this.router.post('/buy/ability/:id', this.buyAbility.bind(this));
    this.router.post('/attack/:id', this.attack.bind(this));
    this.router.post('/move/:id', this.move.bind(this));

    super.bind(server, path);
  }

  normalizePlayer(player){
    return {
      _id: player._id,
      name: player.name,
      battle: player.battle,
      money: player.money,
      cards: player.cards.map(card => card.createPrototype()),
      abilities: player.abilities.map(ability => ability.createPrototype())
    };
  }

  normalizeLocation(location){
    return {
      _id: location._id,
      name: location.name,
      description: location.description,
      isStart: location.isStart
    };
  }

  normalizeBattle(battle){
    return {
      _id: battle._id
    };
  }

  // Handlers
  async viewCurrentPlayer(req, res){
    res.json({
      entity: this.normalizePlayer(req.currentPlayer)
    });
  }

  async viewPlayer(req, res){
    const player = await this.playerRepository.get(req.params.id);
    if(
      player === null
      || !req.currentPlayer.location.isEqual(player.location)
    ){
      return res.status(500).json(new EntityNotFoundException('Player not found'));
    }

    res.json({
      entity: this.normalizePlayer(player)
    });
  }

  async viewCurrentLocation(req, res){
    const [nearbyLocations, nearbyPlayers] = await Promise.all([
      this.locationRepository.getNearbyLocations(req.currentPlayer.location),
      this.playerRepository.getByLocation(req.currentPlayer.location)
    ]);

    return res.json({
      entity: this.normalizeLocation(req.currentPlayer.location),
      nearbyLocations: nearbyLocations.map(this.normalizeLocation.bind(this)),
      nearbyPlayers: nearbyPlayers
        .filter((player) => req.currentPlayer._id !== player._id)
        .map(this.normalizePlayer.bind(this)),
      cardStore: req.currentPlayer.location.createCardStore(),
      abilityStore: req.currentPlayer.location.createAbilityStore()
    });
  }

  async buyCard(req, res){
    const cardStoreIndex = new Map(
      req.currentPlayer.location.cardStore.map(card => [card.prototype, card])
    );

    if(!cardStoreIndex.has(req.params.id)){
      return res.status(404).json(new EntityNotFoundException('Card not found'));
    }
    
    const {prototype, price} = cardStoreIndex.get(req.params.id);
    if(req.currentPlayer.money < price){
      return res.status(500).json(new LogicException('Not enough money'));
    }

    const card = new Card(prototype);
    card.abilities = prototypes.cards[prototype].abilities
      .map(prototype => new Ability(prototype));

    req.currentPlayer.buyCard(card, price);
    this.playerRepository.save(req.currentPlayer);

    return res.sendStatus(200);
  }

  async buyAbility(req, res){
    const abilityStoreIndex = new Map(
      req.currentPlayer.location.abilityStore
        .map(ability => [ability.prototype, ability])
    );

    if(!abilityStoreIndex.has(req.params.id)){
      return res.status(404).json(new EntityNotFoundException('Ability not found'));
    }
    
    const {prototype, price} = abilityStoreIndex.get(req.params.id);
    if(req.currentPlayer.money < price){
      return res.status(500).json(new LogicException('Not enough money'));
    }

    req.currentPlayer.buyAbility(new Ability(prototype), price);
    this.playerRepository.save(req.currentPlayer);

    return res.sendStatus(200);
  }

  async attack(req, res){
    const targetPlayer = await this.playerRepository.get(req.params.id);
    if(
      targetPlayer === null
      || !req.currentPlayer.location.isEqual(targetPlayer.location)
    ){
      return res.status(404).json(new EntityNotFoundException('Player not found'));
    }

    const battle = new Battle(req.currentPlayer, targetPlayer);
    req.currentPlayer.attack(targetPlayer, battle);

    this.battleRepository.save(battle);
    this.playerRepository.save(req.currentPlayer);
    this.playerRepository.save(targetPlayer);

    res.json({
      entity: this.normalizeBattle(battle)
    });
  }

  async move(req, res){
    const location = await this.locationRepository.get(req.params.id);
    if(location === null){
      return res.status(404).json(new EntityNotFoundException('Location not found'));
    }
    if(location === req.currentPlayer.location){
      return res.status(500).json(new LogicException('Can not go to the current location'));
    }
    if(!(await this.roadRepository.isNearby(req.currentPlayer.location, location))){
      return res.status(404).json(new EntityNotFoundException('Location not found'));
    }

    req.currentPlayer.move(location);
    this.playerRepository.save(req.currentPlayer);

    return res.sendStatus(200);
  }
};
