const AbstractHandler = require('./AbstractHandler');

module.exports = class extends AbstractHandler{
  constructor(middlewares, handler){
    super();
    this.middlewares = middlewares;
    this.handler = handler;
  }

  handle(request){
    if(this.middlewares.length === 0){
      return this.handler.handle(request);
    }

    return this.middlewares[0]
      .handle(
        request,
        (request) => 
          (new this.constructor(
            this.middlewares.slice(1),
            this.handler
          )).handle(request)
      );
  }
};
