const AbstractHandler = require('../../Middleware/AbstractHandler');

module.exports = class extends AbstractHandler{
  constructor(table){
    super();
    this.table = table;
  }

  getCardByDeclaration(declaration, request){
    const player = declaration.currentPlayer?
      this.table.currentPlayer
      : this.table.currentEnemyPlayer;

    switch(declaration.type){
      case 'hero':
        return player.playerCard;
      case 'mob':
        let cards = [];
        switch(declaration.deck){
            case 'game':
              cards = player.cardInGame;
              break;
            case 'hand':
              cards = player.cardInHand;
              break;
        }

        const index = parseInt(request.routeMatch[declaration.routeMatchIndex]);
        if(cards[index] === undefined){
           return null;
        }

        return cards[index];
    }
  }

  getAbilityByDeclaration(declaration, source, request){
    const index = parseInt(request.routeMatch[declaration.routeMatchIndex]);
    if(source.abilities[index] === undefined){
      return null;
    }

    return source.abilities[index];
  }
};
