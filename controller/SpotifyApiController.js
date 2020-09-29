const express = require('express');
const router = express.Router()
const SpotifyWebApi = require("spotify-web-api-node");
const mongoose = require('mongoose');
const Playlist = mongoose.models.Playlist || require('../model/Playlist')

const tokenVerification = async (req, res, next) => {
  spotifyApi.getMe().then(userInfo => {
    if (userInfo.body.id) {
      req.userId = userInfo.body.id;
      next();
    } else {
      res.status(401).json({erro: `Usuário não encontrado`});
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
      res.status(404).json({erro: 'Não foi encontrado uma Playlist com o id informado'});
    } else {
      req.playlist = playlist;
      next();
    }
  } catch (erro) {
    res.status(500).json({erro: 'O id informado não é válido'});
  }
};


const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private'],
  redirectUri = 'http://localhost:5000/spotify/callback',
  clientId = '716c91137a1a4c6d941e4f7a19719b80',
  state = 'some-state-of-my-choice';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: '2ca22dc7f6214ec9b9d879bfb1560fca'
});

const spotifyLogin = (res) => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, false);
  res.send({spotifyAuth: false, authorizeURL});
}

router.use('/login', ((req, res) => {
// Create the authorization URL
  spotifyLogin(res);
  console.log('URL de Autorizacao:', authorizeURL);
}));


router.use('/callback', ((req, res) => {
  console.log('CODE:', req.query.code);

  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function (data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      res.send({
        auth: true,
      })
    },
    function (err) {
      console.log('Something went wrong!', err);
    }
  );


}));

router.get('/search', tokenVerification, (req, res) => {
  console.log('search')
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

router.get('/playlists', tokenVerification, ((req, res) => {
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

router.post('/playlist', tokenVerification, (req, res) => {
  spotifyApi.createPlaylist(req.userId, req.body.title)
    .then(value => res.send(value))
    .catch(e => res.send(e));
});

router.get('/playlist/:id', tokenVerification, (req, res) => {
  spotifyApi.getPlaylistTracks(req.params.id, {fields: 'items(track)'})
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