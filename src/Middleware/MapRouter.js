const AbstractMiddleware = require('./AbstractMiddleware');

module.exports = class extends AbstractMiddleware{
  constructor(map, resolver){
    super();
    this.map = map;
    if(this.map instanceof Object){
      this.map = new Map(Object.entries(map));
    }
    this.resolver = resolver;
  }

  handle(request, next){
    const key = this.resolver(request);
    if(!this.map.has(key)){
      return next(request);
    }

    return this.map.get(key)(request, next);
  }
}
