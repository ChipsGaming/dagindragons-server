const AbstractHandler = require('./AbstractHandler');

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

    switch(this.declaration.stage){
      case 'get':
        source.skipGet();
        break;
      case 'battle':
        source.skip();
        break;
    }
  }
}
