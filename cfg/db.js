const mongoose = require('mongoose');

const DATABASE_URL = 'mongodb://localhost/spotilist';

mongoose.connect(DATABASE_URL, {useNewUrlParser: true});

module.exports = mongoose.connection;
