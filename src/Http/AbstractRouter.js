const router = require('express').Router();

module.exports = class{
  constructor(){
    this.router = router;
  }

  bind(server, path = '/'){
    server.use(path, this.router);
  }
};
