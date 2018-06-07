const AbstractHandler = require('./AbstractHandler');

module.exports = class extends AbstractHandler{
  constructor(callback){
    super();
    this.callback = callback;
  }

  handle(request){
    return this.callback(request);
  }
}
