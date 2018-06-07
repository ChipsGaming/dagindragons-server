module.exports = class{
  constructor(playerRepository){
    this.playerRepository = playerRepository;
  }

  async handle(req, res, next){
    if(!('x-auth-token' in req.headers)){
      return res.sendStatus(401);
    }

    const player = await this.playerRepository.getBySID(req.headers['x-auth-token']);
    if(player === null){
      return res.sendStatus(401);
    }

    req.currentPlayer = player;
    next();
  }
};
