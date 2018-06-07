const Entity = require('../../Entity'),
  prototypes = require('../../Battle/Card/prototypes');

module.exports = class extends Entity{
  constructor(prototype){
    super();
    this.prototype = prototype;
  }

  static fromState(state){
    const instance = new this(state.prototype);
    instance._id = state._id;

    return instance;
  }

  createPrototype(){
    return Object.assign(
      {_id: this._id},
      prototypes.abilities[this.prototype]
    );
  }
};
