const AbstractMiddleware = require('./AbstractMiddleware');

module.exports = class extends AbstractMiddleware{
  constructor(callback){
    super();
    this.callback = callback;
  }

  handle(request, next){
    return this.callback(request, next);
  }
}
