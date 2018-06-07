const assert = require('assert'),
  sinon = require('sinon'),
  Signal = require('../src/Signal');

describe('Signal', () => {
  it('should notify all observers', () => {
    const signal = new Signal,
      observers = [sinon.spy(), sinon.spy(), sinon.spy()];
    observers.forEach((observer) => signal.observe(observer));
    signal.forget(observers[0]);

    const data = 'hello';
    signal.notify(data);

    assert(!observers[0].called);
    assert(observers[1].calledWith(data))
    assert(observers[2].calledWith(data))
  });
});
