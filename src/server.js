const express = require('express'),
  server = express(),
  bodyParser = require('body-parser'),
  container = require('./Container');

async function main(){
  const [
    authHandler,
    authMiddleware,
    worldRouter,
    battleRouter
  ] = await container.getAll([
    'authHandler',
    'authMiddleware',
    'worldRouter',
    'battleRouter'
  ]);

  server.use(bodyParser.json());

  server.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json(err);
  });

  server.post('/auth', authHandler.handle.bind(authHandler));
  server.use('/', authMiddleware.handle.bind(authMiddleware));

  worldRouter.bind(server);
  battleRouter.bind(server);

  server.listen(8000, () => {
    console.log('Ready');
  });
}

main();
