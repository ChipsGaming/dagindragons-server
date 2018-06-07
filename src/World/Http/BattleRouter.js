const AbstractRouter = require('../../Http/AbstractRouter'),
  EntityNotFoundException = require('../Exception/EntityNotFoundException'),
  LogicException = require('../Exception/LogicException');

module.exports = class extends AbstractRouter{
  constructor(
    battleRepository
  ){
    super();
    this.battleRepository = battleRepository;
  }

  bind(server, path = '/'){
    this.router.use('/battle/*', async (req, res, next) => {
      if(req.currentPlayer.battle === null){
        return res.status(500).json(new LogicException('You are not in battle'));
      }
      next();
    });
    this.router.use('/battle/*', async (req, res, next) => {
      req.battle = await this.battleRepository.getBattle(req.currentPlayer.battle);
      if(req.battle.stage === 'created'){
        req.battle.init().start();
      }
      next();
    });
    this.router.use([
      '/battle/skip',
      '/battle/skip/:card',
      '/battle/get/:card',
      '/battle/attack/:card/:target',
      '/battle/apply/:card/:ability/:target'
    ], async (req, res, next) => {
      if(!req.currentPlayer.isEqual(req.battle.currentPlayer.client)){
        return res.sendStatus(403);
      }

      next();
    });
    this.router.use([
      '/battle/skip',
      '/battle/get/:card'
    ], async (req, res, next) => {
      if(req.battle.stage !== 'get'){
        return res.sendStatus(403);
      }

      next();
    });
    this.router.use([
      '/battle/skip/:card',
      '/battle/attack/:card/:target',
      '/battle/apply/:card/:ability/:target'
    ], async (req, res, next) => {
      if(req.battle.stage !== 'battle'){
        return res.sendStatus(403);
      }

      next();
    });

    this.router.get('/battle/view', this.viewBattle.bind(this));
    this.router.post('/battle/skip', this.skipGet.bind(this));
    this.router.post('/battle/skip/:card', this.skip.bind(this));
    this.router.post('/battle/get/:card', this.get.bind(this));
    this.router.post('/battle/attack/:card/:target', this.attack.bind(this));
    this.router.post('/battle/apply/:card/:ability/:target', this.apply.bind(this));

    super.bind(server, path);
  }

  normalizeAbility(ability){
    return {
      _id: ability._id,
      name: ability.name,
      description: ability.description
    };
  }

  normalizeCard(card){
    return {
      _id: card._id,
      isActive: card.isActive,
      name: card.name,
      maxLife: card.maxLife,
      life: card.life,
      maxAttack: card.maxAttack,
      attack: card.attack,
      cost: card.cost,
      abilities: card.abilities.map(this.normalizeAbility.bind(this))
    }
  }

  normalizePlayerCard(card){
    let normalize = this.normalizeCard(card);
    normalize.maxMana = card.maxMana;
    normalize.mana = card.mana;
    normalize.manaRegen = card.manaRegen;
    normalize.leadership = card.leadership;

    return normalize;
  }

  normalizePlayer(player){
    return {
      playerCard: this.normalizePlayerCard(player.playerCard),
      cardInHand: player.cardInHand.map(this.normalizeCard.bind(this)),
      cardInGame: player.cardInGame.map(this.normalizeCard.bind(this))
    };
  }
  
  normalizeBattle(battle){
    return {
      players: battle.players.map(this.normalizePlayer.bind(this)),
      currentPlayerIndex: battle.currentPlayerIndex,
      stage: battle.stage
    };
  }

  getInHandCardsIndex(player){
    const cards = new Map;
    for(const card of player.cardInHand){
      cards.set(card._id, card);
    }

    return cards;
  }

  getInGameCardsIndex(player){
    const cards = new Map;
    cards.set(player.playerCard._id, player.playerCard);
    for(const card of player.cardInGame){
      cards.set(card._id, card);
    }

    return cards;
  }

  getAbilitiesIndex(card){
    const abilities = new Map;
    for(const ability of card.abilities){
      abilities.set(ability._id, ability);
    }

    return abilities;
  }

  // Handlers
  async viewBattle(req, res){
    return res.json({
      entity: this.normalizeBattle(req.battle)
    });
  }

  async skipGet(req, res){
    req.battle.currentPlayer.playerCard.skipGet();

    return res.sendStatus(200);
  }

  async get(req, res){
    const cards = this.getInHandCardsIndex(req.battle.currentPlayer);
    if(!cards.has(req.params.card)){
      return res.status(500).json(new EntityNotFoundException('Card not found'));
    }

    const card = cards.get(req.params.card);
    if(card.cost > req.battle.currentPlayer.playerCard.mana){
      return res.status(500).json(new LogicException('Not enough mana'));
    }

    req.battle.currentPlayer.playerCard.get(card);

    return res.sendStatus(200);
  }

  async skip(req, res){
    const cards = this.getInGameCardsIndex(req.battle.currentPlayer);
    if(!cards.has(req.params.card)){
      return res.status(500).json(new EntityNotFoundException('Card not found'));
    }

    cards.get(req.params.card).skip();

    return res.sendStatus(200);
  }

  async attack(req, res){
    const currentPlayerCards = this.getInGameCardsIndex(req.battle.currentPlayer);
    if(!currentPlayerCards.has(req.params.card)){
      return res.status(500).json(new EntityNotFoundException('Card not found'));
    }
    const enemyPlayerCards = this.getInGameCardsIndex(req.battle.currentEnemyPlayer);
    if(!enemyPlayerCards.has(req.params.target)){
      return res.status(500).json(new EntityNotFoundException('Target not found'));
    }

    const card = currentPlayerCards.get(req.params.card),
      target = enemyPlayerCards.get(req.params.target);
    if(!card.isActive){
      return res.status(500).json(new LogicException('Card is not active'));
    }

    card.applyAttack(target);

    return res.sendStatus(200);
  }

  async apply(req, res){
    const currentPlayerCards = this.getInGameCardsIndex(req.battle.currentPlayer);
    if(!currentPlayerCards.has(req.params.card)){
      return res.status(500).json(new EntityNotFoundException('Card not found'));
    }
    const card = currentPlayerCards.get(req.params.card);
    if(!card.isActive){
      return res.status(500).json(new LogicException('Card is not active'));
    }

    const abilities = this.getAbilitiesIndex(card);
    if(!abilities.has(req.params.ability)){
      return res.status(500).json(new EntityNotFoundException('Ability not found'));
    }
    const ability = abilities.get(req.params.ability);

    const enemyPlayerCards = this.getInGameCardsIndex(req.battle.currentEnemyPlayer);
    if(!enemyPlayerCards.has(req.params.target)){
      return res.status(500).json(new EntityNotFoundException('Target not found'));
    }
    const target = enemyPlayerCards.get(req.params.target);

    card.applyAbility(ability, target);

    return res.sendStatus(200);
  }
};
