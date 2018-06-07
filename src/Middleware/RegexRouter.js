const AbstractMiddleware = require('./AbstractMiddleware');

module.exports = class extends AbstractMiddleware{
  constructor(routes){
    super();
    this.routes = routes;
  }

  handle(request, next){
    let match = null;
    for(const route of this.routes){
      match = request.command.match(route.regex);
      if(match === null){
        continue;
      }

      request.routeMatch = match;
      if(route.handler instanceof AbstractMiddleware){
        return route.handler.handle(request, next);
      }
      return route.handler.handle(request);
    }

    return next(request);
  }
}
