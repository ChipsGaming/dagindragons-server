const AbstractHandler = require('./AbstractHandler'),
  AbstractActiveAbility = require('../Card/Ability/Active/AbstractAbility');

module.exports = class extends AbstractHandler{
  constructor(declaration, table){
    super(table);
    this.declaration = declaration;
  }

  handle(request){
    const source = this.getCardByDeclaration(this.declaration.source, request);
    if(source === null){
      return 'Карта не найдена в игре';
    }
    if(!source.isActive){
      return 'Карта не активна в текущий ход';
    }

    const ability = this.getAbilityByDeclaration(this.declaration.ability, source, request);
    if(ability === null){
      return 'Способность не найдена';
    }
    if(!ability instanceof AbstractActiveAbility){
      return 'Способность является пассивной';
    }

    const purpose = this.getCardByDeclaration(this.declaration.purpose, request);
    if(purpose === null){
      return 'Карта не найдена в игре';
    }

    source.applyAbility(ability, purpose);
  }
}
