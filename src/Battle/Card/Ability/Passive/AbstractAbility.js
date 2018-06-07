const AbstractAbility = require('../AbstractAbility');

module.exports = class extends AbstractAbility{
  constructor(_id, name, description, sourceCard, trigger){
    super(_id, name, description, sourceCard);
    this.trigger = trigger;

    const observer = sourceCard.applyAbility.bind(sourceCard, this);
    const bind = () => this.trigger.observe(observer);
    const unbind = () => {
      this.trigger.forget(observer);
      sourceCard.onInGame.forget(bind);
      sourceCard.onDie.forget(unbind);
    };

    sourceCard.onInGame.observe(bind);
    sourceCard.onDie.observe(unbind);
  }

  apply(){
  }
};
