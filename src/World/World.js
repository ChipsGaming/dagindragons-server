const EventEmitter = require('../Event/EventEmitter');

module.exports = class{
  constructor(){
    this.events = new EventEmitter;
  }
};
