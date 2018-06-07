const Signal = require('./Signal');

module.exports = class extends Signal{
  constructor(){
    super();
    this.signals = new Set;
    this.input = this.notify.bind(this);
  }

  attach(signal){
    this.signals.add(signal);
    signal.observe(this.input);
  }

  detach(signal){
    signal.forget(this.input);
    this.signals.delete(signal);
  }

  detachAll(){
    this.signals.forEach(
      (signal) => this.detach(signal)
    );
  }
};
