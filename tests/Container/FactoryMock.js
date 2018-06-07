const AbstractFactory = require('../../src/Container/AbstractFactory');

module.exports = class extends AbstractFactory{
  constructor(service){
    super();
    this.service = service;
  }

  async build(name, container){
    return this.service;
  }
};
