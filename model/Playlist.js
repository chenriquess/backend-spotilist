const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: String,
  songs: [{
    id: String,
    title: String,
    artists: [String],
    album: String,
    popularity: Number,
    albumImgUrl: String
  }]
});

module.exports = mongoose.model('Playlist', playlistSchema);