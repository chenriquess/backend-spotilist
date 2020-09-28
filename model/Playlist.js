const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: String,
  songs: [Number]
});

module.exports = mongoose.model('Playlist', playlistSchema);