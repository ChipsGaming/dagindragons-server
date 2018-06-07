const assert = require('assert'),
  sinon = require('sinon'),
  Container = require('../../src/Container/Container'),
  FactoryMock = require('./FactoryMock'),
  SharedFactoryMock = require('./SharedFactoryMock'),
  ServiceNotFoundException = require('../../src/Container/Exception/ServiceNotFoundException');

describe('Container::has', () => {
  it('should return false if service not found', () => {
    const container = new Container;

    container.set('foo', 'bar');

    assert(container.has('foo'));
    assert(!container.has('foz'));
  });
});

describe('Container::get', () => {
  it('should throw exception if service not found', (done) => {
    const container = new Container;

    container.set('foo', 'bar');

    container.get('foz')
      .then(() => {
        done(new Error);
      })
      .catch((err) => {
        if(err instanceof ServiceNotFoundException){
          done();
        }
        else{
          done(new Error);
        }
      });
  });

  it('should return service by name', async () => {
    const container = new Container,
      service = 'bar';

    container.set('foo', service);

    assert(await container.get('foo') === service);
  });

  it('should build and return service if use factory', async () => {
    const container = new Container,
      name = 'foo',
      service = 'bar',
      factory = new FactoryMock(service),
      spy = sinon.spy(factory, 'build');

    container.set(name, factory);

    assert(await container.get(name) === service);
    assert(spy.calledWith(name, container));
  });

  it('should build, share and return service if user shared factory', async () => {
    const container = new Container,
      name = 'foo',
      service = 'bar',
      factory = new SharedFactoryMock(service),
      spy = sinon.spy(factory, 'build');

    container.set(name, factory);

    assert(await container.get(name) === service);
    assert(await container.get(name) === service);
    assert(spy.calledWith(name, container));
    assert(spy.calledOnce);
  });
});
