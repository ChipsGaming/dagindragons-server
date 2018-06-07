const AbstractFactory = require('./AbstractFactory');

module.exports = class extends AbstractFactory{
  constructor(targetClass){
    super();
    this.targetClass = targetClass;
  }

  async build(name, container, params = {}){
    return container.getAll(
      this.targetClass.toString()
        .match(/constructor\(([^)]*)\)/)[1]
        .split(',')
        .map(dep => dep.trim())
    )
      .then(deps => Reflect.construct(this.targetClass, deps));
  }
};
