const AbstractHandler = require('./AbstractHandler');

module.exports = class extends AbstractHandler{
  constructor(declaration, table){
    super(table);
    this.declaration = declaration;
  }

  handle(request){
    const purpose = this.getCardByDeclaration(this.declaration.purpose, request);
    if(purpose === null){
      return 'Карта не найдена на руке';
    }
    if(purpose.cost > this.table.currentPlayer.playerCard.mana){
      return 'Недостаточно маны для призыва';
    }

    this.table.currentPlayer.playerCard.get(purpose);
  }
}
