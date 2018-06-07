const AbstractAbility = require('./AbstractAbility');

module.exports = class extends AbstractAbility{
  constructor(_id, name, description, sourceCard){
    super(_id, name, description, sourceCard);
  }

  apply(target){
    target.damage(this.sourceCard.attack + 1);
    this.sourceCard.damage(1);
  }
};
