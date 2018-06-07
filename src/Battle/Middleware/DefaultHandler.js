const AbstractHandler = require('../../Middleware/AbstractHandler'),
  Pipe = require('../../Middleware/Pipe'),
  CallbackHandler = require('../../Middleware/CallbackHandler'),
  CallbackMiddleware = require('../../Middleware/CallbackMiddleware'),
  RegexRouter = require('../../Middleware/RegexRouter'),
  MapRouter = require('../../Middleware/MapRouter'),
  HelpHandler = require('./HelpHandler'),
  GetHandler = require('./GetHandler'),
  AttackHandler = require('./AttackHandler'),
  ApplyAbilityHandler = require('./ApplyAbilityHandler'),
  SkipHandler = require('./SkipHandler'),
  ViewHandler = require('./ViewHandler');

module.exports = class extends AbstractHandler{
  constructor(app){
    super();
    this.app = app;
    this.pipe = new Pipe([
      new CallbackMiddleware((request, next) => {
        if(request.client !== this.app.table.currentPlayer.client){
          return;
        }

        return next(request);
      }),
      new RegexRouter([
        {
          regex: /^help/i,
          handler: new HelpHandler(this.app)
        },
        {
          regex: /^ping$/i,
          handler: new CallbackHandler((request) => 'pong')
        },
        {
          regex: /^о(?:смотреть)?$/i,
          handler: new CallbackHandler((request) => new this.app.views.table(this.app.table))
        },
        {
          regex: /^о(?:смотреть)? р(?:уку)? (\d+)$/i,
          handler: new ViewHandler({
            purpose: {type: 'mob', deck: 'hand', currentPlayer: true, routeMatchIndex: 1}
          }, this.app)
        },
        {
          regex: /^о(?:смотреть)? р(?:уку)? п(?:ротивника)? (\d+)$/i,
          handler: new ViewHandler({
            purpose: {type: 'mob', deck: 'hand', currentPlayer: false, routeMatchIndex: 1}
          }, this.app)
        },
        {
          regex: /^о(?:смотреть)? с(?:тол)? (\d+)$/i,
          handler: new ViewHandler({
            purpose: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1}
          }, this.app)
        },
        {
          regex: /^о(?:смотреть)? с(?:тол)? п(?:ротивника)? (\d+)$/i,
          handler: new ViewHandler({
            purpose: {type: 'mob', deck: 'game', currentPlayer: false, routeMatchIndex: 1}
          }, this.app)
        },
        {
          regex: /^о(?:смотреть)? г(?:ероя)?$/i,
          handler: new ViewHandler({
            purpose: {type: 'hero', currentPlayer: true}
          }, this.app)
        },
        {
          regex: /^о(?:смотреть)? г(?:ероя)? п(?:ротивника)?$/i,
          handler: new ViewHandler({
            purpose: {type: 'hero', currentPlayer: false}
          }, this.app)
        }
      ]),
      new MapRouter({
        get: (request, next) =>
          new RegexRouter([
            {
              regex: /^пасс$/i,
              handler: new SkipHandler({
                source: {type: 'hero', currentPlayer: true},
                stage: 'get'
              }, this.app)
            },
            {
              regex: /^п(?:ризвать)? (\d+)$/i,
              handler: new GetHandler({
                purpose: {type: 'mob', deck: 'hand', currentPlayer: true, routeMatchIndex: 1}
              }, this.app)
            }
          ]).handle(request, next),
        battle: (request, next) =>
          new RegexRouter([
            {
              regex: /^пасс$/i,
              handler: new CallbackHandler((request) => {
                this.app.table.currentPlayer.playerCard.skip();
                this.app.table.currentPlayer.cardInGame.forEach((card) => card.skip());

                return new this.app.views.table(this.app.table);
              })
            },
            {
              regex: /^г(?:ерой)? пасс$/i,
              handler: new SkipHandler({
                source: {type: 'hero', currentPlayer: true},
                stage: 'battle'
              }, this.app)
            },
            {
              regex: /^(\d+) пасс$/i,
              handler: new SkipHandler({
                source: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1},
                stage: 'battle'
              }, this.app)
            },
            {
              regex: /^(\d+) а(?:така)? (\d+)$/i,
              handler: new AttackHandler({
                source: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1},
                purpose: {type: 'mob', deck: 'game', currentPlayer: false, routeMatchIndex: 2}
              }, this.app)
            },
            {
              regex: /^г(?:ерой)? а(?:така)? (\d+)$/i,
              handler: new AttackHandler({
                source: {type: 'hero', currentPlayer: true},
                purpose: {type: 'mob', deck: 'game', currentPlayer: false, routeMatchIndex: 1}
              }, this.app)
            },
            {
              regex: /^(\d+) а(?:така)? г(?:ерой)?$/i,
              handler: new AttackHandler({
                source: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1},
                purpose: {type: 'hero', currentPlayer: false}
              }, this.app)
            },
            {
              regex: /^г(?:ерой)? а(?:така)? г(?:ерой)?$/i,
              handler: new AttackHandler({
                source: {type: 'hero', currentPlayer: true},
                purpose: {type: 'hero', currentPlayer: false}
              }, this.app)
            },
            {
              regex: /^(\d+):(\d+) п(?:рименить)? (\d+)$/i,
              handler: new ApplyAbilityHandler({
                source: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1},
                ability: {routeMatchIndex: 2},
                purpose: {type: 'mob', deck: 'game', currentPlayer: false, routeMatchIndex: 3}
              }, this.app)
            },
            {
              regex: /^(\d+):(\d+) п(?:рименить)? г(?:ерой)?$/i,
              handler: new ApplyAbilityHandler({
                source: {type: 'mob', deck: 'game', currentPlayer: true, routeMatchIndex: 1},
                ability: {routeMatchIndex: 2},
                purpose: {type: 'hero', currentPlayer: false}
              }, this.app)
            },
            {
              regex: /^г(?:ерой)?:(\d+) п(?:рименить)? (\d+)$/i,
              handler: new ApplyAbilityHandler({
                source: {type: 'hero', currentPlayer: true},
                ability: {routeMatchIndex: 1},
                purpose: {type: 'mob', deck: 'game', currentPlayer: false, routeMatchIndex: 2}
              }, this.app)
            },
            {
              regex: /^г(?:ерой)?:(\d+) п(?:рименить)? г(?:ерой)?$/i,
              handler: new ApplyAbilityHandler({
                source: {type: 'hero', currentPlayer: true},
                ability: {routeMatchIndex: 1},
                purpose: {type: 'hero', currentPlayer: false}
              }, this.app)
            }
          ]).handle(request, next),
      }, (request) => this.app.table.stage),
    ], new CallbackHandler((request) => 'Unknown command'));
  }

  handle(request){
    return this.pipe.handle(request);
  }
};
