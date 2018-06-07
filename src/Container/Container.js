const AbstractFactory = require('./AbstractFactory'),
  ServiceNotFoundException = require('./Exception/ServiceNotFoundException');

module.exports = class{
  constructor(services){
    this.services = new Map;

    for(const name in services){
      this.set(name, services[name]);
    }
  }

  set(name, service){
    this.services.set(name, service);
  }

  has(name){
    return this.services.has(name);
  }

  async get(name){
    if(!this.services.has(name)){
      throw new ServiceNotFoundException(name);
    }

    let service = this.services.get(name);
    if(service instanceof AbstractFactory){
      service = service.build(name, this);
    }

    return service;
  }

  async getAll(names){
    return Promise.all(
      names.map(this.get.bind(this))
    );
  }
};
