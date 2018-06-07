const Signal = require('../../Signal');

module.exports = class{
  constructor(prototype, player){
    this.onInGame = new Signal;
    this.onHeal = new Signal;
    this.onDamage = new Signal;
    this.onAttack = new Signal;
    this.onAbility = new Signal;
    this.onDie = new Signal;

    this.player = player;
    this.isActive = true;
    this._id = prototype._id;
    this.name = prototype.name;
    this.maxLife = this.life = prototype.maxLife;
    this.maxAttack = this.attack = prototype.maxAttack;
    this.cost = prototype.cost;
    this.abilities = prototype.abilities.map(ability =>
      new ability.class(
        ability._id,
        ability.name,
        ability.description,
        this
      )
    );
  }

  get isDie(){
    return this.life <= 0;
  }

  skip(){
    if(this.isActive === false){
      return;
    }

    this.isActive = false;
    this.player.onApplyCard.notify();
  }

  damage(volume){
    this.onDamage.notify({card: this, volume: volume});
    this.life -= volume;
    if(this.isDie){
      this.kill();
    }
  }

  heal(volume){
    this.onHeal.notify({card: this, volume: volume});
    this.life += volume;
    if(this.life > this.maxLife){
      this.life = this.maxLife;
    }
  }

  applyAttack(card){
    this.onAttack.notify({card: this, target: card});
    card.damage(this.attack);
    this.isActive = false;
    this.player.onApplyCard.notify();
  }

  applyAbility(ability, card){
    if(card !== undefined){
      this.onAbility.notify({card: this, ability: ability, target: card});
      ability.apply(card);
      this.isActive = false;
      this.player.onApplyCard.notify();
    }
    else{
      this.onAbility.notify({card: this, ability: ability, target: undefined});
      ability.apply();
    }
  }

  kill(){
    this.onDie.notify({card: this});
    this.player.removeCardFromGame(this);
  }
};
