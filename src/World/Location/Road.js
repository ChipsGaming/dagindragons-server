const Entity = require('../../Entity');

module.exports = class extends Entity{
  constructor(start, end){
    super();
    this.start = start;
    this.end = end;
  }
};
