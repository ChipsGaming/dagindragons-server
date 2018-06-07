const Entity = require('../../Entity');

module.exports = class extends Entity{
  constructor(from, to){
    super();
    this.from = from;
    this.to = to;
  }
};
