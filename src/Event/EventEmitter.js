const EventEmitter = require('events');

module.exports = class extends EventEmitter{
  emitEvent(event){
    this.emit(event.name, event);
  }
};
