const DuplicateEntityException = require('../Exception/DuplicateEntityException');

module.exports = class{
  constructor(playerRepository){
    this.playerRepository = playerRepository;
  }

  async handle(req, res){
    if(!('name' in req.body)){
      return res.status(400).send('Use "name" parameter for authorization');
    }
    if(!('password' in req.body)){
      return res.status(400).send('Use "password" parameter for authorization');
    }

    try{
      const player = await this.playerRepository.authOrRegister(req.body.name, req.body.password);

      res.setHeader('Content-Type', 'application/json');
      return res.json({sid: player.sid});
    }
    catch(err){
      if(err instanceof DuplicateEntityException){
        return res.status(404).send('Player not found');
      }
      else{
        return res.status(500).json(err);
      }
    }
  }
};
