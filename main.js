require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./cfg/db');

db.on('error', error => console.error(error));

db.once('open', async => {
  console.log('Conexão com banco estabelecida com sucesso!');

  const app = express();

  app.use(bodyParser.json());
  app.use(express.static('public'));
  app.use(cors());

  app.use('/playlist', require('./controller/PlaylistController'));
  app.use('/spotify', require('./controller/SpotifyApiController'));
  app.use('/user', require('./controller/UserController'));
  app.use('/login', require('./controller/AuthorizationController'));
  // app.use('/', (req, res) => res.send('Hello World'));

  app.listen(5000, () => {
    console.log('Servidor rodando em http://localhost:5000/')
  });
});

