const AbstractFactory = require('./AbstractFactory');

module.exports = class extends AbstractFactory{
  constructor(factory){
    super();
    this.factory = factory;
  }

  async build(name, container, params = {}){
    const service = await this.factory.build(name, container, params);
    container.set(name, service);

    return service;
  }
};
