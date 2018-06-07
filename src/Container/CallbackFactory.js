const AbstractFactory = require('./AbstractFactory');

module.exports = class extends AbstractFactory{
  constructor(callback){
    super();
    this.callback = callback;
  }

  async build(name, container, params = {}){
    return this.callback(name, container, params);
  }
};
