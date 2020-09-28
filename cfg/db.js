const mongoose = require('mongoose');

const DATABASE_URL = 'mongodb://localhost/spotilist';

// Abrindo a conexão com o banco
mongoose.connect(DATABASE_URL, {useNewUrlParser: true});

// Obtendo a conexão e exportando
module.exports = mongoose.connection;