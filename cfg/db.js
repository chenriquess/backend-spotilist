const mongoose = require('mongoose');

const DATABASE_URL = 'mongodb://banco_de_dados/spotilist';

mongoose.connect(DATABASE_URL, {useNewUrlParser: true});

module.exports = mongoose.connection;
