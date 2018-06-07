const SharedFactory = require('../../src/Container/SharedFactory'),
  FactoryMock = require('./FactoryMock');

module.exports = class extends SharedFactory{
  constructor(service){
    super(new FactoryMock(service));
  }
};
