const express = require('express');
const router = express.Router()
const SpotifyWebApi = require("spotify-web-api-node");
const mongoose = require('mongoose');
const Playlist = mongoose.models.Playlist || require('../model/Playlist')

const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'],
  redirectUri = 'http://localhost:5000/spotify/callback',
  clientId = '716c91137a1a4c6d941e4f7a19719b80',
  state = 'some-state-of-my-choice';

const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: '2ca0a492f96a470a888cdd1a99951baa'
});

const userVerification = async (req, res, next) => {
  spotifyApi.getMe().then(userInfo => {
    if (userInfo.body.id) {
      req.userId = userInfo.body.id;
      next();
    } else {
      res.status(401).json({ erro: `Usuário não encontrado` });
    }
  }).catch(e => {
    if (e.statusCode === 401) {
      spotifyLogin(res);
    } else {
      res.send(e)
    }
  });
};


const getPlaylistById = async (req, res, next) => {
  try {
    let playlist = await Playlist.findById(req.params.id);
    if (playlist === null) {
      res.status(404).json({ erro: 'Não foi encontrado uma Playlist com o id informado' });
    } else {
      req.playlist = playlist;
      next();
    }
  } catch (erro) {
    res.status(500).json({ erro: 'O id informado não é válido' });
  }
};

const spotifyLogin = (res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);
  res.send({ spotifyAuth: false, authorizeURL });
}

router.use('/login', ((req, res) => {
  spotifyLogin(res);
}));


router.use('/callback', ((req, res) => {
  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function (data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      res.redirect('http://localhost:3000/')
    },
    function (err) {
      console.log('Erro:', err);
    }
  );
}));

router.get('/search', userVerification, (req, res) => {
  spotifyApi.search(req.query.q, ['track']).then(result => {
    res.send(result.body.tracks.items.map(track => {
      return {
        id: track.id,
        title: track.name,
        artists: track.artists.length ? track.artists.map(artist => artist.name) : [],
        album: track.album.name,
        popularity: track.popularity,
        albumImgUrl: track.album.images[0] ? track.album.images[0].url : ''
      }
    }));
  });
});

router.get('/playlists', userVerification, ((req, res) => {
  spotifyApi.getMe().then(userInfo => {
    spotifyApi.getUserPlaylists(userInfo.body.id).then(playlists => {

      res.send(
        JSON.stringify(playlists.body.items.map(item => {
          return {
            id: item.id,
            title: item.name,
            imgUrl: item.images[0] ? item.images[0].url : ''
          }
        }))
      );

    })
  }).catch(e => {
    if (e.statusCode === 401) {
      spotifyLogin(res);
    } else {
      res.send(e)
    }
  })
  ;
}));

router.post('/playlist', userVerification, (req, res) => {
  spotifyApi.createPlaylist(req.userId, req.body.title)
    .then(value => res.send(value))
    .catch(e => res.send(e));
});

router.get('/playlist/:id', userVerification, (req, res) => {
  spotifyApi.getPlaylistTracks(req.params.id, { fields: 'items(track)' })
    .then(value => res.send(value.body.items.map(item => {
      return {
        id: item.track.id,
        title: item.track.name,
        artists: item.track.artists.length ? item.track.artists.map(artist => artist.name) : [],
        album: item.track.album.name,
        popularity: item.track.popularity,
        albumImgUrl: item.track.album.images[0] ? item.track.album.images[0].url : ''
      }
    })))
    .catch(e => res.send(e));
});

module.exports = router;
